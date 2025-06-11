import { NextResponse } from "next/server"

const mockLogs = [
  {
    id: "1",
    key_id: "KEY-ABCD1234",
    ip: "192.168.1.100",
    hwid: "HWID-123456789",
    timestamp: "2024-01-15T14:30:00Z",
    success: true,
  },
]

export async function GET() {
  return NextResponse.json(mockLogs)
}
