import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventorySchema } from '@/lib/validations/inventory';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const item = await db.inventory.findById(params.id);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
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

    const item = await db.inventory.update(params.id, validationResult.data);
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
    const success = await db.inventory.delete(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete item'
    }, { status: 500 });
  }
}
