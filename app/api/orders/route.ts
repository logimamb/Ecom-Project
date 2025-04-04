import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orderSchema } from '@/lib/validations/order';

export async function GET() {
  try {
    const orders = await db.orders.findAll();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const order = await db.orders.create(validationResult.data);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create order'
    }, { status: 500 });
  }
}
