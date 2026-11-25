import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Pressable } from "react-native";
import { addDeliveryReminder } from "@/lib/calendar";
import { shareInvoice, viewInvoice } from "@/lib/invoice";
import { ThemedText } from "@/components/themed-text";
import { fetchOrders, type Order } from "@/lib/orders";
import { AppColors as Colors } from "@/constants/colors";

function OrderCard({ order }: { order: Order }) {
  const run = async (action: () => Promise<unknown>, failTitle: string) => {
    try {
      await action();
    } catch (error) {
      Alert.alert(failTitle, (error as Error).message);
    }
  };
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <ThemedText type="smallBold" style={styles.text}>
          Order #{order.id}
        </ThemedText>
        <ThemedText style={styles.muted}>
          {new Date(order.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>

      {order.items.map((item) => (
        <View key={item.id} style={styles.row}>
          <ThemedText style={[styles.itemName, styles.text]}>
            {item.quantity} x {item.productName}
          </ThemedText>
          <ThemedText style={styles.text}>
            ${(item.unitPrice * item.quantity).toFixed(2)}
          </ThemedText>
        </View>
      ))}

      <View style={[styles.row, styles.totalRow]}>
        <ThemedText type="smallBold" style={styles.text}>
          Total
        </ThemedText>
        <ThemedText type="smallBold" style={styles.totalAmount}>
          ${Number(order.total).toFixed(2)}
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.actionBtn}
          onPress={() =>
            run(() => viewInvoice(order), "Could not open invoice")
          }
        >
          <ThemedText type="smallBold" style={styles.actionText}>
            View invoice
          </ThemedText>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() =>
            run(() => shareInvoice(order), "Could not share invoice")
          }
        >
          <ThemedText type="smallBold" style={styles.actionText}>
            Share PDF
          </ThemedText>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() =>
            run(async () => {
              const result = await addDeliveryReminder(order.id);
              Alert.alert(
                result.ok ? "Reminder added" : "Not added",
                result.ok
                  ? `Reminder set for ${result.when.toLocaleString()}.`
                  : "Please allow calendar access.",
              );
            }, "Could not add reminder")
          }
        >
          <ThemedText type="smallBold" style={styles.actionText}>
            Add reminder
          </ThemedText>
        </Pressable>
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
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ThemedText type="title" style={styles.title}>
        My Orders
      </ThemedText>

      {isLoading ? (
        <ActivityIndicator style={styles.center} color={Colors.olive} />
      ) : isError ? (
        <ThemedText style={[styles.center, styles.errorText]}>
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
            <ThemedText style={[styles.center, styles.muted]}>
              No orders yet.
            </ThemedText>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  title: {
    paddingHorizontal: 16,
    paddingTop: 8,
    color: Colors.text,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
  },
  list: { padding: 16, gap: 12 },
  center: { marginTop: 40, textAlign: "center" },
  text: { color: Colors.text },
  muted: { color: Colors.mutedText },
  errorText: { color: "#C0392B" },
  actions: { flexDirection: "row", gap: 8, marginTop: 8 },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: Colors.lightPeach,
  },
  actionText: { color: Colors.darkOlive, fontSize: 12, textAlign: "center" },
  card: {
    padding: 14,
    borderRadius: 16,
    gap: 6,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#eee",
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  itemName: { flexShrink: 1 },
  totalRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e8e6df",
  },
  totalAmount: { color: Colors.darkOlive },
});
