import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Supplier } from '@/lib/types';

export async function GET() {
  try {
    const suppliers = await db.suppliers.findAll();
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supplier = await db.suppliers.create(body);
    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}