import type { Opportunity } from "@/data/types"
import { STAGE_MAP } from "@/data/types"

const COLUMNS: { header: string; get: (o: Opportunity) => string | number }[] = [
  { header: "Candidate", get: (o) => o.name },
  { header: "Position", get: (o) => o.account },
  { header: "Recruiter", get: (o) => o.owner },
  { header: "Priority", get: (o) => o.priority },
  { header: "Stage", get: (o) => STAGE_MAP[o.stage].label },
  { header: "Expected Salary", get: (o) => o.amount },
  { header: "Likelihood", get: (o) => o.probability },
  { header: "Expected Start Date", get: (o) => o.closeDate },
]

function csvCell(value: string | number) {
  const s = String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function opportunitiesToCsv(rows: Opportunity[]): string {
  const header = COLUMNS.map((c) => csvCell(c.header)).join(",")
  const lines = rows.map((row) => COLUMNS.map((c) => csvCell(c.get(row))).join(","))
  return [header, ...lines].join("\r\n")
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
