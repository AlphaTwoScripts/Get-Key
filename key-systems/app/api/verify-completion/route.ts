import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

// In production, use a proper database
const pendingLinks = new Map<string, { created: number; ip: string; completed?: boolean }>()
const generatedKeys = new Map<
  string,
  {
    key: string
    ip_lock?: string
    hwid_lock?: string
    created_at: string
    used_count: number
  }
>()

export async function POST(request: NextRequest) {
  try {
    const { linkId } = await request.json()
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"

    if (!linkId) {
      return NextResponse.json({ error: "Link ID is required" }, { status: 400 })
    }

    // Check if link exists and is valid
    const linkData = pendingLinks.get(linkId)
    if (!linkData) {
      return NextResponse.json(
        { error: "Invalid or expired link. Please start over to avoid bypass attempts." },
        { status: 400 },
      )
    }

    // Check if task was completed via Linkvertise callback
    if (!linkData.completed) {
      return NextResponse.json(
        { error: "Task not completed. Please complete the Linkvertise task first." },
        { status: 400 },
      )
    }

    // Verify IP matches (basic bypass prevention)
    if (linkData.ip !== ip) {
      pendingLinks.delete(linkId)
      return NextResponse.json(
        { error: "IP mismatch detected. Bypass attempt prevented. Please start over." },
        { status: 403 },
      )
    }

    // Check if link is too old (more than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000
    if (linkData.created < tenMinutesAgo) {
      pendingLinks.delete(linkId)
      return NextResponse.json({ error: "Link expired. Please generate a new one." }, { status: 400 })
    }

    // Generate license key
    const key = `KEY-${randomBytes(16).toString("hex").toUpperCase()}`
    const hwid = request.headers.get("x-hwid") // Custom header from client

    // Store key with locks
    const keyData = {
      key,
      ip_lock: ip,
      hwid_lock: hwid || undefined,
      created_at: new Date().toISOString(),
      used_count: 0,
    }

    generatedKeys.set(key, keyData)

    // Clean up used link
    pendingLinks.delete(linkId)

    return NextResponse.json({ key })
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
