import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { AppColors as Colors } from "@/constants/colors";
import { fetchProducts } from "@/lib/api";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchProducts({
          search: query.trim(),
          page: "1",
          limit: "20",
        });
        setResults(res.data);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Search</Text>
      <TextInput
        style={styles.input}
        placeholder="Search products..."
        value={query}
        onChangeText={setQuery}
        autoFocus
      />
      {loading && (
        <ActivityIndicator style={{ marginTop: 20 }} color={Colors.olive} />
      )}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => setSelectedProduct(item)}
          />
        )}
        ListEmptyComponent={
          query && !loading ? (
            <Text style={styles.empty}>No results for "{query}"</Text>
          ) : null
        }
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
  input: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    margin: 16,
    marginBottom: 0,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  empty: { textAlign: "center", color: Colors.mutedText, marginTop: 40 },
});
