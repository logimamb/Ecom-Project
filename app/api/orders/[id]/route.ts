import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orderSchema } from '@/lib/validations/order';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const order = await db.orders.findById(params.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = orderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid order data',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const order = await db.orders.update(params.id, validationResult.data);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update order'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const success = await db.orders.delete(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete order'
    }, { status: 500 });
  }
}
