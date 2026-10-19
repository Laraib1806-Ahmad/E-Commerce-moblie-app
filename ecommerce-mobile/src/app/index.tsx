import { FiltersModal } from "@/components/FiltersModal";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { AppColors as Colors } from "@/constants/colors";
import { fetchProductById } from "@/lib/api";
import { setPage, setSearch } from "@/store/filtersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadProducts } from "@/store/productsSlice";
import { Product } from "@/types/product";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const {
    items: products,
    meta,
    status,
    error,
  } = useAppSelector((s) => s.products);
  const filters = useAppSelector((s) => s.filters);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(loadProducts({}));
  }, [
    filters.search,
    filters.category,
    filters.brand,
    filters.priceMin,
    filters.priceMax,
    filters.ratingMin,
    filters.ratingMax,
    filters.favoriteOnly,
    filters.sortKey,
    filters.sortOrder,
  ]);
  useEffect(() => {
    const openFromUrl = async (url: string | null) => {
      if (!url) return;
      const { queryParams } = Linking.parse(url);
      const match = queryParams?.productId;
      if (!match) return;
      try {
        const product = await fetchProductById(Number(match[1]));
        setSelectedProduct(product);
      } catch {}
    };

    Linking.getInitialURL().then(openFromUrl);
    const sub = Linking.addEventListener("url", (e) => openFromUrl(e.url));
    return () => sub.remove();
  }, []);

  const handleLoadMore = () => {
    if (status === "loading" || meta.page >= meta.totalPages) return;
    dispatch(setPage(meta.page + 1));
    dispatch(loadProducts({ append: true }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    dispatch(setPage(1));
    await dispatch(loadProducts({}));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Discover</Text>

      <View style={styles.topBar}>
        <TextInput
          placeholder="Search products..."
          value={filters.search}
          onChangeText={(text) => dispatch(setSearch(text))}
          style={styles.search}
        />
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFiltersVisible(true)}
        >
          <Text style={styles.filterBtnText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {status === "failed" && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => setSelectedProduct(item)}
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          status === "succeeded" ? (
            <Text style={styles.empty}>No products found</Text>
          ) : null
        }
        ListFooterComponent={
          status === "loading" && products.length > 0 ? (
            <ActivityIndicator
              style={{ marginVertical: 16 }}
              color={Colors.olive}
            />
          ) : null
        }
      />

      {status === "loading" && products.length === 0 && (
        <ActivityIndicator
          size="large"
          color={Colors.olive}
          style={styles.centerLoader}
        />
      )}

      <FiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
      />
      <ProductDetailModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
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
  topBar: { flexDirection: "row", padding: 16, paddingBottom: 0 },
  search: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  filterBtn: {
    backgroundColor: Colors.darkOlive,
    borderRadius: 14,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  filterBtnText: { color: "#fff", fontWeight: "700" },
  error: { color: "#C0392B", textAlign: "center", marginTop: 20 },
  empty: { textAlign: "center", color: Colors.mutedText, marginTop: 40 },
  centerLoader: { position: "absolute", top: "40%", left: 0, right: 0 },
});
