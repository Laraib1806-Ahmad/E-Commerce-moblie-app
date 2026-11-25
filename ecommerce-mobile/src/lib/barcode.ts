import type { Product } from "@/types/product";

import { BASE_URL } from "./api";

export async function fetchProductByBarcode(
  code: string,
): Promise<Product | null> {
  const res = await fetch(
    `${BASE_URL}/products/barcode/${encodeURIComponent(code)}`,
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}
