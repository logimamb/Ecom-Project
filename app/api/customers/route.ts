import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const customers = await db.customers.findAll()
    return NextResponse.json({ customers })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const timestamp = new Date().toISOString()

    const customer = await db.customers.create({
      ...data,
      totalOrders: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    )
  }
}
