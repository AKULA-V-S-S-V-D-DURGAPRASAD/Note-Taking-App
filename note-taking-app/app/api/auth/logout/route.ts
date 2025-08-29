import { type NextRequest, NextResponse } from "next/server"
import { blacklistToken, extractTokenFromHeader } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)

    if (token) {
      // Blacklist the current token
      blacklistToken(token)
    }

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
