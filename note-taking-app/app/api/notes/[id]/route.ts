import { type NextRequest, NextResponse } from "next/server"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"
import jwt from "jsonwebtoken"

const DATA_DIR = join(process.cwd(), "data")
const NOTES_FILE = join(DATA_DIR, "notes.json")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

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

function verifyToken(authHeader: string | null): { userId: string; email: string } | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
  } catch {
    return null
  }
}

// GET /api/notes/[id] - Get a specific note
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const decoded = verifyToken(authHeader)

    if (!decoded) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const noteId = params.id
    const notes = readNotes()
    const note = notes.find((note) => note.id === noteId)

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Check if the note belongs to the authenticated user
    if (note.userId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized to access this note" }, { status: 403 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Get note error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/notes/[id] - Update a specific note
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const decoded = verifyToken(authHeader)

    if (!decoded) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
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

    const noteId = params.id
    const notes = readNotes()
    const noteIndex = notes.findIndex((note) => note.id === noteId)

    if (noteIndex === -1) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Check if the note belongs to the authenticated user
    if (notes[noteIndex].userId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized to update this note" }, { status: 403 })
    }

    // Update the note
    notes[noteIndex] = {
      ...notes[noteIndex],
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      category: category || "",
      updatedAt: new Date().toISOString(),
    }

    writeNotes(notes)

    return NextResponse.json(notes[noteIndex])
  } catch (error) {
    console.error("Update note error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/notes/[id] - Delete a specific note
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const decoded = verifyToken(authHeader)

    if (!decoded) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const noteId = params.id
    const notes = readNotes()
    const noteIndex = notes.findIndex((note) => note.id === noteId)

    if (noteIndex === -1) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Check if the note belongs to the authenticated user
    if (notes[noteIndex].userId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized to delete this note" }, { status: 403 })
    }

    // Remove the note
    notes.splice(noteIndex, 1)
    writeNotes(notes)

    return NextResponse.json({ message: "Note deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete note error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
