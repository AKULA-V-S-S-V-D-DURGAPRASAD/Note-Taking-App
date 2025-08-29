import { type NextRequest, NextResponse } from "next/server"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"
import { generateTokens } from "@/lib/auth-utils"

const DATA_DIR = join(process.cwd(), "data")
const USERS_FILE = join(DATA_DIR, "users.json")
const OTP_FILE = join(DATA_DIR, "otps.json")

interface User {
  id: string
  email: string
  name: string
  password: string
  verified: boolean
  createdAt: string
}

interface OTP {
  email: string
  code: string
  expiresAt: string
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

function readOTPs(): OTP[] {
  if (!existsSync(OTP_FILE)) {
    return []
  }
  try {
    const data = readFileSync(OTP_FILE, "utf8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeOTPs(otps: OTP[]) {
  writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    const otps = readOTPs()
    const otpRecord = otps.find((record) => record.email === email && record.code === otp)

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
    }

    // Verify user
    const users = readUsers()
    const userIndex = users.findIndex((user) => user.email === email)

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    users[userIndex].verified = true
    writeUsers(users)

    // Remove used OTP
    const filteredOTPs = otps.filter((record) => record.email !== email)
    writeOTPs(filteredOTPs)

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(users[userIndex].id, users[userIndex].email)

    const { password, ...userWithoutPassword } = users[userIndex]

    return NextResponse.json({
      message: "Email verified successfully",
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
