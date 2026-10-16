import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { startImport, fetchImportStatus } from "@/lib/api";
import { ImportStatus, PickedFile } from "@/types/admin";
import { AppColors as Colors } from "@/constants/colors";

export default function AdminImport() {
  const [file, setFile] = useState<(PickedFile & { size?: number }) | null>(
    null,
  );
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const a = res.assets[0];
    // Backend decides CSV vs Excel using a case-sensitive ".csv" check,
    // so the name is lower-cased here.
    const name = a.name.toLowerCase();
    if (!/\.(csv|xlsx|xls)$/.test(name)) {
      setError("Please select a .csv or .xlsx file");
      return;
    }
    setError("");
    setFile({
      uri: a.uri,
      name,
      type: a.mimeType ?? "application/octet-stream",
      size: a.size,
    });
  };

  const start = async () => {
    if (!file) return;
    setStarting(true);
    setError("");
    try {
      const res = await startImport(file);
      setStatus(null);
      setJobId(res.jobId);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      try {
        const s = await fetchImportStatus(jobId);
        if (stopped) return;
        setStatus(s);
        if (s.state === "completed" || s.state === "failed") return;
        timer = setTimeout(tick, 1000);
      } catch (e: any) {
        if (!stopped) setError(e.message);
      }
    };
    tick();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId]);

  const reset = () => {
    setFile(null);
    setJobId(null);
    setStatus(null);
    setError("");
  };

  const progress = typeof status?.progress === "number" ? status.progress : 0;
  const done = status?.state === "completed";
  const failed = status?.state === "failed";
  const running = !!jobId && !done && !failed;
  const result = status?.result;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Import Products</Text>
        <Text style={styles.subtitle}>
          Bulk add products using a CSV or Excel file.
        </Text>

        {!jobId && (
          <>
            <TouchableOpacity style={styles.dropBox} onPress={pickFile}>
              <Text style={styles.dropIcon}>📄</Text>
              <Text style={styles.dropText}>
                {file ? file.name : "Select a file"}
              </Text>
              <Text style={styles.dropHint}>
                {file?.size
                  ? `${(file.size / 1024).toFixed(1)} KB`
                  : "CSV / XLSX"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.columns}>
              Required columns: productName, category, price, brandName{"\n"}
              Optional: rating, description, brandCountry
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, !file && { opacity: 0.4 }]}
              onPress={start}
              disabled={!file || starting}
            >
              {starting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Start Import</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {running && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Importing Products</Text>
            <Text style={styles.muted}>{file?.name}</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.percent}>{progress}%</Text>
            <Text style={styles.muted}>Job ID #{jobId}</Text>
          </View>
        )}

        {failed && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: "#C0392B" }]}>
              Import failed
            </Text>
            <Text style={styles.muted}>
              The server could not process this file. Check the columns and try
              again.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={reset}>
              <Text style={styles.primaryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {done && result && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Import Completed ✓</Text>
              <View style={styles.statRow}>
                <Text style={styles.muted}>Total rows</Text>
                <Text style={styles.stat}>{result.total}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.muted}>Inserted</Text>
                <Text style={styles.stat}>{result.inserted}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.muted}>Failed</Text>
                <Text
                  style={[
                    styles.stat,
                    result.failed > 0 && { color: "#C0392B" },
                  ]}
                >
                  {result.failed}
                </Text>
              </View>
            </View>

            {result.errors.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Import Issues</Text>
                <Text style={styles.muted}>
                  {result.errors.length} rows couldn't be imported
                </Text>
                {result.errors.map((err, i) => {
                  const idx = err.indexOf(": ");
                  const row = idx > -1 ? err.slice(0, idx) : "Row";
                  const msg = idx > -1 ? err.slice(idx + 2) : err;
                  return (
                    <View key={i} style={styles.errRow}>
                      <Text style={styles.errRowTitle}>{row}</Text>
                      <Text style={styles.errMsg}>{msg}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={reset}>
              <Text style={styles.primaryText}>Done</Text>
            </TouchableOpacity>
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 24, fontWeight: "700", color: Colors.text },
  subtitle: { color: Colors.mutedText, marginTop: 4, marginBottom: 20 },
  dropBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.peach,
    backgroundColor: Colors.lightPeach,
    borderRadius: 20,
    paddingVertical: 36,
    alignItems: "center",
  },
  dropIcon: { fontSize: 36 },
  dropText: { fontWeight: "600", color: Colors.text, marginTop: 8 },
  dropHint: { color: Colors.mutedText, fontSize: 12, marginTop: 2 },
  columns: {
    color: Colors.mutedText,
    fontSize: 12,
    marginTop: 16,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: Colors.darkOlive,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  muted: { color: Colors.mutedText, fontSize: 13 },
  barBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.lightPeach,
    marginTop: 16,
    overflow: "hidden",
  },
  barFill: { height: 10, backgroundColor: Colors.olive },
  percent: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginVertical: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  stat: { fontWeight: "700", color: Colors.text },
  errRow: { borderTopWidth: 1, borderTopColor: "#f0eee8", paddingVertical: 10 },
  errRowTitle: { fontWeight: "700", color: Colors.text },
  errMsg: { color: Colors.mutedText, marginTop: 2 },
  error: { color: "#C0392B", marginTop: 16 },
});
