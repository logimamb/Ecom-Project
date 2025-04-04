import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const costing = await db.costings.findById(params.id);
    if (!costing) {
      return NextResponse.json({ error: 'Costing not found' }, { status: 404 });
    }
    return NextResponse.json(costing);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch costing' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const costing = await db.costings.update(params.id, body);
    if (!costing) {
      return NextResponse.json({ error: 'Costing not found' }, { status: 404 });
    }
    return NextResponse.json(costing);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update costing' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const success = await db.costings.delete(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Costing not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete costing' }, { status: 500 });
  }
}
