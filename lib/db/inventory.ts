import { randomUUID } from "crypto";
import { readJSON, writeJSON } from "./json";

const INVENTORY_FILE = "data/inventory.json";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  reorderPoint: number;
  supplier: string;
  lastRestocked: string;
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
    throw new Error("Item not found");
  }

  const updatedItem: InventoryItem = {
    ...inventory[index],
    ...data,
  };

  inventory[index] = updatedItem;

  await writeJSON(INVENTORY_FILE, {
    inventory,
  });

  return updatedItem;
}

export async function updateMany(updatedItems: InventoryItem[]): Promise<void> {
  const currentInventory = await getAll();
  
  // Create a map of existing items by ID for quick lookup
  const itemsMap = new Map(currentInventory.map(item => [item.id, item]));
  
  // Update each item while preserving other fields
  const newInventory = updatedItems.map(item => {
    const existingItem = itemsMap.get(item.id);
    if (!existingItem) {
      throw new Error(`Item with id ${item.id} not found`);
    }

    return {
      ...existingItem,
      ...item,
      lastRestocked: existingItem.lastRestocked, // Preserve original restock date
    };
  });

  await writeJSON(INVENTORY_FILE, {
    inventory: newInventory,
  });
}

export async function remove(id: string): Promise<void> {
  const inventory = await getAll();
  const filteredInventory = inventory.filter((item) => item.id !== id);

  await writeJSON(INVENTORY_FILE, {
    inventory: filteredInventory,
  });
}
