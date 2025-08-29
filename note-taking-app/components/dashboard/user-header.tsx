"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface UserHeaderProps {
  user: {
    name: string
    avatar?: string
  }
  onLogout: () => void
}

export function UserHeader({ user, onLogout }: UserHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {user.avatar ? (
          <img
            src={user.avatar || "/placeholder.svg"}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-balance">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-1">Manage your notes and stay organized</p>
        </div>
      </div>
      <Button onClick={onLogout} variant="outline" className="flex items-center gap-2 bg-transparent">
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  )
}
