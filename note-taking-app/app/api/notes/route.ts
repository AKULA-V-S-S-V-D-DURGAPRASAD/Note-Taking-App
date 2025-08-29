import { type NextRequest, NextResponse } from "next/server"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"
import { requireAuth } from "@/lib/auth-utils"

const DATA_DIR = join(process.cwd(), "data")
const NOTES_FILE = join(DATA_DIR, "notes.json")

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  require("fs").mkdirSync(DATA_DIR, { recursive: true })
}

interface Note {
  id: string
  title: string
  content: string
  userId: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  category?: string
}

function readNotes(): Note[] {
  if (!existsSync(NOTES_FILE)) {
    return []
  }
  try {
    const data = readFileSync(NOTES_FILE, "utf8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeNotes(notes: Note[]) {
  writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2))
}

// GET /api/notes - Get all notes for the authenticated user with filtering and search
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const authResult = requireAuth(authHeader)

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const notes = readNotes()
    let userNotes = notes.filter((note) => note.userId === authResult.user.userId)

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      userNotes = userNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower) ||
          (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(searchLower))),
      )
    }

    // Apply category filter
    if (category) {
      userNotes = userNotes.filter((note) => note.category === category)
    }

    // Apply sorting
    userNotes.sort((a, b) => {
      let aValue: string | number = ""
      let bValue: string | number = ""

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "updatedAt":
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        case "createdAt":
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return NextResponse.json(userNotes)
  } catch (error) {
    console.error("Get notes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const authResult = requireAuth(authHeader)

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { title, content, tags, category } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    if (title.length > 200) {
      return NextResponse.json({ error: "Title must be less than 200 characters" }, { status: 400 })
    }

    if (content.length > 10000) {
      return NextResponse.json({ error: "Content must be less than 10,000 characters" }, { status: 400 })
    }

    const notes = readNotes()
    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      userId: authResult.user.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: tags || [],
      category: category || "",
    }

    notes.push(newNote)
    writeNotes(notes)

    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    console.error("Create note error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
