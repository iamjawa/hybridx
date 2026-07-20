"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Download, Loader2, FileDown } from "lucide-react"
import Link from "next/link"
import { parseCSV, validateImport, importPlants } from "@/server/actions/import"
import { toast } from "sonner"
import { PageHeader } from "@/components/ui/page-header"

type Step = "upload" | "mapping" | "preview" | "result"

const COLUMN_OPTIONS = [
  { value: "name", label: "Plant Name *", required: true },
  { value: "species", label: "Species" },
  { value: "varietyName", label: "Variety Name" },
  { value: "year", label: "Year" },
  { value: "colour", label: "Colour" },
  { value: "fragrance", label: "Fragrance" },
  { value: "diseaseResistance", label: "Disease Resistance" },
  { value: "repeatFlowering", label: "Repeat Flowering" },
  { value: "origin", label: "Origin" },
  { value: "description", label: "Description" },
  { value: "status", label: "Status" },
  { value: "seedParent", label: "Seed Parent" },
  { value: "pollenParent", label: "Pollen Parent" },
  { value: "skip", label: "— Skip column" },
]

function downloadTemplate(type: string) {
  const csv = type === "rose"
    ? `Name,Seed Parent,Pollen Parent,Year,Colour,Fragrance,Disease Resistance,Repeat Flowering,Origin,Notes\nPeace,,,1945,Yellow blend,Strong fruity,Good,Yes,France,The most famous rose\nDouble Delight,,,1977,White and red blend,Strong spicy,Moderate,Yes,USA\nGraham Thomas,,,1983,Rich yellow,Strong tea,Good,Yes,UK\nIceberg,,,1958,White,Light sweet,Excellent,Yes,Germany\nMister Lincoln,,,1964,Deep red,Strong damask,Moderate,No,USA`
    : `Name,Species,Variety Name,Year,Colour,Fragrance,Origin,Status,Notes\nExample Plant 1,Rose,Example Variety,2024,Pink,Light,Local garden,ACTIVE,First plant\nExample Plant 2,Rose,,2023,Red,Strong,,ACTIVE,`
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = `${type}-template.csv`; a.click()
  URL.revokeObjectURL(url)
}

