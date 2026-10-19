import { AppColors as Colors } from "@/constants/colors";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { addToCart } from "../store/cartSlice";
import { useAppDispatch } from "../store/hooks";
import { toggleFavorite } from "../store/productsSlice";
import { Product } from "../types/product";
export function ProductDetailModal({
  product,
  visible,
  onClose,
}: {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(product?.favorite ?? false);

  useEffect(() => {
    setFav(product?.favorite ?? false);
  }, [product]);
  if (!product) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <Image
          source={{ uri: product.imageUrl || undefined }}
          style={styles.image}
        />

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.title}>{product.productName}</Text>
            <TouchableOpacity
              onPress={() => {
                dispatch(toggleFavorite({ ...product, favorite: fav }));
                setFav(!fav);
              }}
            >
              <Text style={styles.favIcon}>{fav ? "❤️" : "🤍"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.brand}>
            {product.brand.name} · {product.brand.country}
          </Text>

          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.category}</Text>
            </View>
            <Text style={styles.rating}>⭐ {product.rating}</Text>
          </View>

          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.qtyRow}>
            <Text style={styles.label}>Quantity</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Text style={styles.stepText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQty((q) => q + 1)}
              >
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.price}>${(product.price * qty).toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => {
            dispatch(addToCart({ product, quantity: qty }));
            onClose();
          }}
        >
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: Colors.white,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  closeText: { fontSize: 16, color: Colors.text },
  image: { width: "100%", height: 320, backgroundColor: Colors.lightPeach },
  content: { padding: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  favIcon: { fontSize: 22 },
  brand: { color: Colors.mutedText, marginTop: 4, fontSize: 14 },
  badgesRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  badge: {
    backgroundColor: Colors.lightPeach,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  badgeText: { color: Colors.darkOlive, fontSize: 12, fontWeight: "600" },
  rating: { fontSize: 13, color: Colors.text },
  description: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.mutedText,
    lineHeight: 21,
  },
  qtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  label: { fontSize: 14, fontWeight: "600", color: Colors.text },
  stepper: { flexDirection: "row", alignItems: "center" },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightPeach,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 7,
  },
  stepText: { fontSize: 18, color: Colors.darkOlive },
  qtyText: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
    color: Colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e8e6df",
    backgroundColor: Colors.background,
  },
  priceLabel: { fontSize: 12, color: Colors.mutedText },
  price: { fontSize: 20, fontWeight: "700", color: Colors.darkOlive },
  cartBtn: {
    backgroundColor: Colors.darkOlive,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  cartBtnText: { color: "#fff", fontWeight: "700" },
});
