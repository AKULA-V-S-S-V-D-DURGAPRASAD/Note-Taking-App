"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface AlertMessageProps {
  type: "error" | "success"
  message: string
  onDismiss?: () => void
}

export function AlertMessage({ type, message, onDismiss }: AlertMessageProps) {
  const isError = type === "error"

  return (
    <Alert className={`mb-4 ${isError ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
      {isError ? <AlertCircle className="h-4 w-4 text-red-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
      <AlertDescription className={isError ? "text-red-800" : "text-green-800"}>{message}</AlertDescription>
    </Alert>
  )
}
