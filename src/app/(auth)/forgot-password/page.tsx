"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

import { AuthShell, FieldError, FormError } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [emailError, setEmailError] = React.useState("")
  const [formError, setFormError] = React.useState("")
  const [touched, setTouched] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  function validateEmail(value: string) {
    if (!value) return "Please enter your email address."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "That doesn't look like a valid email address."
    return ""
  }

  function handleChange(value: string) {
    setEmail(value)
    if (touched) setEmailError(validateEmail(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    const err = validateEmail(email)
    setEmailError(err)
    if (err) return

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <AuthShell
      title={submitted ? "Check your inbox" : "Reset your password"}
      description={
        submitted
          ? `We sent a recovery link to ${email}`
          : "Enter your work email and we'll send you a secure reset link."
      }
    >
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
          >
            <FormError message={formError} />

            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@institution.edu"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={() => { setTouched(true); setEmailError(validateEmail(email)) }}
                  className={`pl-9 ${touched && emailError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
              {touched && <FieldError message={emailError} />}
            </div>

            <Button type="submit" className="w-full h-11 text-base" isLoading={isLoading}>
              {isLoading ? "Sending link…" : "Send reset link"}
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                If this email is registered, you'll receive a link within a few minutes. Check your spam folder if you don't see it.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10"
                onClick={() => { setSubmitted(false); setEmail(""); setTouched(false) }}
              >
                Use a different email
              </Button>
              <Link href="/login">
                <Button className="w-full h-10">
                  Return to sign in
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}
