import { type NextRequest, NextResponse } from "next/server"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"
import bcrypt from "bcryptjs"
import { rateLimit, validateEmail, validatePassword, sanitizeInput } from "@/lib/auth-utils"

const DATA_DIR = join(process.cwd(), "data")
const USERS_FILE = join(DATA_DIR, "users.json")
const OTP_FILE = join(DATA_DIR, "otps.json")

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  require("fs").mkdirSync(DATA_DIR, { recursive: true })
}

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

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"

    if (!rateLimit(`signup_${clientIP}`, 3, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many signup attempts. Please try again later." }, { status: 429 })
    }

    const { email, password, name } = await request.json()

    // Enhanced validation
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase())
    const sanitizedName = sanitizeInput(name)

    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 })
    }

    if (sanitizedName.length < 2 || sanitizedName.length > 50) {
      return NextResponse.json({ error: "Name must be between 2 and 50 characters" }, { status: 400 })
    }

    const users = readUsers()

    // Check if user already exists
    const existingUser = users.find((user) => user.email === sanitizedEmail)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user (unverified)
    const newUser: User = {
      id: Date.now().toString(),
      email: sanitizedEmail,
      name: sanitizedName,
      password: hashedPassword,
      verified: false,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    writeUsers(users)

    // Generate and store OTP
    const otpCode = generateOTP()
    const otps = readOTPs()

    // Remove any existing OTP for this email
    const filteredOTPs = otps.filter((otp) => otp.email !== sanitizedEmail)

    const newOTP: OTP = {
      email: sanitizedEmail,
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    }

    filteredOTPs.push(newOTP)
    writeOTPs(filteredOTPs)

    // In a real app, you would send the OTP via email
    console.log(`OTP for ${sanitizedEmail}: ${otpCode}`)

    return NextResponse.json({ message: "User created successfully. OTP sent to email." }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
