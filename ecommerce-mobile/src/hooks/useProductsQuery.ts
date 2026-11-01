import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { fetchProducts } from "../lib/api";
import type { RootState } from "../store";

export function useProductsQuery() {
  const filters = useSelector((s: RootState) => s.filters);
  const { page, ...rest } = filters;

  return useInfiniteQuery({
    queryKey: ["products", rest],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const params: Record<string, string> = {
        page: String(pageParam),
        limit: String(filters.limit),
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.priceMin != null) params.priceMin = String(filters.priceMin);
      if (filters.priceMax != null) params.priceMax = String(filters.priceMax);
      if (filters.ratingMin != null)
        params.ratingMin = String(filters.ratingMin);
      if (filters.ratingMax != null)
        params.ratingMax = String(filters.ratingMax);
      if (filters.favoriteOnly) params.favorite = "true";
      if (filters.sortKey) {
        params.sortBy = filters.sortKey;
        params.order = filters.sortOrder;
      }
      return fetchProducts(params);
    },
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });
}
