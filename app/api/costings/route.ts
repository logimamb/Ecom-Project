import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const costings = await db.costings.findAll();
    return NextResponse.json(costings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch costings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const costing = await db.costings.create({
      ...body,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(costing, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create costing' }, { status: 500 });
  }
}
