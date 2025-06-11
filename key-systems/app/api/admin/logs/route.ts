import { NextResponse } from "next/server"

// Mock data - in production, use a proper database
const mockLogs = [
  {
    id: "1",
    key_id: "KEY-ABCD1234",
    ip: "192.168.1.100",
    hwid: "HWID-123456789",
    timestamp: "2024-01-15T14:30:00Z",
    success: true,
  },
  {
    id: "2",
    key_id: "KEY-QRST7890",
    ip: "10.0.0.50",
    timestamp: "2024-01-15T14:25:00Z",
    success: false,
  },
  {
    id: "3",
    key_id: "KEY-GHIJ3456",
    ip: "203.0.113.1",
    hwid: "HWID-987654321",
    timestamp: "2024-01-15T14:20:00Z",
    success: true,
  },
]

export async function GET() {
  return NextResponse.json(mockLogs)
}
