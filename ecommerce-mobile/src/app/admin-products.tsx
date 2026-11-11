import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { fetchProducts, deleteProduct } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { ProductFormModal } from "@/components/ProductFormModal";
import { Product } from "@/types/product";
import { AppColors as Colors } from "@/constants/colors";

export default function AdminProducts() {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState(""); // debounced search
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async (targetPage: number, q: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(targetPage),
        limit: "10",
      };
      if (q.trim()) params.search = q.trim();
      const res = await fetchProducts(params);
      setItems((prev) =>
        targetPage === 1 ? res.data : [...prev, ...res.data],
      );
      setPage(res.meta.page);
      setTotalPages(res.meta.totalPages);
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(1, query);
    }, [load, query]),
  );

  const loadMore = () => {
    if (loading || page >= totalPages) return;
    load(page + 1, query);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load(1, query);
    setRefreshing(false);
  };

  const confirmDelete = (p: Product) => {
    Alert.alert(
      "Delete Product?",
      `Are you sure you want to permanently delete "${p.productName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(p.id);
              setItems((prev) => prev.filter((x) => x.id !== p.id));
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setEditing(null);
              setFormVisible(true);
            }}
          >
            <Text style={styles.addText}>＋ Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => dispatch(logout())}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.imageUrl || undefined }}
              style={styles.thumb}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {item.productName}
              </Text>
              <Text style={styles.meta}>
                {item.brand.name} · {item.category}
              </Text>
              <Text style={styles.price}>
                ${item.price} ⭐ {item.rating}
              </Text>
            </View>
            <View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  setEditing(item);
                  setFormVisible(true);
                }}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => confirmDelete(item)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No products found</Text> : null
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              style={{ marginVertical: 16 }}
              color={Colors.olive}
            />
          ) : null
        }
      />

      <ProductFormModal
        visible={formVisible}
        product={editing}
        onClose={() => setFormVisible(false)}
        onSaved={() => {
          setFormVisible(false);
          load(1, query);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: { fontSize: 24, fontWeight: "700", color: Colors.text },
  addBtn: {
    backgroundColor: Colors.darkOlive,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addText: { color: "#fff", fontWeight: "700" },
  logoutBtn: {
    backgroundColor: Colors.lightPeach,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginLeft: 8,
  },
  logoutText: { color: Colors.darkOlive, fontWeight: "700" },
  search: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    margin: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#eee",
  },
  error: { color: "#C0392B", textAlign: "center", marginTop: 12 },
  empty: { textAlign: "center", color: Colors.mutedText, marginTop: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: Colors.lightPeach,
  },
  name: { fontWeight: "600", color: Colors.text, fontSize: 15 },
  meta: { color: Colors.mutedText, fontSize: 12, marginTop: 2 },
  price: { color: Colors.text, fontSize: 13, marginTop: 4 },
  editBtn: {
    backgroundColor: Colors.olive,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 6,
  },
  editText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  deleteBtn: {
    backgroundColor: "#FDECEA",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  deleteText: {
    color: "#C0392B",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
});
