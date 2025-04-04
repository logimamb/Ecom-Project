import { promises as fs } from "fs";
import { join } from "path";

export async function readJSON(filename: string): Promise<any> {
  try {
    const filePath = join(process.cwd(), filename);
    const fileContents = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

export async function writeJSON(filename: string, data: any): Promise<void> {
  const filePath = join(process.cwd(), filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
