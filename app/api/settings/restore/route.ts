import { NextResponse } from 'next/server';
import { writeFileSync } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const backupFile = formData.get('backup') as File;
    
    if (!backupFile) {
      return NextResponse.json(
        { error: 'No backup file provided' },
        { status: 400 }
      );
    }

    const backupData = JSON.parse(await backupFile.text());
    
    // Validate backup format
    if (!backupData.metadata || !backupData.metadata.version) {
      return NextResponse.json(
        { error: 'Invalid backup format' },
        { status: 400 }
      );
    }

    // Write data files
    const dataDir = path.join(process.cwd(), 'data');
    const files = ['settings', 'customers', 'inventory', 'sales', 'suppliers'];
    
    for (const file of files) {
      if (backupData[file]) {
        try {
          writeFileSync(
            path.join(dataDir, `${file}.json`),
            JSON.stringify(backupData[file], null, 2)
          );
        } catch (error) {
          console.error(`Error restoring ${file}.json:`, error);
        }
      }
    }

    return NextResponse.json({
      message: 'Data restored successfully'
    });
  } catch (error) {
    console.error('Error restoring data:', error);
    return NextResponse.json(
      { error: 'Failed to restore data' },
      { status: 500 }
    );
  }
}
