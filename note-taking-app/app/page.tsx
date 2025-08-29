"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthForms } from "@/components/auth/auth-forms"
import { OtpForm } from "@/components/auth/otp-form"
import { UserHeader } from "@/components/dashboard/user-header"
import { NoteForm } from "@/components/notes/note-form"
import { NotesGrid } from "@/components/notes/notes-grid"
import { NotesFilters } from "@/components/notes/notes-filters"
import { NoteViewModal } from "@/components/notes/note-view-modal"
import { AlertMessage } from "@/components/ui/alert-message"
import { useAuth } from "@/hooks/use-auth"

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  userId: string
  tags?: string[]
  category?: string
}

export default function NoteTakingApp() {
  const { user, loading: authLoading, isAuthenticated, login, logout, makeAuthenticatedRequest } = useAuth()

  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Auth states
  const [email, setEmail] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)

  // Note management states
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)

  // Filter states
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  // Get unique categories from notes
  const categories = Array.from(new Set(notes.filter((note) => note.category).map((note) => note.category!)))

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes()
    }
  }, [isAuthenticated])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("")
        setSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (category !== "all") params.append("category", category)
      params.append("sortBy", sortBy)
      params.append("sortOrder", sortOrder)

      const response = await makeAuthenticatedRequest(`/api/notes?${params.toString()}`)

      if (response.ok) {
        const notesData = await response.json()
        setNotes(notesData)
      } else {
        setError("Failed to fetch notes")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  // Refetch notes when filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes()
    }
  }, [search, category, sortBy, sortOrder, isAuthenticated])

  const handleSignup = async (email: string, password: string, name: string) => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmail(email)
        setSuccess("OTP sent to your email. Please check and enter the code.")
        setShowOtpInput(true)
      } else {
        setError(data.error || "Signup failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        await login(data.accessToken, data.refreshToken, data.user)
        setSuccess("Account verified successfully!")
        setShowOtpInput(false)
      } else {
        setError(data.error || "OTP verification failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        await login(data.accessToken, data.refreshToken, data.user)
        setSuccess("Login successful!")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNote = async (title: string, content: string, tags: string[], category: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await makeAuthenticatedRequest("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags, category }),
      })

      if (response.ok) {
        const newNote = await response.json()
        setNotes([newNote, ...notes])
        setSuccess("Note created successfully!")
      } else {
        setError("Failed to create note")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNote = async (id: string, title: string, content: string, tags: string[], category: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await makeAuthenticatedRequest(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags, category }),
      })

      if (response.ok) {
        const updatedNote = await response.json()
        setNotes(notes.map((note) => (note.id === id ? updatedNote : note)))
        setEditingNote(null)
        setSuccess("Note updated successfully!")
      } else {
        setError("Failed to update note")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== noteId))
        setViewingNote(null)
        setSuccess("Note deleted successfully!")
      } else {
        setError("Failed to delete note")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const handleLogout = async () => {
    await logout()
    setNotes([])
    setEmail("")
    setShowOtpInput(false)
    setEditingNote(null)
    setViewingNote(null)
    setSuccess("Logged out successfully!")
  }

  const handleGoogleSuccess = async (token: string) => {
    // This would be handled by the Google OAuth flow
    // For now, we'll simulate it
    setSuccess("Google login successful!")
  }

  const handleGoogleError = (error: string) => {
    setError(error)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setViewingNote(null)
  }

  const handleViewNote = (note: Note) => {
    setViewingNote(note)
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
  }

  // Show loading spinner during auth initialization
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Authenticated user dashboard
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <UserHeader user={user} onLogout={handleLogout} />

          {/* Alert Messages */}
          {error && <AlertMessage type="error" message={error} />}
          {success && <AlertMessage type="success" message={success} />}

          <NoteForm
            onCreateNote={handleCreateNote}
            onUpdateNote={handleUpdateNote}
            editingNote={editingNote}
            onCancelEdit={handleCancelEdit}
            loading={loading}
          />

          <NotesFilters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            categories={categories}
          />

          <NotesGrid
            notes={notes}
            onDeleteNote={handleDeleteNote}
            onEditNote={handleEditNote}
            onViewNote={handleViewNote}
          />

          <NoteViewModal
            note={viewingNote}
            isOpen={!!viewingNote}
            onClose={() => setViewingNote(null)}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
          />
        </div>
      </div>
    )
  }

  // Authentication flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">NoteTaker</CardTitle>
          <CardDescription>Sign up or login to manage your notes</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Alert Messages */}
          {error && <AlertMessage type="error" message={error} />}
          {success && <AlertMessage type="success" message={success} />}

          {showOtpInput ? (
            <OtpForm
              onVerifyOtp={handleVerifyOtp}
              onBack={() => setShowOtpInput(false)}
              loading={loading}
              email={email}
            />
          ) : (
            <AuthForms
              onSignup={handleSignup}
              onLogin={handleLogin}
              onGoogleSuccess={handleGoogleSuccess}
              onGoogleError={handleGoogleError}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
