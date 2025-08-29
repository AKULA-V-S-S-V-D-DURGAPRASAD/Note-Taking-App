import { type NextRequest, NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { requireAuth } from "@/lib/auth-utils"

const DATA_DIR = join(process.cwd(), "data")
const USERS_FILE = join(DATA_DIR, "users.json")

interface User {
  id: string
  email: string
  name: string
  password: string
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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const authResult = requireAuth(authHeader)

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const users = readUsers()
    const user = users.find((u) => u.id === authResult.user.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { password, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
