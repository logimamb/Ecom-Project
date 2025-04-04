import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const forwarder = await db.forwarders.findById(params.id);
    if (!forwarder) {
      return NextResponse.json({ error: 'Forwarder not found' }, { status: 404 });
    }
    return NextResponse.json(forwarder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch forwarder' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const forwarder = await db.forwarders.update(params.id, body);
    if (!forwarder) {
      return NextResponse.json({ error: 'Forwarder not found' }, { status: 404 });
    }
    return NextResponse.json(forwarder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update forwarder' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const success = await db.forwarders.delete(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Forwarder not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete forwarder' }, { status: 500 });
  }
}
