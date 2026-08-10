export interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
  label?: string
}

export interface NavItemWithChildren extends NavItem {
  items: NavItem[]
}

export type MainNavItem = NavItem
export type SidebarNavItem = NavItemWithChildren

export const docsConfig: {
  sidebarNav: SidebarNavItem[]
} = {
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        { title: "Introduction", href: "/docs" },
        { title: "Quickstart", href: "/docs/quickstart" },
        { title: "Architecture", href: "/docs/architecture" },
      ],
    },
    {
      title: "Tutorials",
      items: [
        { title: "Overview", href: "/docs/tutorials" },
        { title: "Digital Twin Setup", href: "/docs/tutorials/digital-twin-setup" },
        { title: "Live Video Inference", href: "/docs/tutorials/live-video" },
        { title: "Working with AffectNet", href: "/docs/tutorials/affectnet" },
      ],
    },
    {
      title: "Guides",
      items: [
        { title: "Overview", href: "/docs/guides" },
        { title: "Multimodal Fusion", href: "/docs/guides/multimodal-fusion" },
        { title: "FACS Integration", href: "/docs/guides/facs" },
        { title: "Security & Compliance", href: "/docs/guides/security" },
      ],
    },
    {
      title: "API Reference",
      items: [
        { title: "Overview", href: "/docs/api" },
        { title: "Authentication", href: "/docs/api/authentication" },
        { title: "Inference API", href: "/docs/api/inference" },
        { title: "Datasets API", href: "/docs/api/datasets" },
      ],
    },
    {
      title: "Knowledge Base",
      items: [
        { title: "Overview", href: "/docs/kb" },
        { title: "Billing & Quotas", href: "/docs/kb/billing" },
        { title: "Troubleshooting", href: "/docs/kb/troubleshooting" },
      ],
    },
  ],
}
