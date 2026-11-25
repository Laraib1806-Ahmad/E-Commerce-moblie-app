import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef } from "react";
import { Alert, Modal, Pressable, StyleSheet, View } from "react-native";

import { PermissionPrompt } from "@/components/PermissionPrompt";
import { ThemedText } from "@/components/themed-text";
import { fetchProductByBarcode } from "@/lib/barcode";
import type { Product } from "@/types/product";

type Props = {
  visible: boolean;
  onClose: () => void;
  onFound: (product: Product) => void;
};

export function ScannerModal({ visible, onClose, onFound }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  // The camera fires many scan events per second, so only the first one is handled.
  const locked = useRef(false);

  const unlock = () => {
    locked.current = false;
  };

  async function handleScan({ data }: { data: string }) {
    if (locked.current) return;
    locked.current = true;
    try {
      const product = await fetchProductByBarcode(data);
      if (product) {
        onFound(product);
        onClose();
      } else {
        Alert.alert("Not found", `No product has the barcode ${data}.`, [
          { text: "OK", onPress: unlock },
        ]);
      }
    } catch (error) {
      Alert.alert("Scan failed", (error as Error).message, [
        { text: "OK", onPress: unlock },
      ]);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onShow={unlock}
      onRequestClose={onClose}
    >
      {!permission ? null : !permission.granted ? (
        <View style={styles.flex}>
          <PermissionPrompt
            title="Camera access"
            message="We need the camera to scan product barcodes."
            canAskAgain={permission.canAskAgain}
            onRequest={requestPermission}
          />
          <Pressable style={styles.close} onPress={onClose}>
            <ThemedText type="smallBold">Close</ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.flex}>
          <CameraView
            style={styles.flex}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "code128"],
            }}
            onBarcodeScanned={handleScan}
          />
          <Pressable
            style={[styles.close, styles.closeOverlay]}
            onPress={onClose}
          >
            <ThemedText type="smallBold" style={styles.closeText}>
              Close
            </ThemedText>
          </Pressable>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  close: { alignSelf: "center", padding: 16 },
  closeOverlay: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    paddingHorizontal: 32,
  },
  closeText: { color: "#fff" },
});
