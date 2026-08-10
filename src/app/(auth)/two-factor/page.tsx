"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ShieldCheck, KeyRound } from "lucide-react"
import Link from "next/link"

import { AuthShell, FieldError, FormError } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Mode = "authenticator" | "backup"

export default function TwoFactorPage() {
  const router = useRouter()
  const [mode, setMode] = React.useState<Mode>("authenticator")
  const [code, setCode] = React.useState("")
  const [codeError, setCodeError] = React.useState("")
  const [formError, setFormError] = React.useState("")
  const [touched, setTouched] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  function validate(value: string) {
    if (!value) return mode === "authenticator"
      ? "Please enter the 6-digit code from your authenticator app."
      : "Please enter one of your backup codes."
    if (mode === "authenticator" && !/^\d{6}$/.test(value))
      return "The authenticator code must be exactly 6 digits."
    if (mode === "backup" && value.length < 8)
      return "Backup codes are at least 8 characters long."
    return ""
  }

  function handleChange(value: string) {
    setCode(value)
    setFormError("")
    if (touched) setCodeError(validate(value))
  }

  function handleModeSwitch(nextMode: Mode) {
    setMode(nextMode)
    setCode("")
    setCodeError("")
    setFormError("")
    setTouched(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    const err = validate(code)
    setCodeError(err)
    if (err) return

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)

    // Simulate wrong code when "000000"
    if (code === "000000" || code === "00000000") {
      setFormError("That code is incorrect. Please check your authenticator app and try again.")
      return
    }
    router.push("/welcome")
  }

  return (
    <AuthShell
      title="Two-factor authentication"
      description={
        mode === "authenticator"
          ? "Open your authenticator app (e.g. Google Authenticator, Authy) and enter the 6-digit code."
          : "Enter one of your 8-character backup codes. Each code can only be used once."
      }
    >
      <AnimatePresence mode="wait">
        <motion.form
          key={mode}
          initial={{ opacity: 0, x: mode === "authenticator" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === "authenticator" ? 20 : -20 }}
          transition={{ duration: 0.25 }}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5"
        >
          {/* Mode indicator */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {mode === "authenticator"
                ? <ShieldCheck className="h-5 w-5 text-primary" />
                : <KeyRound className="h-5 w-5 text-primary" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold">
                {mode === "authenticator" ? "Authenticator App" : "Backup Code"}
              </p>
              <p className="text-xs text-muted-foreground">
                {mode === "authenticator" ? "Time-based one-time code" : "Single-use recovery code"}
              </p>
            </div>
          </div>

          <FormError message={formError} />

          <div className="space-y-1.5">
            <Label htmlFor="tfa-code">
              {mode === "authenticator" ? "Authenticator code" : "Backup code"}
            </Label>
            <Input
              id="tfa-code"
              type={mode === "authenticator" ? "text" : "text"}
              inputMode={mode === "authenticator" ? "numeric" : "text"}
              placeholder={mode === "authenticator" ? "123 456" : "xxxx-xxxx"}
              maxLength={mode === "authenticator" ? 6 : 24}
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => handleChange(
                mode === "authenticator"
                  ? e.target.value.replace(/\D/g, "").slice(0, 6)
                  : e.target.value
              )}
              onBlur={() => { setTouched(true); setCodeError(validate(code)) }}
              className={`
                text-center text-2xl font-mono tracking-[0.3em] h-14 text-lg
                ${codeError && touched ? "border-destructive focus-visible:ring-destructive" : ""}
              `}
            />
            {touched && <FieldError message={codeError} />}
            {mode === "authenticator" && (
              <p className="text-xs text-muted-foreground">Code refreshes every 30 seconds.</p>
            )}
          </div>

          <Button type="submit" className="w-full h-11 text-base" isLoading={isLoading}>
            {isLoading ? "Verifying…" : "Continue"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => handleModeSwitch(mode === "authenticator" ? "backup" : "authenticator")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === "authenticator"
                ? "Use a backup code instead"
                : "Use authenticator app instead"
              }
            </button>
          </div>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </motion.form>
      </AnimatePresence>
    </AuthShell>
  )
}
