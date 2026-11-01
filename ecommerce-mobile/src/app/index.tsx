import { FiltersModal } from "@/components/FiltersModal";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { AppColors as Colors } from "@/constants/colors";
import { useProductsQuery } from "@/hooks/useProductsQuery";
import { fetchProductById } from "@/lib/api";
import { setPage, setSearch } from "@/store/filtersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadProducts } from "@/store/productsSlice";
import { Product } from "@/types/product";
import * as Linking from "expo-linking";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const filters = useAppSelector((s) => s.filters);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isLoading,
    isError,
    error,
  } = useProductsQuery();
  const skipFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (skipFirstFocus.current) {
        skipFirstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );
  const products = data?.pages.flatMap((p) => p.data) ?? [];

  useEffect(() => {
    const openFromUrl = async (url: string | null) => {
      if (!url) return;
      const { queryParams } = Linking.parse(url);
      const raw = queryParams?.productId;
      const productId = Number(Array.isArray(raw) ? raw[0] : raw);
      if (!productId) return;
      try {
        const product = await fetchProductById(productId);
        setSelectedProduct(product);
      } catch {}
    };

    Linking.getInitialURL().then(openFromUrl);
    const sub = Linking.addEventListener("url", (e) => openFromUrl(e.url));
    return () => sub.remove();
  }, []);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
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

      {isError && <Text style={styles.error}>{(error as Error).message}</Text>}
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
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
          />
        }
        ListEmptyComponent={
          !isLoading && !isError ? (
            <Text style={styles.empty}>No products found</Text>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              style={{ marginVertical: 16 }}
              color={Colors.olive}
            />
          ) : null
        }
      />
      {isLoading && (
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
