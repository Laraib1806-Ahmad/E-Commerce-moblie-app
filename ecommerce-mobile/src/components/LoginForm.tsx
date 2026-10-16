import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAppDispatch } from "../store/hooks";
import { login } from "../store/authSlice";
import { AppColors as Colors } from "../constants/colors";

export function LoginForm({
  onSwitchToRegister,
}: {
  onSwitchToRegister: () => void;
}) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    const role = email.toLowerCase().includes("admin") ? "admin" : "user";
    dispatch(login({ id: "1", name: email.split("@")[0], email, role }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToRegister} style={styles.switchLink}>
        <Text style={styles.switchText}>
          Dont have an Account? <Text style={styles.switchBold}>Register</Text>
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
