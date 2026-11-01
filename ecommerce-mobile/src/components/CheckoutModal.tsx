import { AppColors as Colors } from "@/constants/colors";
import { CheckoutForm, checkoutSchema } from "@/lib/checkoutSchema";
import { clearCart } from "@/store/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FIELDS: {
  name: keyof CheckoutForm;
  label: string;
  keyboard?: "default" | "phone-pad";
}[] = [
  { name: "fullName", label: "Full name" },
  { name: "phone", label: "Phone number", keyboard: "phone-pad" },
  { name: "address", label: "Address" },
  { name: "city", label: "City" },
];

export function CheckoutModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { fullName: "", phone: "", address: "", city: "" },
  });

  const onSubmit = (values: CheckoutForm) => {
    // There is no orders API yet, so this only simulates placing the order.
    console.log("Order", values, items);
    reset();
    onClose();
    dispatch(clearCart());
    Alert.alert("Order placed", `Thank you, ${values.fullName}`);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>Checkout</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.close}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

            {FIELDS.map((f) => (
              <View key={f.name} style={{ marginTop: 14 }}>
                <Text style={styles.label}>{f.label}</Text>
                <Controller
                  control={control}
                  name={f.name}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType={f.keyboard ?? "default"}
                      style={[
                        styles.input,
                        errors[f.name] && styles.inputError,
                      ]}
                    />
                  )}
                />
                {errors[f.name] && (
                  <Text style={styles.error}>{errors[f.name]?.message}</Text>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.buttonText}>Place Order</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "700", color: Colors.text },
  close: { color: Colors.darkOlive, fontWeight: "700" },
  total: { color: Colors.mutedText, marginTop: 4 },
  label: { color: Colors.text, fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  inputError: { borderColor: "#C0392B" },
  error: { color: "#C0392B", fontSize: 12, marginTop: 4 },
  button: {
    backgroundColor: Colors.darkOlive,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
