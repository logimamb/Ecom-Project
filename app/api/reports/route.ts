import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Report, CreateReportInput } from "@/lib/types"

export async function GET() {
  try {
    const reports = await db.reports.findAll()
    return NextResponse.json({ reports: Array.isArray(reports) ? reports : [] })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports", reports: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const timestamp = new Date().toISOString()
    
    const newReport: CreateReportInput = {
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      metrics: data.metrics || {},
      period: data.period,
      author: data.author,
      createdAt: timestamp,
      updatedAt: timestamp
    }
    
    const report = await db.reports.create(newReport)
    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json(
      { error: "Failed to create report", report: null },
      { status: 500 }
    )
  }
}
