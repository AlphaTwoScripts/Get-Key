import { NextResponse } from "next/server"

// Mock data - in production, use a proper database
const mockKeys = [
  {
    id: "1",
    key: "KEY-ABCD1234EFGH5678IJKL9012MNOP3456",
    ip_lock: "192.168.1.100",
    created_at: "2024-01-15T10:30:00Z",
    used_count: 5,
    status: "active" as const,
  },
  {
    id: "2",
    key: "KEY-QRST7890UVWX1234YZAB5678CDEF9012",
    hwid_lock: "HWID-123456789",
    created_at: "2024-01-14T15:45:00Z",
    used_count: 12,
    status: "active" as const,
  },
]

export async function GET() {
  return NextResponse.json(mockKeys)
}
