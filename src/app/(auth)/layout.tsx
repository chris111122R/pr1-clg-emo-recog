import type { Metadata } from "next"
import { AuthTransitionWrapper } from "@/components/auth/AuthTransitionWrapper"

export const metadata: Metadata = {
  title: {
    template: "%s | UA-EDT",
    default: "Sign in | UA-EDT",
  },
  description: "Sign in to your UA-EDT account to access multimodal emotion analytics.",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthTransitionWrapper>{children}</AuthTransitionWrapper>
}
