import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const keyId = params.id

    // In production, delete from database
    // await db.delete('keys').where('id', keyId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete key" }, { status: 500 })
  }
}
