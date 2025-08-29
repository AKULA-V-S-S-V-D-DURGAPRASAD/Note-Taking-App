import { type NextRequest, NextResponse } from "next/server"
import { verifyRefreshToken, generateTokens } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }

    const decoded = verifyRefreshToken(refreshToken)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, decoded.email)

    return NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
      message: "Tokens refreshed successfully",
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
