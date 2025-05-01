import { NextResponse } from 'next/server';
import * as db from '@/lib/db/inventory';
import { inventorySchema } from '@/lib/validations/inventory';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const item = await db.getById(params.id);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = inventorySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid inventory data',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const item = await db.update(params.id, validationResult.data);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update item'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await db.remove(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete item'
    }, { status: 500 });
  }
}
