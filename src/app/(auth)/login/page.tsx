"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import { AuthShell, FieldError, FormError } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormState {
  email: string
  password: string
  rememberMe: boolean
}

interface Errors {
  email?: string
  password?: string
  form?: string
}

function validate(values: FormState): Errors {
  const errors: Errors = {}
  if (!values.email) {
    errors.email = "Please enter your email address."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "That doesn't look like a valid email address."
  }
  if (!values.password) {
    errors.password = "Please enter your password."
  } else if (values.password.length < 8) {
    errors.password = "Your password must be at least 8 characters."
  }
  return errors
}

export default function LoginPage() {
  const router = useRouter()
  const [values, setValues] = React.useState<FormState>({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = React.useState<Errors>({})
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [touched, setTouched] = React.useState<Partial<Record<keyof FormState, boolean>>>({})

  function handleBlur(field: keyof FormState) {
    setTouched((t) => ({ ...t, [field]: true }))
    const errs = validate(values)
    setErrors(errs)
  }

  function handleChange(field: keyof FormState, value: string | boolean) {
    const next = { ...values, [field]: value }
    setValues(next)
    if (touched[field]) {
      setErrors(validate(next))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    setTouched({ email: true, password: true })
    if (Object.keys(errs).length > 0) return

    setIsLoading(true)
    // Simulate network — redirect to OTP
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    router.push("/otp")
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your UA-EDT account to continue."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormError message={errors.form} />

        {/* SSO Row */}
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="h-10 text-sm gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
          <Button type="button" variant="outline" className="h-10 text-sm gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </Button>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or continue with email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email address</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@institution.edu"
            autoComplete="email"
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={!!errors.email && !!touched.email}
            aria-describedby={errors.email && touched.email ? "login-email-error" : undefined}
            className={errors.email && touched.email ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {touched.email && <FieldError id="login-email-error" message={errors.email} />}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              autoComplete="current-password"
              value={values.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              aria-invalid={!!errors.password && !!touched.password}
              aria-describedby={errors.password && touched.password ? "login-password-error" : undefined}
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
          {touched.password && <FieldError id="login-password-error" message={errors.password} />}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember-me"
            type="checkbox"
            checked={values.rememberMe}
            onChange={(e) => handleChange("rememberMe", e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
          />
          <Label htmlFor="remember-me" className="cursor-pointer font-normal text-sm text-muted-foreground">
            Remember me for 30 days
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base"
          isLoading={isLoading}
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
