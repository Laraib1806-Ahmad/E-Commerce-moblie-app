import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(3, "Enter your full name"),
  phone: z.string().regex(/^\+?\d{10,13}$/, "Enter a valid phone number"),
  address: z.string().min(10, "Enter your full address"),
  city: z.string().min(2, "Enter your city"),
});

export type CheckoutForm = z.infer<typeof checkoutSchema>;
