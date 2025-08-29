"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Edit, X } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  tags?: string[]
  category?: string
}

interface NoteFormProps {
  onCreateNote: (title: string, content: string, tags: string[], category: string) => Promise<void>
  onUpdateNote?: (id: string, title: string, content: string, tags: string[], category: string) => Promise<void>
  editingNote?: Note | null
  onCancelEdit?: () => void
  loading: boolean
}

const CATEGORIES = ["Personal", "Work", "Ideas", "Tasks", "Learning", "Other"]

export function NoteForm({ onCreateNote, onUpdateNote, editingNote, onCancelEdit, loading }: NoteFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [category, setCategory] = useState("")
  const [tagInput, setTagInput] = useState("")

  const isEditing = !!editingNote

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title)
      setContent(editingNote.content)
      setTags(editingNote.tags || [])
      setCategory(editingNote.category || "")
    } else {
      setTitle("")
      setContent("")
      setTags([])
      setCategory("")
    }
  }, [editingNote])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    if (isEditing && onUpdateNote && editingNote) {
      await onUpdateNote(editingNote.id, title, content, tags, category)
    } else {
      await onCreateNote(title, content, tags, category)
    }

    if (!isEditing) {
      setTitle("")
      setContent("")
      setTags([])
      setCategory("")
      setTagInput("")
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleCancel = () => {
    if (onCancelEdit) {
      onCancelEdit()
    }
    setTitle("")
    setContent("")
    setTags([])
    setCategory("")
    setTagInput("")
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isEditing ? "Edit Note" : "Create New Note"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="noteTitle">Title</Label>
              <Input
                id="noteTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                required
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="noteCategory">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="noteTags">Tags</Label>
            <Input
              id="noteTags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter..."
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="noteContent">Content</Label>
            <Textarea
              id="noteContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-32 resize-none"
              required
              maxLength={10000}
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/10,000 characters</p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !title.trim() || !content.trim()} className="flex-1">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isEditing ? (
                <Edit className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isEditing ? "Update Note" : "Create Note"}
            </Button>
            {isEditing && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
