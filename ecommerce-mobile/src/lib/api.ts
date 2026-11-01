import { Platform } from "react-native";
import {
  AuditLogEntry,
  ImportStatus,
  PaginatedResponse,
  PickedFile,
} from "../types/admin";
import { Brand, Product } from "../types/product";

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.100.217:9999";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);
  let body: any = null;
  try {
    body = await res.json();
  } catch {}
  if (!res.ok) {
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }
  return body as T;
}
async function appendImageFile(
  form: FormData,
  field: string,
  file: PickedFile,
) {
  if (Platform.OS === "web") {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    form.append(field, blob, file.name);
  } else {
    form.append(field, file as any);
  }
}

export function fetchCategories() {
  return request<string[]>("/categories");
}

export function fetchBrands() {
  return request<Brand[]>("/brands");
}

export function fetchProducts(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return request<PaginatedResponse<Product>>(`/products?${query}`);
}

export interface ProductInput {
  productName: string;
  category: string;
  price: number;
  rating: number;
  description: string;
  favorite: boolean;
}

export async function createProduct(
  input: ProductInput & { brandName: string },
  image?: PickedFile,
) {
  const form = new FormData();
  form.append("productName", input.productName);
  form.append("category", input.category);
  form.append("price", String(input.price));
  form.append("rating", String(input.rating));
  form.append("description", input.description);
  form.append("favorite", String(input.favorite));
  form.append("brandName", input.brandName);
  if (image) await appendImageFile(form, "image", image);
  return request<Product>("/products", { method: "POST", body: form });
}

export function updateProduct(
  id: number,
  changes: Partial<ProductInput> & { imageUrl?: string | null },
) {
  return request<Product>(`/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
}

export function deleteProduct(id: number) {
  return request<{ message: string }>(`/products/${id}`, { method: "DELETE" });
}

export async function uploadImage(image: PickedFile) {
  const form = new FormData();
  await appendImageFile(form, "image", image);
  return request<{ imageUrl: string }>("/upload/image", {
    method: "POST",
    body: form,
  });
}
export function startImport(file: PickedFile) {
  const form = new FormData();
  form.append("file", file as any);
  return request<{ message: string; jobId: string }>("/products/import", {
    method: "POST",
    body: form,
  });
}

export function fetchImportStatus(jobId: string) {
  return request<ImportStatus>(`/products/import/${jobId}/status`);
}

export function fetchAuditLogs(page: number, limit = 20) {
  return request<PaginatedResponse<AuditLogEntry>>(
    `/audit-logs?page=${page}&limit=${limit}`,
  );
}

export function fetchProductById(id: number) {
  return request<Product>(`/products/${id}`);
}
