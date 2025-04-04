import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

interface BaseModel {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

class Database<T extends BaseModel> {
  private filePath: string
  private collectionKey: string

  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), "data", fileName)
    this.collectionKey = path.basename(fileName, ".json")
  }

  private async readData(): Promise<{ [key: string]: T[] }> {
    try {
      await fs.access(this.filePath)
      const data = await fs.readFile(this.filePath, "utf-8")
      return JSON.parse(data)
    } catch (error) {
      // If file doesn't exist or is empty, create it with default structure
      const defaultData = { [this.collectionKey]: [] }
      await this.writeData(defaultData)
      return defaultData
    }
  }

  private async writeData(data: { [key: string]: T[] }): Promise<void> {
    // Ensure the directory exists
    const dir = path.dirname(this.filePath)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2))
  }

  async findAll(): Promise<T[]> {
    const data = await this.readData()
    return data[this.collectionKey] || []
  }

  async findById(id: string): Promise<T | null> {
    const items = await this.findAll()
    return items.find((item) => item.id === id) || null
  }

  async create(item: Omit<T, keyof BaseModel>): Promise<T> {
    const data = await this.readData()
    const now = new Date().toISOString()
    const newItem = {
      ...item,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    } as T
    data[this.collectionKey] = [...(data[this.collectionKey] || []), newItem]
    await this.writeData(data)
    return newItem
  }

  async update(id: string, updates: Partial<Omit<T, keyof BaseModel>>): Promise<T | null> {
    const data = await this.readData()
    const index = data[this.collectionKey]?.findIndex((item) => item.id === id)
    
    if (index === -1 || index === undefined) return null

    const updatedItem = {
      ...data[this.collectionKey][index],
      ...updates,
      updatedAt: new Date().toISOString(),
    } as T
    data[this.collectionKey][index] = updatedItem
    await this.writeData(data)
    return updatedItem
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.readData()
    const index = data[this.collectionKey]?.findIndex((item) => item.id === id)
    
    if (index === -1 || index === undefined) return false

    data[this.collectionKey].splice(index, 1)
    await this.writeData(data)
    return true
  }
}

// Add a special class for settings that doesn't require BaseModel interface
class SettingsDatabase<T extends object> {
  private filePath: string;

  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), "data", fileName);
  }

  async read(): Promise<T> {
    try {
      await fs.access(this.filePath);
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      throw new Error('Failed to read settings');
    }
  }

  async write(data: T): Promise<void> {
    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error('Failed to write settings');
    }
  }
}

export const db = {
  customers: new Database("customers.json"),
  sales: new Database("sales.json"),
  reports: new Database("reports.json"),
  suppliers: new Database("suppliers.json"),
  forwarders: new Database("forwarders.json"),
  orders: new Database("orders.json"),
  inventory: new Database("inventory.json"),
  costings: new Database("costings.json"),
  notifications: new Database("notifications.json"),
  settings: new SettingsDatabase("settings.json"),
}