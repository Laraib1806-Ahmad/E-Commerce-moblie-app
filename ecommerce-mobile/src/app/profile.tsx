import { AppColors as Colors } from "@/constants/colors";
import { logout } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push("/favorites")}
      >
        <Text style={styles.rowText}>Favorites</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => dispatch(logout())}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.background },
  name: { fontSize: 24, fontWeight: "700", color: Colors.text },
  email: { color: Colors.mutedText, marginTop: 4, marginBottom: 24 },
  row: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  rowText: { fontSize: 15, color: Colors.text, fontWeight: "600" },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: Colors.lightPeach,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  logoutText: { color: Colors.darkOlive, fontWeight: "700" },
});
