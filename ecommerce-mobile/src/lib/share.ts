import * as Linking from "expo-linking";
import { Share } from "react-native";

import type { Product } from "@/types/product";

// The link carries the product id. The Home screen already opens it from the URL.
export async function shareProduct(product: Product) {
  const link = Linking.createURL("/", {
    queryParams: { productId: String(product.id) },
  });
  await Share.share({
    message: `Check out ${product.productName} for $${Number(product.price).toFixed(2)}\n${link}`,
  });
}
