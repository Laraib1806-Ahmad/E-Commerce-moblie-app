import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { AppColors as Colors } from "../constants/colors";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {mode === "login" ? (
          <LoginForm onSwitchToRegister={() => setMode("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setMode("login")} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
