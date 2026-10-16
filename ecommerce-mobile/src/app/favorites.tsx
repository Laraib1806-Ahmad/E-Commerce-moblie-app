import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { AppColors as Colors } from "@/constants/colors";
import { fetchProducts, updateProduct } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setFavoriteLocal } from "@/store/productsSlice";
import { Product } from "@/types/product";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritesScreen() {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetchProducts({
        page: "1",
        limit: "50",
        favorite: "true",
      });
      setProducts(res.data);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  // Runs every time this tab comes into focus.
  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const removeFavorite = async (p: Product) => {
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    dispatch(setFavoriteLocal({ id: p.id, favorite: false }));
    try {
      await updateProduct(p.id, { favorite: false });
    } catch {
      load();
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={Colors.olive}
        style={styles.centerLoader}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.subtitle}>Your saved products</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => setSelectedProduct(item)}
            onToggleFavorite={() => removeFavorite(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>You have no favorite products yet</Text>
        }
      />
      <ProductDetailModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => {
          setSelectedProduct(null);
          load();
        }}
      />
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
  subtitle: { color: Colors.mutedText, paddingHorizontal: 16, marginTop: 2 },
  empty: { textAlign: "center", color: Colors.mutedText, marginTop: 40 },
  error: { color: "#C0392B", textAlign: "center", marginTop: 20 },
  centerLoader: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
});
