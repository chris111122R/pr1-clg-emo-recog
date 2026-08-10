"use client"

import * as React from "react"
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ─── Column definition ────────────────────────────────────────────────────────

export interface AdminColumn<T> {
  key: string
  header: string
  render?: (row: T, index: number) => React.ReactNode
  sortable?: boolean
  align?: "left" | "center" | "right"
  nowrap?: boolean
  width?: string
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdminTableProps<T extends Record<string, unknown>> {
  id?: string
  columns: AdminColumn<T>[]
  rows: T[]
  searchPlaceholder?: string
  searchKeys?: string[]
  defaultPageSize?: number
  onRowClick?: (row: T) => void
  filterSlot?: React.ReactNode
  headerSlot?: React.ReactNode
  className?: string
  emptyTitle?: string
  emptyDescription?: string
}

type SortDir = "asc" | "desc" | null

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminTable<T extends Record<string, unknown>>({
  columns,
  rows,
  searchPlaceholder = "Search…",
  searchKeys = [],
  defaultPageSize = 10,
  onRowClick,
  filterSlot,
  headerSlot,
  className,
  emptyTitle = "No results",
  emptyDescription = "No matching records found.",
}: AdminTableProps<T>) {
  const [search, setSearch] = React.useState("")
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortDir, setSortDir] = React.useState<SortDir>(null)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(defaultPageSize)

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(row =>
      searchKeys.some(k => String(row[k] ?? "").toLowerCase().includes(q))
    )
  }, [rows, search, searchKeys])

  // ── Sort ───────────────────────────────────────────────────────────────────
  const sorted = React.useMemo(() => {
    if (!sortKey || !sortDir) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null) return 1
      if (bv == null) return -1
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  function handleSort(key: string) {
    setPage(1)
    if (sortKey === key) {
      if (sortDir === "asc") { setSortDir("desc") }
      else if (sortDir === "desc") { setSortDir(null); setSortKey(null) }
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  function SortIcon({ col }: { col: AdminColumn<T> }) {
    if (!col.sortable) return null
    if (sortKey !== col.key)
      return <ChevronsUpDown className="h-3 w-3 ml-1 text-muted-foreground/40 inline-block" />
    if (sortDir === "asc")
      return <ChevronUp className="h-3 w-3 ml-1 text-primary inline-block" />
    return <ChevronDown className="h-3 w-3 ml-1 text-primary inline-block" />
  }

  const startRow = sorted.length === 0 ? 0 : (page - 1) * pageSize + 1
  const endRow = Math.min(page * pageSize, sorted.length)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="pl-8 h-8 text-sm"
          />
        </div>
        {filterSlot}
        {headerSlot && <div className="ml-auto">{headerSlot}</div>}
        {!headerSlot && (
          <span className="ml-auto text-xs text-muted-foreground">
            {sorted.length} result{sorted.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="relative rounded-lg border border-border bg-card overflow-hidden">
        {/* Right fade shadow for scroll affordance on mobile */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none md:hidden" />
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[640px] text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {columns.map(col => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      "px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase select-none whitespace-nowrap",
                      col.sortable && "cursor-pointer hover:text-foreground transition-colors",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    {col.header}
                    <SortIcon col={col} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center">
                    <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">{emptyDescription}</p>
                  </td>
                </tr>
              ) : (
                paginated.map((row, ri) => (
                  <tr
                    key={ri}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer hover:bg-muted/40"
                    )}
                  >
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-sm text-foreground",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.nowrap && "whitespace-nowrap",
                        )}
                      >
                        {col.render
                          ? col.render(row, ri)
                          : String(row[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination footer */}
      {sorted.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={v => { setPageSize(Number(v)); setPage(1) }}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50].map(n => (
                  <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{startRow}–{endRow} of {sorted.length}</span>
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium">{page} / {totalPages}</span>
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
