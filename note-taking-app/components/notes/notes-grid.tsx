"use client"

import { NoteCard } from "./note-card"

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  category?: string
}

interface NotesGridProps {
  notes: Note[]
  onDeleteNote: (noteId: string) => void
  onEditNote: (note: Note) => void
  onViewNote: (note: Note) => void
}

export function NotesGrid({ notes, onDeleteNote, onEditNote, onViewNote }: NotesGridProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
          <p className="text-gray-500">Create your first note above to get started organizing your thoughts!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onDelete={onDeleteNote} onEdit={onEditNote} onView={onViewNote} />
      ))}
    </div>
  )
}
