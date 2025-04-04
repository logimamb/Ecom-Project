import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Report, UpdateReportInput } from "@/lib/types"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await db.reports.findById(params.id)
    if (!report) {
      return NextResponse.json(
        { error: "Report not found", report: null },
        { status: 404 }
      )
    }
    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json(
      { error: "Failed to fetch report", report: null },
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

    const updateData: UpdateReportInput = {
      ...data,
      metrics: data.metrics || {},
      updatedAt: timestamp
    }

    const updatedReport = await db.reports.update(params.id, updateData)

    if (!updatedReport) {
      return NextResponse.json(
        { error: "Report not found", report: null },
        { status: 404 }
      )
    }

    return NextResponse.json({ report: updatedReport })
  } catch (error) {
    console.error("Error updating report:", error)
    return NextResponse.json(
      { error: "Failed to update report", report: null },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.reports.delete(params.id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting report:", error)
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    )
  }
}
