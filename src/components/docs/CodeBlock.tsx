"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  code: string
  language?: string
}

export function CodeBlock({ code, language = "bash", className, ...props }: CodeBlockProps) {
  const [hasCopied, setHasCopied] = React.useState(false)

  const copyToClipboard = React.useCallback(() => {
    navigator.clipboard.writeText(code)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }, [code])

  return (
    <div className="relative group rounded-lg overflow-hidden my-4 border border-border/40 bg-zinc-950 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/20 bg-zinc-900/50">
        <span className="text-xs font-mono text-zinc-400">{language}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center h-6 w-6 rounded-md bg-transparent hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100"
          aria-label="Copy code"
        >
          {hasCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className={cn("text-sm font-mono text-zinc-50", className)} {...props}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}
