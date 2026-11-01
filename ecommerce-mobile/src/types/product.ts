export interface Brand {
  id: number;
  name: string;
  country: string;
}

export interface Product {
  id: number;
  productName: string;
  category: string;
  price: number;
  rating: number;
  imageUrl: string | null;
  description: string;
  favorite: boolean;
  brand: Brand;
}
