"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface OtpFormProps {
  onVerifyOtp: (otp: string) => Promise<void>
  onBack: () => void
  loading: boolean
  email: string
}

export function OtpForm({ onVerifyOtp, onBack, loading, email }: OtpFormProps) {
  const [otp, setOtp] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onVerifyOtp(otp)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="otp">Enter OTP</Label>
        <Input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          required
          className="text-center text-lg tracking-widest"
        />
        <p className="text-sm text-gray-500 mt-1">Check your email ({email}) for the verification code</p>
      </div>
      <Button type="submit" disabled={loading || otp.length !== 6} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Verify OTP
      </Button>
      <Button type="button" variant="outline" onClick={onBack} className="w-full bg-transparent">
        Back to Signup
      </Button>
    </form>
  )
}
