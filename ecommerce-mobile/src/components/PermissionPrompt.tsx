import { Linking, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

type Props = {
  title: string;
  message: string;
  // false means the user chose "don't ask again", so only Settings can help.
  canAskAgain: boolean;
  onRequest: () => void;
};

export function PermissionPrompt({
  title,
  message,
  canAskAgain,
  onRequest,
}: Props) {
  return (
    <View style={styles.box}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText style={styles.text}>{message}</ThemedText>
      <Pressable
        style={styles.button}
        onPress={canAskAgain ? onRequest : () => Linking.openSettings()}
      >
        <ThemedText type="smallBold" style={styles.buttonText}>
          {canAskAgain ? "Allow access" : "Open settings"}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  text: { textAlign: "center" },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: { color: "#fff" },
});
