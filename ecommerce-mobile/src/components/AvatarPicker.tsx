import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { ThemedText } from "@/components/themed-text";
import { supabase } from "@/lib/supabase";

export function AvatarPicker() {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUrl(data.user?.user_metadata?.avatar_url ?? null);
    });
  }, []);

  async function pick(source: "camera" | "library") {
    try {
      if (source === "camera") {
        let permission = await ImagePicker.getCameraPermissionsAsync();
        if (!permission.granted && permission.canAskAgain) {
          permission = await ImagePicker.requestCameraPermissionsAsync();
        }
        if (!permission.granted) {
          Alert.alert(
            "Camera permission needed",
            "Please allow camera access in Settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open settings", onPress: () => Linking.openSettings() },
            ],
          );
          return;
        }
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      };
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled) return;

      setBusy(true);
      const asset = result.assets[0];
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("You are not logged in");

      const path = `${user.id}/avatar.jpg`;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("You are not logged in");

      const uploadUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/avatars/${path}`;
      const response = await FileSystem.uploadAsync(uploadUrl, asset.uri, {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          "Content-Type": asset.mimeType ?? "image/jpeg",
          "x-upsert": "true",
        },
      });
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Upload failed (${response.status}): ${response.body}`);
      }

      // The time in the URL stops the old photo from staying in the cache.
      const publicUrl = `${supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) throw updateError;
      setUrl(publicUrl);
    } catch (error) {
      Alert.alert("Upload failed", (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function openMenu() {
    Alert.alert("Profile photo", "Choose a source", [
      { text: "Camera", onPress: () => pick("camera") },
      { text: "Gallery", onPress: () => pick("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <Pressable style={styles.wrap} onPress={openMenu} disabled={busy}>
      {url ? (
        <Image source={{ uri: url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <ThemedText>Add photo</ThemedText>
        </View>
      )}
      {busy && <ActivityIndicator style={StyleSheet.absoluteFill} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: "center", marginVertical: 16 },
  image: { width: 110, height: 110, borderRadius: 55 },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(128,128,128,0.25)",
  },
});
