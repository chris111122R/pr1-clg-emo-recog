"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react"
import Link from "next/link"

import { AuthShell, FormError } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"

const OTP_LENGTH = 6

export default function OTPPage() {
  const router = useRouter()
  const [otp, setOtp] = React.useState<string[]>(Array(OTP_LENGTH).fill(""))
  const [isLoading, setIsLoading] = React.useState(false)
  const [formError, setFormError] = React.useState("")
  const [resendTimer, setResendTimer] = React.useState(30)
  const canResend = resendTimer <= 0
  const [resending, setResending] = React.useState(false)
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer
  React.useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && idx > 0) inputRefs.current[idx - 1]?.focus()
    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const raw = e.target.value.replace(/\D/g, "")
    setFormError("")

    if (raw.length > 1) {
      // Handle paste
      const chars = raw.slice(0, OTP_LENGTH - idx).split("")
      const next = [...otp]
      chars.forEach((char, i) => { if (idx + i < OTP_LENGTH) next[idx + i] = char })
      setOtp(next)
      const focusIdx = Math.min(idx + chars.length, OTP_LENGTH - 1)
      inputRefs.current[focusIdx]?.focus()
      return
    }

    const next = [...otp]
    next[idx] = raw.slice(-1)
    setOtp(next)

    if (raw && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join("")
    if (code.length < OTP_LENGTH) {
      setFormError("Please enter all 6 digits of the verification code.")
      return
    }
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    // Simulate wrong code for demo (any code starting with 0 fails)
    if (code.startsWith("0")) {
      setFormError("That code is incorrect or has expired. Please try again or request a new one.")
      setOtp(Array(OTP_LENGTH).fill(""))
      inputRefs.current[0]?.focus()
      return
    }
    router.push("/welcome")
  }

  async function handleResend() {
    setResending(true)
    await new Promise((r) => setTimeout(r, 800))
    setResending(false)
    setResendTimer(30)
    setOtp(Array(OTP_LENGTH).fill(""))
    inputRefs.current[0]?.focus()
  }

  const isFilled = otp.every(Boolean)

  return (
    <AuthShell
      title="Check your email"
      description="We sent a 6-digit verification code to your email address. It expires in 10 minutes."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <FormError message={formError} />

        {/* OTP Segmented Input */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <input
                ref={(el) => { inputRefs.current[idx] = el }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                aria-label={`Digit ${idx + 1} of ${OTP_LENGTH}`}
                className={`
                  w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold
                  rounded-xl border-2 bg-background
                  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
                  transition-all duration-150
                  ${formError ? "border-destructive focus:ring-destructive" : ""}
                  ${digit ? "border-primary/60 bg-primary/5" : "border-border"}
                  caret-primary
                `}
              />
            </motion.div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-1.5">
          {otp.map((d, i) => (
            <motion.div
              key={i}
              className={`h-1 w-8 rounded-full transition-colors duration-200 ${d ? "bg-primary" : "bg-muted"}`}
              animate={{ scaleX: d ? 1 : 0.7 }}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base"
          isLoading={isLoading}
          disabled={!isFilled || isLoading}
        >
          {isLoading ? "Verifying…" : "Verify code"}
        </Button>

        {/* Resend */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive a code?
          </p>
          {canResend ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResend}
              isLoading={resending}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Resend code
            </Button>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">
              Resend in <span className="text-foreground tabular-nums">{resendTimer}s</span>
            </p>
          )}
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </form>
    </AuthShell>
  )
}
