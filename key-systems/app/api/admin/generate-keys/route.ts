import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { count, lockType, expiryDays } = await request.json()

    if (!count || count < 1 || count > 100) {
      return NextResponse.json({ error: "Invalid key count (1-100)" }, { status: 400 })
    }

    const keys = []
    const now = new Date()
    const expiryDate = expiryDays ? new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000) : null

    for (let i = 0; i < count; i++) {
      const key = `KEY-${randomBytes(16).toString("hex").toUpperCase()}`

      const keyData = {
        id: randomBytes(8).toString("hex"),
        key,
        created_at: now.toISOString(),
        expires_at: expiryDate?.toISOString(),
        used_count: 0,
        status: "active" as const,
        ...(lockType === "ip" && { ip_lock: null }),
        ...(lockType === "hwid" && { hwid_lock: null }),
      }

      keys.push(keyData)
    }

    return NextResponse.json({
      success: true,
      count: keys.length,
      keys: keys.map((k) => k.key),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate keys" }, { status: 500 })
  }
}
