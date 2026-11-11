import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SortKey = "price" | "rating" | null;
export type SortOrder = "asc" | "desc";

interface FiltersState {
  search: string;
  category: string;
  brand: string;
  priceMin: number | null;
  priceMax: number | null;
  ratingMin: number | null;
  ratingMax: number | null;
  favoriteOnly: boolean;
  sortKey: SortKey;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

const initialState: FiltersState = {
  search: "",
  category: "",
  brand: "",
  priceMin: null,
  priceMax: null,
  ratingMin: null,
  ratingMax: null,
  favoriteOnly: false,
  sortKey: null,
  sortOrder: "asc",
  page: 1,
  limit: 9,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
      state.page = 1;
    },
    setBrand: (state, action: PayloadAction<string>) => {
      state.brand = action.payload;
      state.page = 1;
    },
    setPriceMin: (state, action: PayloadAction<number | null>) => {
      state.priceMin = action.payload;
      state.page = 1;
    },
    setPriceMax: (state, action: PayloadAction<number | null>) => {
      state.priceMax = action.payload;
      state.page = 1;
    },
    setRatingMin: (state, action: PayloadAction<number | null>) => {
      state.ratingMin = action.payload;
      state.page = 1;
    },
    setRatingMax: (state, action: PayloadAction<number | null>) => {
      state.ratingMax = action.payload;
      state.page = 1;
    },
    setFavoriteOnly: (state, action: PayloadAction<boolean>) => {
      state.favoriteOnly = action.payload;
      state.page = 1;
    },
    setSort: (
      state,
      action: PayloadAction<{ key: SortKey; order: SortOrder }>,
    ) => {
      state.sortKey = action.payload.key;
      state.sortOrder = action.payload.order;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setSearch,
  setCategory,
  setBrand,
  setPriceMin,
  setPriceMax,
  setRatingMin,
  setRatingMax,
  setFavoriteOnly,
  setSort,
  setPage,
  resetFilters,
} = filtersSlice.actions;
export default filtersSlice.reducer;
