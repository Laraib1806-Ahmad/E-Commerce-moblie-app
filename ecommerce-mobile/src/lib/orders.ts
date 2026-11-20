import { BASE_URL } from "./api";
import { supabase } from "./supabase";

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: number;
  total: number;
  status: "pending" | "paid";
  createdAt: string;
  items: OrderItem[];
};

export function fetchOrder(orderId: number) {
  return authFetch<Order>(`/orders/${orderId}`);
}

// Sends the logged in user's Supabase token with every request.
async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  return body as T;
}

export function createCheckout(
  items: { productId: number; quantity: number }[],
  shipping: { fullName: string; phone: string; address: string; city: string },
) {
  return authFetch<{ orderId: number; clientSecret: string }>(
    "/orders/checkout",
    { method: "POST", body: JSON.stringify({ items, shipping }) },
  );
}
export async function waitUntilPaid(
  orderId: number,
  tries = 10,
  delayMs = 1000,
) {
  for (let i = 0; i < tries; i++) {
    const order = await fetchOrder(orderId);
    if (order.status === "paid") return true;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}

export function fetchOrders() {
  return authFetch<Order[]>("/orders");
}
