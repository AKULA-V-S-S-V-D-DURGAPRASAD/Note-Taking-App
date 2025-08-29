"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Calendar } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  category?: string
}

interface NoteViewModalProps {
  note: Note | null
  isOpen: boolean
  onClose: () => void
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
}

export function NoteViewModal({ note, isOpen, onClose, onEdit, onDelete }: NoteViewModalProps) {
  if (!note) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isUpdated = note.updatedAt !== note.createdAt

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl text-balance">{note.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                {note.category && <Badge variant="outline">{note.category}</Badge>}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {isUpdated ? `Updated ${formatDate(note.updatedAt)}` : `Created ${formatDate(note.createdAt)}`}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onEdit(note)} variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => onDelete(note.id)}
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">{note.content}</div>
          </div>

          {note.tags && note.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
