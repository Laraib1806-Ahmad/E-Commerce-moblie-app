import { AppColors as Colors } from "@/constants/colors";
import * as LocalAuthentication from "expo-local-authentication";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function BiometricGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState("");

  const unlock = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !enrolled) {
      setUnlocked(true);
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock ShopX",
    });
    if (result.success) setUnlocked(true);
    else setMessage("Authentication failed. Try again.");
  }, []);

  useEffect(() => {
    unlock();
  }, [unlock]);

  if (unlocked) return <>{children}</>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShopX is locked</Text>
      {message ? <Text style={styles.error}>{message}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={unlock}>
        <Text style={styles.buttonText}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    padding: 24,
  },
  title: { fontSize: 22, fontWeight: "700", color: Colors.text },
  error: { color: "#C0392B", marginTop: 12 },
  button: {
    backgroundColor: Colors.darkOlive,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
