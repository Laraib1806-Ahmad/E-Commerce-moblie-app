import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Image,
  Switch,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  createProduct,
  updateProduct,
  uploadImage,
  fetchBrands,
  fetchCategories,
} from "@/lib/api";
import { Brand, Product } from "@/types/product";
import { PickedFile } from "@/types/admin";
import { AppColors as Colors } from "@/constants/colors";

export function ProductFormModal({
  visible,
  product,
  onClose,
  onSaved,
}: {
  visible: boolean;
  product: Product | null; // null = add, Product = edit
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!product;
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brandName, setBrandName] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState("");
  const [description, setDescription] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [image, setImage] = useState<PickedFile | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setName(product?.productName ?? "");
    setCategory(product?.category ?? "");
    setBrandName(product?.brand.name ?? "");
    setPrice(product ? String(product.price) : "");
    setRating(product ? String(product.rating) : "");
    setDescription(product?.description ?? "");
    setFavorite(product?.favorite ?? false);
    setImage(null);
    setError("");
    fetchBrands()
      .then(setBrands)
      .catch(() => {});
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, [visible, product]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (res.canceled) return;
    const a = res.assets[0];
    const rawName = a.fileName ?? `product-${Date.now()}.jpg`;
    setImage({
      uri: a.uri,
      name: rawName.replace(/[^\w.-]/g, "_"),
      type: a.mimeType ?? "image/jpeg",
    });
  };

  const save = async () => {
    const priceNum = Number(price);
    const ratingNum = Number(rating);

    if (!name.trim() || !category.trim() || !description.trim() || !brandName) {
      setError("Please fill in name, category, brand and description");
      return;
    }
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be a number greater than 0");
      return;
    }
    if (
      rating === "" ||
      Number.isNaN(ratingNum) ||
      ratingNum < 0 ||
      ratingNum > 5
    ) {
      setError("Rating must be between 0 and 5");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const base = {
        productName: name.trim(),
        category: category.trim(),
        price: priceNum,
        rating: ratingNum,
        description: description.trim(),
        favorite,
      };
      if (product) {
        let imageUrl = product.imageUrl;
        if (image) imageUrl = (await uploadImage(image)).imageUrl;
        await updateProduct(product.id, { ...base, imageUrl });
      } else {
        await createProduct({ ...base, brandName }, image ?? undefined);
      }
      onSaved();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const previewUri = image?.uri ?? product?.imageUrl ?? null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEdit ? "Edit Product" : "Add Product"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>Product Image</Text>
            <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
              {previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.preview} />
              ) : (
                <Text style={styles.imageHint}>＋ Add Image</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="iPhone 13"
            />

            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="Phones"
            />
            <View style={styles.chipRow}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === c && styles.chipTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Brand</Text>
            {isEdit ? (
              <Text style={styles.readonly}>
                {brandName} (brand cannot be changed after creation)
              </Text>
            ) : (
              <View style={styles.chipRow}>
                {brands.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.chip,
                      brandName === b.name && styles.chipActive,
                    ]}
                    onPress={() => setBrandName(b.name)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        brandName === b.name && styles.chipTextActive,
                      ]}
                    >
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.twoCols}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Price ($)</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholder="999"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Rating (0-5)</Text>
                <TextInput
                  style={styles.input}
                  value={rating}
                  onChangeText={setRating}
                  keyboardType="decimal-pad"
                  placeholder="4.7"
                />
              </View>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="About this product"
            />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Favorite</Text>
              <Switch
                value={favorite}
                onValueChange={setFavorite}
                trackColor={{ true: Colors.olive, false: "#ddd" }}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={save}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>
                  {isEdit ? "Save Changes" : "Create Product"}
                </Text>
              )}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: { fontSize: 20, fontWeight: "700", color: Colors.text },
  close: { fontSize: 20, color: Colors.mutedText },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  readonly: { color: Colors.mutedText, fontSize: 14 },
  imageBox: {
    height: 160,
    borderRadius: 16,
    backgroundColor: Colors.lightPeach,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  preview: { width: "100%", height: "100%" },
  imageHint: { color: Colors.darkOlive, fontWeight: "600" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.lightPeach,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: Colors.olive },
  chipText: { color: Colors.text, fontSize: 13 },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  twoCols: { flexDirection: "row" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  error: { color: "#C0392B", marginTop: 12 },
  saveBtn: {
    backgroundColor: Colors.darkOlive,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