export function ImportClient() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>("upload")
  const [csvText, setCsvText] = useState("")
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [columnMap, setColumnMap] = useState<Record<string, string>>({})
  const [validation, setValidation] = useState<any>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) { toast.error("Please select a CSV file"); return }
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large (max 5MB)"); return }

    setLoading(true)
    const text = await file.text()
    const parsed = await parseCSV(text)
    setLoading(false)

    if (!parsed.success) { toast.error(parsed.error); return }

    setCsvText(text)
    setHeaders(parsed.data!.headers)
    setRows(parsed.data!.rows)

    const autoMap: Record<string, string> = {}
    const headerLower = parsed.data!.headers.map((h) => h.toLowerCase().replace(/[^a-z]/g, ""))
    const knownFields = ["name", "species", "variety", "varietyname", "year", "colour", "color", "fragrance", "diseaseresistance", "disease", "repeatflowering", "repeat", "origin", "description", "status", "seedparent", "seed", "pollenparent", "pollen"]
    const fieldValues = ["name", "species", "varietyName", "year", "colour", "fragrance", "diseaseResistance", "repeatFlowering", "origin", "description", "status", "seedParent", "pollenParent"]

    parsed.data!.headers.forEach((h, i) => {
      const hl = h.toLowerCase().replace(/[^a-z]/g, "")
      const idx = knownFields.indexOf(hl)
      if (idx >= 0) autoMap[h] = fieldValues[idx]
    })

    setColumnMap(autoMap)
    setStep("mapping")
  }

  async function handleValidate() {
    const mapped = Object.fromEntries(
      Object.entries(columnMap).filter(([, v]) => v && v !== "skip")
    )
    if (!Object.values(mapped).includes("name")) { toast.error("Map a column to Plant Name"); return }

    setLoading(true)
    const result = await validateImport(rows, mapped as any)
    setLoading(false)

    if (!result.success) { toast.error(result.error); return }
    setValidation(result.data)
    setStep("preview")
  }

  async function handleImport() {
    const mapped = Object.fromEntries(
      Object.entries(columnMap).filter(([, v]) => v && v !== "skip")
    )
    setLoading(true)
    const result = await importPlants(rows, mapped as any)
    setLoading(false)

    if (!result.success) { toast.error(result.error); return }
    setResult(result.data)
    setStep("result")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Import Plants"
        description="Import your breeding records from a CSV file"
      />

      {step === "upload" && (
        <Card>
          <CardContent className="py-12">
            <div
              className="flex flex-col items-center gap-4 cursor-pointer"
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) handleFile(file)
              }}
            >
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <Upload className="size-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">Upload your CSV file</p>
                <p className="text-sm text-muted-foreground mt-1">Drag and drop, or click to browse (max 5MB)</p>
              </div>
              <Button variant="outline" disabled={loading}>
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <FileSpreadsheet className="mr-2 size-4" />}
                Select CSV
              </Button>
              {loading && <p className="text-sm text-muted-foreground">Parsing file...</p>}
            </div>
            <input ref={fileInput} type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
          </CardContent>
        </Card>
      )}

      {step === "mapping" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Map Columns</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Match your CSV columns to HybridX fields</p>
              {headers.map((header) => (
                <div key={header} className="flex items-center gap-4">
                  <div className="w-40 shrink-0">
                    <p className="text-sm font-medium truncate">{header}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                  <Select value={columnMap[header] ?? "skip"} onValueChange={(v) => setColumnMap({ ...columnMap, [header]: v ?? "skip" })}>
                    <SelectTrigger className="flex-1"><SelectValue>{COLUMN_OPTIONS.find(o => o.value === (columnMap[header] ?? "skip"))?.label}</SelectValue></SelectTrigger>
                    <SelectContent>
                      {COLUMN_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
            <Button onClick={handleValidate} disabled={loading}>
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Validate & Preview
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && validation && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Validation Results</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 text-center rounded-lg border p-4">
                  <p className="text-2xl font-semibold text-emerald-500">{validation.valid}</p>
                  <p className="text-xs text-muted-foreground">Ready to import</p>
                </div>
                <div className="flex-1 text-center rounded-lg border p-4">
                  <p className="text-2xl font-semibold text-amber-500">{validation.warnings?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
                <div className="flex-1 text-center rounded-lg border p-4">
                  <p className="text-2xl font-semibold text-red-500">{validation.errors?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
              </div>

              {validation.errors?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-500">Errors</p>
                  {validation.errors.map((e: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <XCircle className="size-3 text-red-500" />
                      <span>Row {e.row}: {e.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {validation.warnings?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-500">Warnings</p>
                  {validation.warnings.slice(0, 5).map((w: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="size-3 text-amber-500" />
                      <span>Row {w.row}: {w.message}</span>
                    </div>
                  ))}
                  {validation.warnings.length > 5 && <p className="text-xs text-muted-foreground">+{validation.warnings.length - 5} more warnings</p>}
                </div>
              )}

              <div className="rounded-lg border max-h-48 overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {headers.slice(0, 6).map((h) => <th key={h} className="p-2 text-left font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b">
                        {headers.slice(0, 6).map((h) => <td key={h} className="p-2 truncate max-w-[120px]">{row[h]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">Showing first 5 of {rows.length} rows</p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("mapping")}>Back</Button>
            <Button onClick={handleImport} disabled={loading || validation.valid === 0}>
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Import {validation.valid} Plants
            </Button>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CheckCircle2 className="size-8 text-emerald-500" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Import Complete</h2>
              <p className="text-sm text-muted-foreground mt-1">Your plants have been imported</p>
            </div>
            <div className="flex justify-center gap-4">
              <div className="text-center"><p className="text-2xl font-semibold text-emerald-500">{result.created}</p><p className="text-xs text-muted-foreground">Created</p></div>
              <div className="text-center"><p className="text-2xl font-semibold text-amber-500">{result.skipped}</p><p className="text-xs text-muted-foreground">Skipped</p></div>
              <div className="text-center"><p className="text-2xl font-semibold text-red-500">{result.errors}</p><p className="text-xs text-muted-foreground">Errors</p></div>
            </div>
            <div className="flex justify-center gap-3">
              <Link href="/plants"><Button variant="default">View Plants</Button></Link>
              <Button variant="outline" onClick={() => { setStep("upload"); setResult(null); setRows([]) }}>Import Another</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Download className="size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Need a template?</p>
              <p className="text-xs text-muted-foreground">Download a starter CSV template</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadTemplate("rose")}><FileDown className="mr-1.5 size-3.5" />Rose Template</Button>
            <Button variant="outline" size="sm" onClick={() => downloadTemplate("general")}><FileDown className="mr-1.5 size-3.5" />General Template</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
