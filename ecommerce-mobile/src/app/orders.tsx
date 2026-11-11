import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { fetchOrders, type Order } from "@/lib/orders";

function OrderCard({ order }: { order: Order }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <ThemedText type="smallBold">Order #{order.id}</ThemedText>
        <ThemedText>
          {new Date(order.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>

      {order.items.map((item) => (
        <View key={item.id} style={styles.row}>
          <ThemedText style={styles.itemName}>
            {item.quantity} x {item.productName}
          </ThemedText>
          <ThemedText>
            ${(item.unitPrice * item.quantity).toFixed(2)}
          </ThemedText>
        </View>
      ))}

      <View style={[styles.row, styles.totalRow]}>
        <ThemedText type="smallBold">Total</ThemedText>
        <ThemedText type="smallBold">
          ${Number(order.total).toFixed(2)}
        </ThemedText>
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  return (
    <SafeAreaView style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        My Orders
      </ThemedText>

      {isLoading ? (
        <ActivityIndicator style={styles.center} />
      ) : isError ? (
        <ThemedText style={styles.center}>
          Could not load orders: {(error as Error).message}
        </ThemedText>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(o) => String(o.id)}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <ThemedText style={styles.center}>No orders yet.</ThemedText>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { paddingHorizontal: 16, paddingTop: 8 },
  list: { padding: 16, gap: 12 },
  center: { marginTop: 40, textAlign: "center" },
  card: {
    padding: 14,
    borderRadius: 12,
    gap: 6,
    backgroundColor: "rgba(128,128,128,0.12)",
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  itemName: { flexShrink: 1 },
  totalRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.5)",
  },
});
