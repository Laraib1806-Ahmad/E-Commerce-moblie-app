import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../types/product";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: Product; quantity: number }>,
    ) => {
      const existing = state.items.find(
        (i) => i.product.id === action.payload.product.id,
      );
      if (existing) existing.quantity += action.payload.quantity;
      else state.items.push(action.payload);
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.product.id !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>,
    ) => {
      const item = state.items.find(
        (i) => i.product.id === action.payload.productId,
      );
      if (item) item.quantity = Math.max(1, action.payload.quantity);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
