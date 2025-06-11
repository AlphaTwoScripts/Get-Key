import { type NextRequest, NextResponse } from "next/server"

// In production, store this in a database
const pendingLinks = new Map<string, { created: number; ip: string; completed?: boolean }>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get("linkId")
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"

    if (!linkId) {
      return NextResponse.redirect(new URL("/?error=invalid_callback", request.url))
    }

    // Check if link exists
    const linkData = pendingLinks.get(linkId)
    if (!linkData) {
      return NextResponse.redirect(new URL("/?error=expired_link", request.url))
    }

    // Verify IP matches (basic bypass prevention)
    if (linkData.ip !== ip) {
      return NextResponse.redirect(new URL("/?error=ip_mismatch", request.url))
    }

    // Mark link as completed
    linkData.completed = true
    pendingLinks.set(linkId, linkData)

    // Redirect back to main page with success
    return NextResponse.redirect(new URL(`/?completed=${linkId}`, request.url))
  } catch (error) {
    return NextResponse.redirect(new URL("/?error=callback_failed", request.url))
  }
}
