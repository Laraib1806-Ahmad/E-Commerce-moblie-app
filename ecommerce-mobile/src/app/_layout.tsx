import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";
import { Provider } from "react-redux";

import AppTabs from "@/components/app-tabs";
import { AuthScreen } from "@/components/AuthScreen";
import { store } from "@/store";
import { useAppSelector } from "@/store/hooks";

function RootContent() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? <AppTabs /> : <AuthScreen />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootContent />
      </ThemeProvider>
    </Provider>
  );
}
