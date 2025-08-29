import { type NextRequest, NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import bcrypt from "bcryptjs"
import { rateLimit, validateEmail, sanitizeInput, generateTokens } from "@/lib/auth-utils"

const DATA_DIR = join(process.cwd(), "data")
const USERS_FILE = join(DATA_DIR, "users.json")

interface User {
  id: string
  email: string
  name: string
  password?: string
  verified: boolean
  createdAt: string
  googleId?: string
}

function readUsers(): User[] {
  if (!existsSync(USERS_FILE)) {
    return []
  }
  try {
    const data = readFileSync(USERS_FILE, "utf8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"

    if (!rateLimit(`login_${clientIP}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 })
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase())

    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    const users = readUsers()
    const user = users.find((u) => u.email === sanitizedEmail)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (!user.verified) {
      return NextResponse.json({ error: "Please verify your email first" }, { status: 401 })
    }

    if (!user.password && user.googleId) {
      return NextResponse.json(
        { error: "This account uses Google login. Please sign in with Google." },
        { status: 401 },
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email)

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
