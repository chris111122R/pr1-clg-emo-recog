"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { AuthShell, FieldError, FormError } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormState {
  firstName: string
  lastName: string
  email: string
  institution: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

interface Errors {
  firstName?: string
  lastName?: string
  email?: string
  institution?: string
  password?: string
  confirmPassword?: string
  agreeToTerms?: string
  form?: string
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" }
  if (score === 2) return { score, label: "Fair", color: "bg-warning" }
  if (score === 3) return { score, label: "Good", color: "bg-success/70" }
  return { score, label: "Strong", color: "bg-success" }
}

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null
  const { score, label, color } = getPasswordStrength(password)

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? color : "bg-muted"
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        score <= 1 ? "text-destructive" : score === 2 ? "text-warning" : "text-success"
      }`}>
        Password strength: {label}
      </p>
    </div>
  )
}

function validate(values: FormState): Errors {
  const errors: Errors = {}
  if (!values.firstName) errors.firstName = "Please enter your first name."
  if (!values.lastName) errors.lastName = "Please enter your last name."
  if (!values.email) {
    errors.email = "Please enter your email address."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "That doesn't look like a valid email."
  }
  if (!values.password) {
    errors.password = "Please create a password."
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters."
  } else if (getPasswordStrength(values.password).score < 2) {
    errors.password = "Password is too weak. Try adding numbers or symbols."
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password."
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match."
  }
  if (!values.agreeToTerms) {
    errors.agreeToTerms = "You must agree to the Terms of Service to continue."
  }
  return errors
}

export default function RegisterPage() {
  const router = useRouter()
  const [values, setValues] = React.useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    institution: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [errors, setErrors] = React.useState<Errors>({})
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [touched, setTouched] = React.useState<Partial<Record<keyof FormState, boolean>>>({})

  function handleBlur(field: keyof FormState) {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors(validate(values))
  }

  function handleChange(field: keyof FormState, value: string | boolean) {
    const next = { ...values, [field]: value }
    setValues(next)
    if (touched[field]) setErrors(validate(next))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const allTouched = Object.keys(values).reduce(
      (acc, k) => ({ ...acc, [k]: true }), {}
    ) as Record<keyof FormState, boolean>
    setTouched(allTouched)
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setIsLoading(false)
    router.push("/otp")
  }

  return (
    <AuthShell
      title="Create your account"
      description="Start your free trial — no credit card required."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormError message={errors.form} />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="reg-first">First name</Label>
            <Input
              id="reg-first"
              placeholder="Jane"
              autoComplete="given-name"
              value={values.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              onBlur={() => handleBlur("firstName")}
              aria-invalid={!!errors.firstName && !!touched.firstName}
              aria-describedby={errors.firstName && touched.firstName ? "reg-first-error" : undefined}
              className={errors.firstName && touched.firstName ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {touched.firstName && <FieldError id="reg-first-error" message={errors.firstName} />}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-last">Last name</Label>
            <Input
              id="reg-last"
              placeholder="Doe"
              autoComplete="family-name"
              value={values.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              onBlur={() => handleBlur("lastName")}
              aria-invalid={!!errors.lastName && !!touched.lastName}
              aria-describedby={errors.lastName && touched.lastName ? "reg-last-error" : undefined}
              className={errors.lastName && touched.lastName ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {touched.lastName && <FieldError id="reg-last-error" message={errors.lastName} />}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Work email</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@institution.edu"
            autoComplete="email"
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={!!errors.email && !!touched.email}
            aria-describedby={errors.email && touched.email ? "reg-email-error" : undefined}
            className={errors.email && touched.email ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {touched.email && <FieldError id="reg-email-error" message={errors.email} />}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-institution">
            Institution <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="reg-institution"
            placeholder="Stanford Research Institute"
            autoComplete="organization"
            value={values.institution}
            onChange={(e) => handleChange("institution", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-password">Create password</Label>
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              aria-invalid={!!errors.password && !!touched.password}
              aria-describedby={errors.password && touched.password ? "reg-password-error" : undefined}
              className={`pr-10 ${errors.password && touched.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <AnimatePresence>
            {values.password && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PasswordStrengthMeter password={values.password} />
              </motion.div>
            )}
          </AnimatePresence>
          {touched.password && <FieldError id="reg-password-error" message={errors.password} />}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-confirm">Confirm password</Label>
          <div className="relative">
            <Input
              id="reg-confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              aria-invalid={!!errors.confirmPassword && !!touched.confirmPassword}
              aria-describedby={errors.confirmPassword && touched.confirmPassword ? "reg-confirm-error" : undefined}
              className={`pr-10 ${errors.confirmPassword && touched.confirmPassword ? "border-destructive focus-visible:ring-destructive" : values.confirmPassword && values.password === values.confirmPassword ? "border-success/60 focus-visible:ring-success/60" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {values.password && values.confirmPassword && values.password === values.confirmPassword ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {touched.confirmPassword && <FieldError id="reg-confirm-error" message={errors.confirmPassword} />}
        </div>

        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              checked={values.agreeToTerms}
              onChange={(e) => handleChange("agreeToTerms", e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring cursor-pointer mt-0.5"
            />
            <Label htmlFor="terms" className="cursor-pointer font-normal text-sm text-muted-foreground leading-relaxed">
              I agree to the{" "}
              <Link href="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
            </Label>
          </div>
          {touched.agreeToTerms && <FieldError id="terms-error" message={errors.agreeToTerms} />}
        </div>

        <Button type="submit" className="w-full h-11 text-base" isLoading={isLoading}>
          {isLoading ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
