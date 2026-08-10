import * as React from "react"
import Link from "next/link"
import { Search, CreditCard, ShieldAlert, Cpu } from "lucide-react"
import { Input } from "@/components/ui/input"

const KB_CATEGORIES = [
  {
    title: "Billing & Quotas",
    icon: CreditCard,
    articles: [
      { title: "Understanding GPU Hour Billing", href: "/docs/kb/billing/gpu-hours" },
      { title: "How to upgrade your subscription", href: "/docs/kb/billing/upgrade" },
      { title: "Managing workspace quotas", href: "/docs/kb/billing/quotas" },
    ]
  },
  {
    title: "Security & Access",
    icon: ShieldAlert,
    articles: [
      { title: "Configuring SSO (SAML/OIDC)", href: "/docs/kb/security/sso" },
      { title: "Role-Based Access Control matrix", href: "/docs/kb/security/rbac" },
      { title: "Data retention policies", href: "/docs/kb/security/retention" },
    ]
  },
  {
    title: "Troubleshooting",
    icon: Cpu,
    articles: [
      { title: "Debugging dropped WebSocket frames", href: "/docs/kb/troubleshooting/websockets" },
      { title: "Why is FACS inference failing?", href: "/docs/kb/troubleshooting/facs-errors" },
      { title: "Resolving rate limit (429) errors", href: "/docs/kb/troubleshooting/rate-limits" },
    ]
  }
]

export default function KnowledgeBasePage() {
  return (
    <div className="max-w-4xl space-y-10">
      <div className="text-center py-10">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          Knowledge Base
        </h1>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search articles, FAQs, and troubleshooting guides..." 
            className="pl-10 h-12 text-base rounded-full bg-muted/50 border-muted-foreground/20"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {KB_CATEGORIES.map((category) => {
          const Icon = category.icon
          return (
            <div key={category.title} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">{category.title}</h2>
              </div>
              <ul className="space-y-3">
                {category.articles.map((article) => (
                  <li key={article.title}>
                    <Link 
                      href={article.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link 
                href="#" 
                className="inline-block mt-6 text-sm font-semibold text-primary hover:underline"
              >
                View all in {category.title} &rarr;
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
