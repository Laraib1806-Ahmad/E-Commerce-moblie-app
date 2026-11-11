import { configureStore } from "@reduxjs/toolkit";
import filtersReducer from "./filtersSlice";
import productsReducer from "./productsSlice";
import cartReducer from "./cartSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    products: productsReducer,
    cart: cartReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;