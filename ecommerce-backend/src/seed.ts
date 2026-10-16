import "dotenv/config";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Brand } from "./entities/Brand";
import { Product } from "./entities/Product";

const brandsData = [
  { name: "Apple", country: "United States" },
  { name: "Samsung", country: "South Korea" },
  { name: "Dell", country: "United States" },
  { name: "Garmin", country: "United States" },
  { name: "Nike", country: "United States" },
  { name: "Adidas", country: "Germany" },
  { name: "Sony", country: "Japan" },
  { name: "Google", country: "United States" },
  { name: "HP", country: "United States" },
  { name: "Rolex", country: "Switzerland" },
  { name: "Fitbit", country: "United States" },
  { name: "Wilson", country: "United States" },
  { name: "Nintendo", country: "Japan" },
  { name: "LG", country: "South Korea" },
  { name: "Reebok", country: "United States" },
  { name: "ASUS", country: "Taiwan" },
];

const productsData = [
  {
    productName: "iPhone 13",
    category: "Phones",
    price: 999,
    rating: 4.7,
    description: "The latest iPhone with advanced features.",
    favorite: false,
    brandName: "Apple",
  },
  {
    productName: "Samsung Galaxy S21",
    category: "Phones",
    price: 899,
    rating: 4.6,
    description: "Powerful Android phone with stunning display.",
    favorite: true,
    brandName: "Samsung",
  },
  {
    productName: "MacBook Pro",
    category: "Laptops",
    price: 1999,
    rating: 4.8,
    description: "High-performance laptop for professionals.",
    favorite: true,
    brandName: "Apple",
  },
  {
    productName: "Dell XPS 13",
    category: "Laptops",
    price: 1499,
    rating: 4.5,
    description: "Sleek and powerful laptop with a stunning display.",
    favorite: false,
    brandName: "Dell",
  },
  {
    productName: "Apple Watch Series 6",
    category: "Watches",
    price: 399,
    rating: 4.9,
    description: "Advanced smartwatch with fitness tracking.",
    favorite: true,
    brandName: "Apple",
  },
  {
    productName: "Garmin Forerunner 245",
    category: "Watches",
    price: 299,
    rating: 4.7,
    description: "GPS running watch with advanced performance metrics.",
    favorite: false,
    brandName: "Garmin",
  },
  {
    productName: "Nike Air Zoom Pegasus 38",
    category: "Sports",
    price: 120,
    rating: 4.6,
    description: "Comfortable and responsive running shoes.",
    favorite: true,
    brandName: "Nike",
  },
  {
    productName: "Adidas Ultraboost 21",
    category: "Sports",
    price: 180,
    rating: 4.8,
    description: "High-performance shoes for running and training.",
    favorite: false,
    brandName: "Adidas",
  },
  {
    productName: "Samsung QLED 4K TV",
    category: "Electronics",
    price: 1299,
    rating: 4.7,
    description: "Stunning 4K TV with vibrant colors and smart features.",
    favorite: false,
    brandName: "Samsung",
  },
  {
    productName: "Sony PlayStation 5",
    category: "Gaming",
    price: 499,
    rating: 4.9,
    description: "Next-generation gaming console with immersive experiences.",
    favorite: true,
    brandName: "Sony",
  },
  {
    productName: "Google Pixel 6",
    category: "Phones",
    price: 799,
    rating: 4.7,
    description:
      "Smartphone with an exceptional camera and pure Android experience.",
    favorite: true,
    brandName: "Google",
  },
  {
    productName: "HP Spectre x360",
    category: "Laptops",
    price: 1599,
    rating: 4.6,
    description:
      "Convertible laptop with powerful performance and stunning design.",
    favorite: false,
    brandName: "HP",
  },
  {
    productName: "Rolex Submariner",
    category: "Watches",
    price: 9500,
    rating: 4.9,
    description: "Iconic luxury watch for diving enthusiasts.",
    favorite: true,
    brandName: "Rolex",
  },
  {
    productName: "Fitbit Charge 4",
    category: "Watches",
    price: 149,
    rating: 4.4,
    description: "Fitness tracker with built-in GPS and heart rate monitor.",
    favorite: false,
    brandName: "Fitbit",
  },
  {
    productName: "Wilson Evolution Basketball",
    category: "Sports",
    price: 59,
    rating: 4.8,
    description:
      "Official game basketball with exceptional grip and durability.",
    favorite: true,
    brandName: "Wilson",
  },
  {
    productName: "Sony WH-1000XM4",
    category: "Electronics",
    price: 349,
    rating: 4.9,
    description:
      "Premium wireless noise-canceling headphones with exceptional sound quality.",
    favorite: true,
    brandName: "Sony",
  },
  {
    productName: "Nintendo Switch",
    category: "Gaming",
    price: 299,
    rating: 4.7,
    description: "Versatile gaming console for handheld and TV play.",
    favorite: false,
    brandName: "Nintendo",
  },
  {
    productName: "LG OLED 4K TV",
    category: "Electronics",
    price: 1899,
    rating: 4.8,
    description:
      "Premium 4K TV with OLED technology for stunning picture quality.",
    favorite: false,
    brandName: "LG",
  },
  {
    productName: "Reebok Nano X1",
    category: "Sports",
    price: 130,
    rating: 4.6,
    description: "Cross-training shoes with enhanced stability and comfort.",
    favorite: true,
    brandName: "Reebok",
  },
  {
    productName: "ASUS ROG Zephyrus G14",
    category: "Laptops",
    price: 1499,
    rating: 4.7,
    description:
      "Powerful gaming laptop with a compact design and high-refresh-rate display.",
    favorite: false,
    brandName: "ASUS",
  },
];

async function seed() {
  await AppDataSource.initialize();
  console.log("Database Connected ~");

  const brandRepo = AppDataSource.getRepository(Brand);
  const productRepo = AppDataSource.getRepository(Product);

  const existingCount = await productRepo.count();
  if (existingCount > 0) {
    console.log(`Already ${existingCount} products in DB. Skipping seed.`);
    await AppDataSource.destroy();
    return;
  }

  const savedBrands = await brandRepo.save(brandsData);
  console.log(`${savedBrands.length} brands inserted.`);

  const brandMap = new Map(savedBrands.map((b) => [b.name, b]));

  const productsToInsert = productsData.map((p) => ({
    productName: p.productName,
    category: p.category,
    price: p.price,
    rating: p.rating,
    description: p.description,
    favorite: p.favorite,
    brand: brandMap.get(p.brandName)!,
  }));

  const savedProducts = await productRepo.save(productsToInsert);
  console.log(`${savedProducts.length} products inserted.`);

  await AppDataSource.destroy();
  console.log("Seeding done, connection closed.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
