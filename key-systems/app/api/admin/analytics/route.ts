import { NextResponse } from "next/server"

// Mock analytics data - in production, calculate from database
const mockAnalytics = {
  totalKeys: 156,
  activeKeys: 142,
  totalUsage: 2847,
  todayUsage: 89,
}

export async function GET() {
  return NextResponse.json(mockAnalytics)
}
