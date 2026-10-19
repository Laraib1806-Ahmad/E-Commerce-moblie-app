import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAppDispatch } from "../store/hooks";
import { register, Role } from "../store/authSlice";
import { AppColors as Colors } from "../constants/colors";

export function RegisterForm({
  onSwitchToLogin,
}: {
  onSwitchToLogin: () => void;
}) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [error, setError] = useState("");

  const handleRegister = () => {
    if (!name || !email || !password) {
      setError("Fill all fields");
      return;
    }
    dispatch(register({ id: Date.now().toString(), name, email, role }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Register to get started</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.label}>I am </Text>
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleChip, role === "user" && styles.roleChipActive]}
          onPress={() => setRole("user")}
        >
          <Text
            style={[styles.roleText, role === "user" && styles.roleTextActive]}
          >
            User
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleChip, role === "admin" && styles.roleChipActive]}
          onPress={() => setRole("admin")}
        >
          <Text
            style={[styles.roleText, role === "admin" && styles.roleTextActive]}
          >
            Admin
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToLogin} style={styles.switchLink}>
        <Text style={styles.switchText}>
          Already have an account? <Text style={styles.switchBold}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    justifyContent: "center",
  },
  title: { fontSize: 26, fontWeight: "700", color: Colors.text },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedText,
    marginTop: 4,
    marginBottom: 24,
  },
  error: { color: "#C0392B", marginBottom: 12 },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  roleRow: { flexDirection: "row", marginBottom: 20 },
  roleChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: Colors.lightPeach,
    marginRight: 10,
  },
  roleChipActive: { backgroundColor: Colors.olive },
  roleText: { color: Colors.text, fontWeight: "600" },
  roleTextActive: { color: "#fff" },
  button: {
    backgroundColor: Colors.darkOlive,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  switchLink: { marginTop: 20, alignItems: "center" },
  switchText: { color: Colors.mutedText, fontSize: 13 },
  switchBold: { color: Colors.olive, fontWeight: "700" },
});
