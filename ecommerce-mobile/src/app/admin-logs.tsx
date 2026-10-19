import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { fetchAuditLogs } from "@/lib/api";
import { AuditLogEntry } from "@/types/admin";
import { AppColors as Colors } from "@/constants/colors";

const ACTION_COLORS = {
  CREATE: { bg: "#E6EEDB", fg: Colors.darkOlive, label: "Product Created" },
  UPDATE: { bg: Colors.lightPeach, fg: "#9A5B43", label: "Product Updated" },
  DELETE: { bg: "#FDECEA", fg: "#C0392B", label: "Product Deleted" },
} as const;

function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString())
    return `Yesterday, ${time}`;
  return `${d.toLocaleDateString()}, ${time}`;
}

function itemTitle(log: AuditLogEntry) {
  return log.details?.productName ?? `${log.entityName} #${log.entityId}`;
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs(targetPage);
      setLogs((prev) => (targetPage === 1 ? res.data : [...prev, ...res.data]));
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
      load(1);
    }, [load]),
  );

  const loadMore = () => {
    if (loading || page >= totalPages) return;
    load(page + 1);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load(1);
    setRefreshing(false);
  };

  const before = selected?.details?.before as Record<string, any> | undefined;
  const after = selected?.details?.after as Record<string, any> | undefined;
  const diffKeys =
    before || after
      ? Array.from(
          new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]),
        )
      : [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Activity</Text>
      <Text style={styles.subtitle}>Audit log of all product changes</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={logs}
        keyExtractor={(l) => l.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          const c = ACTION_COLORS[item.action];
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => setSelected(item)}
            >
              <View style={[styles.dot, { backgroundColor: c.fg }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{c.label}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {itemTitle(item)}
                </Text>
                <Text style={styles.rowTime}>{formatWhen(item.createdAt)}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: c.bg }]}>
                <Text style={[styles.badgeText, { color: c.fg }]}>
                  {item.action}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No activity yet</Text> : null
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

      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Activity Details</Text>
            {selected && (
              <>
                <Text style={styles.sheetAction}>{selected.action}</Text>
                <Text style={styles.rowSub}>
                  {selected.entityName} #{selected.entityId}
                </Text>
                <Text style={styles.rowTime}>
                  {new Date(selected.createdAt).toLocaleString()}
                </Text>

                {diffKeys.length > 0 ? (
                  <View style={{ marginTop: 16 }}>
                    <View style={styles.diffHead}>
                      <Text style={[styles.diffCell, { flex: 1.2 }]}>
                        Field
                      </Text>
                      <Text style={styles.diffCell}>Before</Text>
                      <Text style={styles.diffCell}>After</Text>
                    </View>
                    {diffKeys.map((k) => {
                      const b = before?.[k];
                      const a = after?.[k];
                      const changed = String(b) !== String(a);
                      return (
                        <View key={k} style={styles.diffRow}>
                          <Text
                            style={[
                              styles.diffCell,
                              { flex: 1.2, fontWeight: "600" },
                            ]}
                          >
                            {k}
                          </Text>
                          <Text style={styles.diffCell}>{String(b)}</Text>
                          <Text
                            style={[styles.diffCell, changed && styles.changed]}
                          >
                            {String(a)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={{ marginTop: 16 }}>
                    {Object.entries(selected.details ?? {}).map(([k, v]) => (
                      <View key={k} style={styles.diffRow}>
                        <Text style={[styles.diffCell, { fontWeight: "600" }]}>
                          {k}
                        </Text>
                        <Text style={[styles.diffCell, { flex: 2 }]}>
                          {String(v)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelected(null)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  error: { color: "#C0392B", textAlign: "center", marginTop: 12 },
  empty: { textAlign: "center", color: Colors.mutedText, marginTop: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  rowTitle: { fontWeight: "600", color: Colors.text },
  rowSub: { color: Colors.text, marginTop: 2 },
  rowTime: { color: Colors.mutedText, fontSize: 12, marginTop: 2 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  sheetAction: { fontSize: 20, fontWeight: "700", color: Colors.darkOlive },
  diffHead: {
    flexDirection: "row",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e6df",
  },
  diffRow: { flexDirection: "row", paddingVertical: 8 },
  diffCell: { flex: 1, color: Colors.text, fontSize: 13 },
  changed: { color: Colors.olive, fontWeight: "700" },
  closeBtn: {
    backgroundColor: Colors.darkOlive,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  closeText: { color: "#fff", fontWeight: "700" },
});
