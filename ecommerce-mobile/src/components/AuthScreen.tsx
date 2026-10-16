import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return mode === "login" ? (
    <LoginForm onSwitchToRegister={() => setMode("register")} />
  ) : (
    <RegisterForm onSwitchToLogin={() => setMode("login")} />
  );
}
