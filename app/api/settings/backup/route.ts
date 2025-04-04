import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Read all data files
    const dataDir = path.join(process.cwd(), 'data');
    const files = ['settings.json', 'customers.json', 'inventory.json', 'sales.json', 'suppliers.json'];
    
    const backup: Record<string, any> = {};
    
    for (const file of files) {
      try {
        const content = readFileSync(path.join(dataDir, file), 'utf-8');
        backup[file.replace('.json', '')] = JSON.parse(content);
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
        backup[file.replace('.json', '')] = null;
      }
    }

    // Add backup metadata
    backup.metadata = {
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };

    // Return the backup as a downloadable file
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-${new Date().toISOString()}.json"`
      }
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}
