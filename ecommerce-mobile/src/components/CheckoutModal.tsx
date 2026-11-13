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
import { waitUntilPaid, createCheckout } from "@/lib/orders";
import { useQueryClient } from "@tanstack/react-query";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";

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
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const queryClient = useQueryClient();
  const [paying, setPaying] = useState(false);
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

  const onSubmit = async (values: CheckoutForm) => {
    setPaying(true);
    try {
      const { orderId, clientSecret } = await createCheckout(
        items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        values,
      );

      const init = await initPaymentSheet({
        merchantDisplayName: "ShopX",
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: { name: values.fullName, phone: values.phone },
      });
      if (init.error) throw new Error(init.error.message);

      const result = await presentPaymentSheet();
      if (result.error) {
        if (result.error.code !== "Canceled") {
          Alert.alert("Payment failed", result.error.message);
        }
        return;
      }

      // Stripe tells the server about the payment through the webhook. Wait for it.
      const paid = await waitUntilPaid(orderId);

      reset();
      onClose();
      dispatch(clearCart());
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      Alert.alert(
        paid ? "Order placed" : "Payment received",
        paid
          ? "Thank you! Your order is confirmed."
          : "Your order is being confirmed. It will appear in the Orders tab shortly.",
      );

      reset();
      onClose();
      dispatch(clearCart());
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      Alert.alert("Order placed", `Thank you, ${values.fullName}`);
    } catch (e: any) {
      Alert.alert("Something went wrong", e.message);
    } finally {
      setPaying(false);
    }
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
              disabled={paying}
            >
              <Text style={styles.buttonText}>
                {paying ? "Processing..." : `Pay $${total.toFixed(2)}`}
              </Text>
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
