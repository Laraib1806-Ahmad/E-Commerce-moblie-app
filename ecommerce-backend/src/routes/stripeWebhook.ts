import { Request, Response } from "express";
import Stripe from "stripe";
import { AppDataSource } from "../data-source";
import { Order } from "../entities/Order";
import { stripe } from "../stripe";

// Mark the order as paid after Stripe tells us the payment succeeded.
async function handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
  const orderId = Number(intent.metadata?.orderId);
  if (!Number.isInteger(orderId)) {
    console.warn("Webhook: payment intent has no orderId", intent.id);
    return;
  }

  const repo = AppDataSource.getRepository(Order);
  const order = await repo.findOne({
    where: { id: orderId, paymentIntentId: intent.id },
  });
  if (!order) {
    console.warn("Webhook: no matching order", intent.id);
    return;
  }

  // Stripe can send the same event more than once, so this must be safe to repeat.
  if (order.status === "paid") return;

  // Never trust the event alone: the amount paid must match our own total.
  const expectedCents = Math.round(Number(order.total) * 100);
  if (intent.amount_received !== expectedCents) {
    console.error("Webhook: amount mismatch", {
      orderId,
      expectedCents,
      received: intent.amount_received,
    });
    return;
  }

  order.status = "paid";
  await repo.save(order);
}

export async function stripeWebhookHandler(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    res.status(400).send("Missing signature");
    return;
  }

  // req.body is the raw body here. Stripe needs it to verify the signature.
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    console.error("Webhook signature check failed:", error.message);
    res.status(400).send("Invalid signature");
    return;
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        console.warn(
          "Payment failed:",
          (event.data.object as Stripe.PaymentIntent).id,
        );
        break;
      default:
        break; // Ignore events we do not use.
    }
    res.json({ received: true });
  } catch (error) {
    // A 500 makes Stripe retry the event later.
    console.error("Webhook handler error:", error);
    res.status(500).send("Webhook handler failed");
  }
}
