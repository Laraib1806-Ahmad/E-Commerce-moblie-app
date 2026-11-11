import { Router } from "express";
import Stripe from "stripe";
import { In } from "typeorm";
import { AppDataSource } from "../data-source";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Product } from "../entities/Product";
import { AuthedRequest, requireAuth } from "../middleware/auth";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const orderRepository = AppDataSource.getRepository(Order);
const productRepository = AppDataSource.getRepository(Product);

router.use(requireAuth);

router.post("/checkout", async (req, res) => {
  try {
    const user = (req as AuthedRequest).user!;
    const { items, shipping } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      res.status(400).json({ message: "Cart is empty or too large" });
      return;
    }
    for (const i of items) {
      if (
        !Number.isInteger(i.productId) ||
        !Number.isInteger(i.quantity) ||
        i.quantity < 1 ||
        i.quantity > 99
      ) {
        res.status(400).json({ message: "Invalid cart item" });
        return;
      }
    }
    if (
      !shipping?.fullName ||
      !shipping?.phone ||
      !shipping?.address ||
      !shipping?.city
    ) {
      res.status(400).json({ message: "Shipping details are required" });
      return;
    }

    // Merge duplicate product ids.
    const wanted = new Map<number, number>();
    for (const i of items) {
      wanted.set(i.productId, (wanted.get(i.productId) ?? 0) + i.quantity);
    }

    const products = await productRepository.find({
      where: { id: In([...wanted.keys()]) },
    });
    if (products.length !== wanted.size) {
      res.status(400).json({ message: "Some products no longer exist" });
      return;
    }

    // Stripe counts money in cents.
    let totalCents = 0;
    const orderItems = products.map((p) => {
      const quantity = wanted.get(p.id)!;
      totalCents += Math.round(p.price * 100) * quantity;
      const item = new OrderItem();
      item.productId = p.id;
      item.productName = p.productName;
      item.unitPrice = p.price;
      item.quantity = quantity;
      return item;
    });

    const order = orderRepository.create({
      userId: user.id,
      userEmail: user.email,
      total: totalCents / 100,
      status: "pending",
      fullName: String(shipping.fullName),
      phone: String(shipping.phone),
      address: String(shipping.address),
      city: String(shipping.city),
      items: orderItems,
    });
    await orderRepository.save(order);

    const intent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: String(order.id), userId: user.id },
    });
    order.paymentIntentId = intent.id;
    await orderRepository.save(order);

    res.json({ orderId: order.id, clientSecret: intent.client_secret });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2. After the payment sheet succeeds, ask Stripe directly if the money arrived.
router.post("/:id/confirm", async (req, res) => {
  try {
    const user = (req as AuthedRequest).user!;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: "Invalid order id" });
      return;
    }

    const order = await orderRepository.findOne({
      where: { id, userId: user.id },
      relations: { items: true },
    });
    if (!order || !order.paymentIntentId) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    if (order.status === "paid") {
      res.json(order);
      return;
    }

    const intent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
    if (intent.status !== "succeeded") {
      res
        .status(400)
        .json({ message: `Payment not completed (${intent.status})` });
      return;
    }

    order.status = "paid";
    await orderRepository.save(order);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 3. The logged in user's paid orders, newest first.
router.get("/", async (req, res) => {
  try {
    const user = (req as AuthedRequest).user!;
    const orders = await orderRepository.find({
      where: { userId: user.id, status: "paid" },
      relations: { items: true },
      order: { createdAt: "DESC" },
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
