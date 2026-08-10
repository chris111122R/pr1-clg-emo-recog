"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Paperclip, Send, Bot, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface Message {
  id: string
  role: "user" | "ai"
  content: string
  timestamp: string
}

export function AIChatPanel({
  className,
  messages = [],
  isStreaming = false,
}: {
  className?: string
  messages?: Message[]
  isStreaming?: boolean
}) {
  return (
    <div className={cn("flex flex-col h-full rounded-xl border bg-card shadow-sm overflow-hidden", className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            <Avatar className="h-8 w-8 shrink-0">
              {msg.role === "ai" ? (
                <div className="bg-primary h-full w-full flex items-center justify-center text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </div>
              ) : (
                <AvatarFallback>U</AvatarFallback>
              )}
            </Avatar>
            <div
              className={cn(
                "rounded-2xl px-4 py-3 max-w-[80%] text-sm shadow-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted text-foreground rounded-tl-sm"
              )}
            >
              <p className="leading-relaxed">{msg.content}</p>
              <span className={cn("text-xs mt-2 block opacity-70", msg.role === "user" ? "text-right" : "text-left")}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex gap-4 flex-row">
            <Avatar className="h-8 w-8 shrink-0">
              <div className="bg-primary h-full w-full flex items-center justify-center text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
            </Avatar>
            <div className="rounded-2xl bg-muted px-4 py-3 max-w-[80%] rounded-tl-sm flex items-center gap-1">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="h-2 w-2 rounded-full bg-primary"
              />
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}
                className="h-2 w-2 rounded-full bg-primary"
              />
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }}
                className="h-2 w-2 rounded-full bg-primary"
              />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-background border-t">
        <div className="relative flex items-end gap-2 bg-muted rounded-xl p-2 border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-shadow">
          <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 rounded-lg hover:bg-background">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Textarea
            placeholder="Ask the emotional twin..."
            className="min-h-[20px] max-h-32 resize-none border-0 bg-transparent p-2 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 shadow-none"
            rows={1}
          />
          <Button size="icon" className="shrink-0 h-9 w-9 rounded-lg">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
