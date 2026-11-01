import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { ActivityIndicator, AppState, useColorScheme } from "react-native";
import { Provider } from "react-redux";
import { focusManager, QueryClient } from "@tanstack/react-query";
import AppTabs from "@/components/app-tabs";
import { AuthScreen } from "@/components/AuthScreen";
import { store } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { useAuthSync } from "@/lib/useAuthSync";
import { BiometricGate } from "../components/BiometricGate";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

const ONE_DAY = 1000 * 60 * 60 * 24;

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: ONE_DAY } },
});

const persister = createAsyncStoragePersister({ storage: AsyncStorage });
function RootContent() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const ready = useAuthSync();
  if (!ready) return <ActivityIndicator style={{ flex: 1 }} />;
  return isAuthenticated ? (
    <BiometricGate>
      <AppTabs />
    </BiometricGate>
  ) : (
    <AuthScreen />
  );
}
export default function TabLayout() {
  const colorScheme = useColorScheme();
  useEffect(() => {
    const sub = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });
    return () => sub.remove();
  }, []);
  return (
    <Provider store={store}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: ONE_DAY }}
      >
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <RootContent />
        </ThemeProvider>
      </PersistQueryClientProvider>
    </Provider>
  );
}
