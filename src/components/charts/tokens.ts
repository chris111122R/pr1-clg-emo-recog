// Design token helpers for workspace charts
// All values reference CSS custom properties — automatically correct in dark mode

export const C = {
  primary:     "hsl(var(--primary))",
  success:     "hsl(var(--success))",
  warning:     "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  info:        "hsl(var(--info))",
  muted:       "hsl(var(--muted-foreground))",
  border:      "hsl(var(--border))",
  card:        "hsl(var(--card))",
  bg:          "hsl(var(--background))",
  // Confidence gradient tokens (Phase 0)
  low:    "hsl(var(--confidence-low,  0 72% 51%))",
  medium: "hsl(var(--confidence-medium, 38 92% 50%))",
  high:   "hsl(var(--confidence-high, 174 80% 40%))",
  // Axis / text
  axisText: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } as const,
  grid:     { stroke: "hsl(var(--border))", strokeOpacity: 0.4, strokeDasharray: "3 6" },
}

/** Returns a CSS color string for a confidence value 0-100 */
export function confidenceColor(v: number): string {
  if (v >= 85) return C.high
  if (v >= 65) return C.medium
  return C.low
}

/** Maps confidence [0,100] → a linear interpolation hex for gradient fills */
export function confidenceFill(v: number, opacity = 0.25): string {
  const base = v >= 85 ? "#14b8a6" : v >= 65 ? "#eab308" : "#f43f5e"
  return base + Math.round(opacity * 255).toString(16).padStart(2, "0")
}
