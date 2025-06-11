import { NextResponse } from "next/server"

const mockAnalytics = {
  totalKeys: 156,
  activeKeys: 142,
  totalUsage: 2847,
  todayUsage: 89,
}

export async function GET() {
  return NextResponse.json(mockAnalytics)
}
