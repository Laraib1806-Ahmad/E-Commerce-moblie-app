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

export function confirmOrder(orderId: number) {
  return authFetch<Order>(`/orders/${orderId}/confirm`, { method: "POST" });
}

export function fetchOrders() {
  return authFetch<Order[]>("/orders");
}
