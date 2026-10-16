import { AppColors as Colors } from "@/constants/colors";
import { removeFromCart, updateQuantity } from "@/store/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.empty} edges={["top"]}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Your Cart</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.product.imageUrl || undefined }}
              style={styles.image}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.product.productName}</Text>
              <Text style={styles.price}>${item.product.price}</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() =>
                    dispatch(
                      updateQuantity({
                        productId: item.product.id,
                        quantity: item.quantity - 1,
                      }),
                    )
                  }
                >
                  <Text style={styles.stepText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qty}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() =>
                    dispatch(
                      updateQuantity({
                        productId: item.product.id,
                        quantity: item.quantity + 1,
                      }),
                    )
                  }
                >
                  <Text style={styles.stepText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => dispatch(removeFromCart(item.product.id))}
            >
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.total}>${total.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.checkoutBtn}>
        <Text style={styles.checkoutText}>Checkout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  emptyText: { color: Colors.mutedText, fontSize: 16 },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: Colors.lightPeach,
  },
  info: { flex: 1 },
  name: { fontWeight: "600", color: Colors.text },
  price: { color: Colors.mutedText, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.lightPeach,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  stepText: { fontSize: 16, color: Colors.darkOlive },
  qty: { fontWeight: "600", marginRight: 10, color: Colors.text },
  remove: { color: "#C0392B", fontSize: 12, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  totalLabel: { color: Colors.mutedText },
  total: { fontWeight: "700", fontSize: 18, color: Colors.text },
  checkoutBtn: {
    backgroundColor: Colors.darkOlive,
    margin: 20,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
