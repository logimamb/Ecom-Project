import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const forwarders = await db.forwarders.findAll();
    return NextResponse.json(forwarders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch forwarders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const forwarder = await db.forwarders.create(body);
    return NextResponse.json(forwarder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create forwarder' }, { status: 500 });
  }
}
