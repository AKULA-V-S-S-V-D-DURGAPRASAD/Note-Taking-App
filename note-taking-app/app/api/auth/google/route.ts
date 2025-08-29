import { type NextRequest, NextResponse } from "next/server"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"
import jwt from "jsonwebtoken"

const DATA_DIR = join(process.cwd(), "data")
const USERS_FILE = join(DATA_DIR, "users.json")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  require("fs").mkdirSync(DATA_DIR, { recursive: true })
}

interface User {
  id: string
  email: string
  name: string
  password?: string
  verified: boolean
  createdAt: string
  googleId?: string
  avatar?: string
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

function writeUsers(users: User[]) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

// Mock Google token verification (in production, use Google's API)
async function verifyGoogleToken(token: string) {
  // This is a mock implementation
  // In production, you would verify the token with Google's API
  try {
    // Mock Google user data
    const mockGoogleUser = {
      sub: "google_" + Date.now(),
      email: "user@example.com",
      name: "John Doe",
      picture: "https://via.placeholder.com/150",
    }

    // In a real implementation, you would:
    // const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`)
    // const googleUser = await response.json()

    return mockGoogleUser
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { googleToken } = await request.json()

    if (!googleToken) {
      return NextResponse.json({ error: "Google token is required" }, { status: 400 })
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(googleToken)
    if (!googleUser) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 400 })
    }

    const users = readUsers()
    let user = users.find((u) => u.email === googleUser.email)

    if (!user) {
      // Create new user from Google data
      user = {
        id: Date.now().toString(),
        email: googleUser.email,
        name: googleUser.name,
        verified: true, // Google accounts are pre-verified
        createdAt: new Date().toISOString(),
        googleId: googleUser.sub,
        avatar: googleUser.picture,
      }
      users.push(user)
      writeUsers(users)
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = googleUser.sub
      user.avatar = googleUser.picture
      user.verified = true
      writeUsers(users)
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Google login successful",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Google auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
