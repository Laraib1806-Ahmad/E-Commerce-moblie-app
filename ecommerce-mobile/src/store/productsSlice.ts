import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchProducts, updateProduct } from "../lib/api";
import { Product } from "../types/product";
import type { RootState } from "./index";

interface Meta {
  page: number;
  totalPages: number;
}

interface ProductsState {
  items: Product[];
  meta: Meta;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  meta: { page: 1, totalPages: 1 },
  status: "idle",
  error: null,
};

export const loadProducts = createAsyncThunk(
  "products/load",
  async (args: { append?: boolean } = {}, { getState }) => {
    const { filters } = getState() as RootState;
    const params: Record<string, string> = {
      page: String(filters.page),
      limit: String(filters.limit),
    };
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.brand) params.brand = filters.brand;
    if (filters.priceMin != null) params.priceMin = String(filters.priceMin);
    if (filters.priceMax != null) params.priceMax = String(filters.priceMax);
    if (filters.ratingMin != null) params.ratingMin = String(filters.ratingMin);
    if (filters.ratingMax != null) params.ratingMax = String(filters.ratingMax);
    if (filters.favoriteOnly) params.favorite = "true";
    if (filters.sortKey) {
      params.sortBy = filters.sortKey;
      params.order = filters.sortOrder;
    }
    return fetchProducts(params);
  },
);

// Pass the product as it is BEFORE the toggle. UI updates instantly (pending),
// and rolls back if the backend call fails (rejected).
export const toggleFavorite = createAsyncThunk(
  "products/toggleFavorite",
  async (product: Product) => {
    await updateProduct(product.id, { favorite: !product.favorite });
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFavoriteLocal: (
      state,
      action: PayloadAction<{ id: number; favorite: boolean }>,
    ) => {
      const p = state.items.find((i) => i.id === action.payload.id);
      if (p) p.favorite = action.payload.favorite;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadProducts.fulfilled, (state, action: any) => {
        state.status = "succeeded";
        const append = action.meta.arg?.append;
        state.items = append
          ? [...state.items, ...action.payload.data]
          : action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      })
      .addCase(toggleFavorite.pending, (state, action) => {
        const p = state.items.find((i) => i.id === action.meta.arg.id);
        if (p) p.favorite = !action.meta.arg.favorite;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        const p = state.items.find((i) => i.id === action.meta.arg.id);
        if (p) p.favorite = action.meta.arg.favorite;
      });
  },
});

export const { setFavoriteLocal } = productsSlice.actions;
export default productsSlice.reducer;
