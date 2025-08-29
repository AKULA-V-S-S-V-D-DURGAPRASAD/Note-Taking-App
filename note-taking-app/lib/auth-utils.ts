import jwt from "jsonwebtoken"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface TokenPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

interface RefreshTokenPayload {
  userId: string
  email: string
  tokenVersion: number
  iat?: number
  exp?: number
}

interface BlacklistedToken {
  token: string
  expiresAt: string
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key-change-in-production"
const DATA_DIR = join(process.cwd(), "data")
const BLACKLIST_FILE = join(DATA_DIR, "token-blacklist.json")

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  require("fs").mkdirSync(DATA_DIR, { recursive: true })
}

export function rateLimit(identifier: string, maxAttempts = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= maxAttempts) {
    return false
  }

  entry.count++
  return true
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" }
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" }
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" }
  }

  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" }
  }

  return { valid: true }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

function readBlacklist(): BlacklistedToken[] {
  if (!existsSync(BLACKLIST_FILE)) {
    return []
  }
  try {
    const data = readFileSync(BLACKLIST_FILE, "utf8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeBlacklist(blacklist: BlacklistedToken[]) {
  writeFileSync(BLACKLIST_FILE, JSON.stringify(blacklist, null, 2))
}

export function generateTokens(userId: string, email: string): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "15m" })

  const refreshToken = jwt.sign({ userId, email, tokenVersion: Date.now() }, JWT_REFRESH_SECRET, { expiresIn: "7d" })

  return { accessToken, refreshToken }
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    // Check if token is blacklisted
    const blacklist = readBlacklist()
    const isBlacklisted = blacklist.some((entry) => entry.token === token)

    if (isBlacklisted) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function blacklistToken(token: string): void {
  try {
    const decoded = jwt.decode(token) as any
    if (decoded && decoded.exp) {
      const blacklist = readBlacklist()

      // Clean up expired tokens from blacklist
      const now = Math.floor(Date.now() / 1000)
      const validBlacklist = blacklist.filter((entry) => {
        const entryDecoded = jwt.decode(entry.token) as any
        return entryDecoded && entryDecoded.exp > now
      })

      // Add new token to blacklist
      validBlacklist.push({
        token,
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
      })

      writeBlacklist(validBlacklist)
    }
  } catch (error) {
    console.error("Error blacklisting token:", error)
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7)
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any
    if (!decoded || !decoded.exp) {
      return true
    }

    const now = Math.floor(Date.now() / 1000)
    return decoded.exp < now
  } catch {
    return true
  }
}

export function getTokenExpirationTime(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as any
    if (!decoded || !decoded.exp) {
      return null
    }
    return new Date(decoded.exp * 1000)
  } catch {
    return null
  }
}

// Enhanced authorization middleware
export function requireAuth(
  authHeader: string | null,
): { success: true; user: TokenPayload } | { success: false; error: string; status: number } {
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return { success: false, error: "Authorization token required", status: 401 }
  }

  if (isTokenExpired(token)) {
    return { success: false, error: "Token expired", status: 401 }
  }

  const user = verifyAccessToken(token)

  if (!user) {
    return { success: false, error: "Invalid or expired token", status: 401 }
  }

  return { success: true, user }
}
