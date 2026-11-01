import { AppColors as Colors } from "@/constants/colors";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchBrands, fetchCategories } from "../lib/api";
import {
  resetFilters,
  setBrand,
  setCategory,
  setFavoriteOnly,
  setPriceMax,
  setPriceMin,
} from "../store/filtersSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
export function FiltersModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [priceMinText, setPriceMinText] = useState(
    filters.priceMin?.toString() ?? "",
  );
  const [priceMaxText, setPriceMaxText] = useState(
    filters.priceMax?.toString() ?? "",
  );

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchBrands().then((data) => setBrands(data.map((b) => b.name)));
  }, []);

  const applyPriceRange = () => {
    dispatch(setPriceMin(priceMinText ? Number(priceMinText) : null));
    dispatch(setPriceMax(priceMaxText ? Number(priceMaxText) : null));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Filters</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() =>
                    dispatch(setCategory(filters.category === c ? "" : c))
                  }
                  style={[
                    styles.chip,
                    filters.category === c && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.category === c && styles.chipTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Brand</Text>
            <View style={styles.chipRow}>
              {brands.map((b) => (
                <TouchableOpacity
                  key={b}
                  onPress={() =>
                    dispatch(setBrand(filters.brand === b ? "" : b))
                  }
                  style={[
                    styles.chip,
                    filters.brand === b && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.brand === b && styles.chipTextActive,
                    ]}
                  >
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Price Range</Text>
            <View style={styles.row}>
              <TextInput
                placeholder="Min"
                keyboardType="numeric"
                value={priceMinText}
                onChangeText={setPriceMinText}
                onEndEditing={applyPriceRange}
                style={styles.input}
              />
              <Text style={styles.dash}>—</Text>
              <TextInput
                placeholder="Max"
                keyboardType="numeric"
                value={priceMaxText}
                onChangeText={setPriceMaxText}
                onEndEditing={applyPriceRange}
                style={styles.input}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Favorites only</Text>
              <Switch
                value={filters.favoriteOnly}
                onValueChange={(v) => {
                  dispatch(setFavoriteOnly(v));
                }}
                trackColor={{ true: Colors.olive, false: "#ddd" }}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => dispatch(resetFilters())}
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.peach,
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: Colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
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
  row: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    marginRight: 8,
  },
  dash: { color: Colors.mutedText, marginRight: 8 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  footer: { flexDirection: "row", marginTop: 20 },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.lightPeach,
    alignItems: "center",
    marginRight: 12,
  },
  resetText: { color: Colors.darkOlive, fontWeight: "700" },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.darkOlive,
    alignItems: "center",
  },
  applyText: { color: "#fff", fontWeight: "700" },
});
