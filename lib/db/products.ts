import { readJSON, writeJSON } from "./json";

const PRODUCTS_FILE = "data/products.json";

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  supplierId: string;
  lastOrderPrice: number;
  createdAt: string;
  updatedAt: string;
}

export async function getAll(): Promise<Product[]> {
  try {
    const data = await readJSON(PRODUCTS_FILE);
    return data.products || [];
  } catch (error) {
    return [];
  }
}

export async function getById(id: string): Promise<Product | null> {
  const products = await getAll();
  return products.find((product) => product.id === id) || null;
}

export async function create(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  const products = await getAll();
  const newProduct: Product = {
    ...data,
    id: `prod_${String(products.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await writeJSON(PRODUCTS_FILE, {
    products: [...products, newProduct],
  });

  return newProduct;
}

export async function update(id: string, data: Partial<Product>): Promise<Product> {
  const products = await getAll();
  const index = products.findIndex((product) => product.id === id);

  if (index === -1) {
    throw new Error("Product not found");
  }

  const updatedProduct = {
    ...products[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updatedProduct;

  await writeJSON(PRODUCTS_FILE, { products });

  return updatedProduct;
}

export async function remove(id: string): Promise<void> {
  const products = await getAll();
  const filteredProducts = products.filter((product) => product.id !== id);
  await writeJSON(PRODUCTS_FILE, { products: filteredProducts });
}
