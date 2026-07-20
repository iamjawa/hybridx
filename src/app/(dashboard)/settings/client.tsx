"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { Download, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react"
import { exportPlantsCSV, exportSeedlingsCSV, exportCrossesCSV } from "@/server/actions/export"
import { toast } from "sonner"

export function SettingsClient() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleExport(type: string, exporter: () => Promise<string>, filename: string) {
    setLoading(type)
    try {
      const csv = await exporter()
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Export downloaded")
    } catch {
      toast.error("Export failed")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Settings" description="Manage your account and data" />

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="size-4" />Export My Data</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Download your breeding data as CSV files. Your data belongs to you — export it anytime.</p>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-between" disabled={loading === "plants"} onClick={() => handleExport("plants", exportPlantsCSV, "hybridx-plants.csv")}>
              <span className="flex items-center gap-2"><FileSpreadsheet className="size-4" />Export Plants</span>
              {loading === "plants" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            </Button>
            <Button variant="outline" className="w-full justify-between" disabled={loading === "seedlings"} onClick={() => handleExport("seedlings", exportSeedlingsCSV, "hybridx-seedlings.csv")}>
              <span className="flex items-center gap-2"><FileSpreadsheet className="size-4" />Export Seedlings</span>
              {loading === "seedlings" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            </Button>
            <Button variant="outline" className="w-full justify-between" disabled={loading === "crosses"} onClick={() => handleExport("crosses", exportCrossesCSV, "hybridx-crosses.csv")}>
              <span className="flex items-center gap-2"><FileSpreadsheet className="size-4" />Export Crosses</span>
              {loading === "crosses" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
