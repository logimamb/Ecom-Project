import { randomUUID } from "crypto";
import { readJSON, writeJSON } from "./json";

const INVENTORY_FILE = "data/inventory.json";

export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  reorderPoint: number;
  location?: string;
  notes?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAll(): Promise<InventoryItem[]> {
  try {
    const data = await readJSON(INVENTORY_FILE);
    return data.inventory || [];
  } catch (error) {
    return [];
  }
}

export async function getById(id: string): Promise<InventoryItem | null> {
  const inventory = await getAll();
  return inventory.find((item) => item.id === id) || null;
}

export async function create(data: Omit<InventoryItem, "id">): Promise<InventoryItem> {
  const inventory = await getAll();
  const newItem: InventoryItem = {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await writeJSON(INVENTORY_FILE, {
    inventory: [...inventory, newItem],
  });

  return newItem;
}

export async function update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
  const inventory = await getAll();
  const index = inventory.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new Error("Inventory item not found");
  }

  const updatedItem = {
    ...inventory[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  inventory[index] = updatedItem;

  await writeJSON(INVENTORY_FILE, { inventory });

  return updatedItem;
}

export async function updateMany(updatedItems: InventoryItem[]): Promise<void> {
  const inventory = await getAll();
  const updatedInventory = inventory.map((item) => {
    const updatedItem = updatedItems.find((updated) => updated.id === item.id);
    return updatedItem ? { ...item, ...updatedItem } : item;
  });

  await writeJSON(INVENTORY_FILE, { inventory: updatedInventory });
}

export async function remove(id: string): Promise<void> {
  const inventory = await getAll();
  const filteredInventory = inventory.filter((item) => item.id !== id);
  await writeJSON(INVENTORY_FILE, { inventory: filteredInventory });
}
