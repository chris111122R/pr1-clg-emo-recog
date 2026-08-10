import * as React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    template: "%s | Admin | UA-EDT",
    default: "Admin | UA-EDT Platform",
  },
  description: "UA-EDT Platform Administration Console",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
