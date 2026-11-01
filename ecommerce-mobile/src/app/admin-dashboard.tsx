import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { AppColors as Colors } from "@/constants/colors";

export default function AdminDashboard() {
  const dispatch = useAppDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Product management tools coming here</Text>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => dispatch(logout())}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "700", color: Colors.text },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedText,
    marginTop: 8,
    textAlign: "center",
  },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: Colors.darkOlive,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 14,
  },
  logoutText: { color: "#fff", fontWeight: "700" },
});
