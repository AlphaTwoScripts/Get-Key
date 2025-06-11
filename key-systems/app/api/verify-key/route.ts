import { type NextRequest, NextResponse } from "next/server"

// In production, use a proper database
const generatedKeys = new Map<
  string,
  {
    key: string
    ip_lock?: string
    hwid_lock?: string
    created_at: string
    used_count: number
    expires_at?: string
    status: "active" | "expired" | "revoked"
  }
>()

const usageLogs: Array<{
  id: string
  key_id: string
  ip: string
  hwid?: string
  timestamp: string
  success: boolean
}> = []

export async function POST(request: NextRequest) {
  try {
    const { key, hwid } = await request.json()
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"

    if (!key) {
      return NextResponse.json({ error: "Key is required", valid: false }, { status: 400 })
    }

    // Find key in database
    const keyData = generatedKeys.get(key)

    // Log usage attempt
    const logEntry = {
      id: Math.random().toString(36),
      key_id: key,
      ip,
      hwid,
      timestamp: new Date().toISOString(),
      success: false,
    }

    if (!keyData) {
      usageLogs.push(logEntry)
      return NextResponse.json({
        error: "Invalid key",
        valid: false,
      })
    }

    // Check if key is expired
    if (keyData.expires_at && new Date() > new Date(keyData.expires_at)) {
      keyData.status = "expired"
      usageLogs.push(logEntry)
      return NextResponse.json({
        error: "Key has expired",
        valid: false,
      })
    }

    // Check if key is revoked
    if (keyData.status === "revoked") {
      usageLogs.push(logEntry)
      return NextResponse.json({
        error: "Key has been revoked",
        valid: false,
      })
    }

    // Check IP lock
    if (keyData.ip_lock && keyData.ip_lock !== ip) {
      usageLogs.push(logEntry)
      return NextResponse.json({
        error: "Key is locked to a different IP address",
        valid: false,
      })
    }

    // Check HWID lock
    if (keyData.hwid_lock && keyData.hwid_lock !== hwid) {
      usageLogs.push(logEntry)
      return NextResponse.json({
        error: "Key is locked to a different hardware ID",
        valid: false,
      })
    }

    // Key is valid - update usage count and log success
    keyData.used_count += 1
    logEntry.success = true
    usageLogs.push(logEntry)

    return NextResponse.json({
      valid: true,
      message: "Key verified successfully",
      usage_count: keyData.used_count,
    })
  } catch (error) {
    return NextResponse.json({ error: "Verification failed", valid: false }, { status: 500 })
  }
}
