"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Eye } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  category?: string
}

interface NoteCardProps {
  note: Note
  onDelete: (noteId: string) => void
  onEdit: (note: Note) => void
  onView: (note: Note) => void
}

export function NoteCard({ note, onDelete, onEdit, onView }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isUpdated = note.updatedAt !== note.createdAt

  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 text-balance">{note.title}</CardTitle>
            {note.category && (
              <Badge variant="outline" className="mt-1 text-xs">
                {note.category}
              </Badge>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={() => onView(note)}
              variant="ghost"
              size="sm"
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onEdit(note)}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onDelete(note.id)}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {isUpdated ? `Updated ${formatDate(note.updatedAt)}` : `Created ${formatDate(note.createdAt)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 line-clamp-4 text-pretty mb-3">{note.content}</p>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{note.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
