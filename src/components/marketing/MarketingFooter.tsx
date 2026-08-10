"use client"

import * as React from "react"
import Link from "next/link"

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/20 pb-12 pt-20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                U
              </div>
              <span className="font-bold text-xl tracking-tight">UA-EDT</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
              The premium AI SaaS platform for multimodal emotion analysis, explainable AI, and uncertainty-aware analytics.
            </p>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} UA-EDT Platform. All rights reserved.
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/technology" className="hover:text-foreground transition-colors">Technology</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Platform Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Research</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
