import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppColors as Colors } from "../constants/colors";
import { useAppDispatch } from "../store/hooks";
import { toggleFavorite } from "../store/productsSlice";
import { Product } from "../types/product";
export function ProductCard({
  product,
  onPress,
  onToggleFavorite,
}: {
  product: Product;
  onPress: () => void;
  onToggleFavorite?: () => void;
}) {
  const dispatch = useAppDispatch();
  const handleFavorite =
    onToggleFavorite ?? (() => dispatch(toggleFavorite(product)));

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{ uri: product.imageUrl || undefined }}
        style={styles.image}
      />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>
            {product.productName}
          </Text>
          <TouchableOpacity onPress={handleFavorite}>
            <Text>{product.favorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.brand}>{product.brand.name}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>${product.price}</Text>
          <Text style={styles.rating}>⭐ {product.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  image: { width: "100%", height: 150, backgroundColor: Colors.lightPeach },
  body: { padding: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
    color: Colors.text,
    flex: 1,
    marginRight: 6,
  },
  brand: {
    color: Colors.mutedText,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
  price: { fontWeight: "700", fontSize: 15, color: Colors.darkOlive },
  rating: { fontSize: 12, color: Colors.text },
});
