import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await db.customers.findById(params.id)
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ customer })
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const timestamp = new Date().toISOString()

    const customer = await db.customers.findById(params.id)
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    const updatedCustomer = await db.customers.update(params.id, {
      ...data,
      updatedAt: timestamp,
    })

    return NextResponse.json({ customer: updatedCustomer })
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await db.customers.delete(params.id)
    if (!deleted) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    )
  }
}
