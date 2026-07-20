"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import { submitFeedback } from "@/server/actions/feedback"
import { MessageSquareText, Send, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { usePathname } from "next/navigation"

export function FeedbackClient() {
  const pathname = usePathname()
  const [type, setType] = useState("GENERAL")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    const result = await submitFeedback({ type, message: message.trim(), route: pathname })
    setLoading(false)
    if (!result.success) { toast.error(result.error); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card><CardContent className="py-12 text-center space-y-3">
          <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
          <p className="text-lg font-semibold">Thank you!</p>
          <p className="text-sm text-muted-foreground">Your feedback helps make HybridX better for everyone.</p>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <PageHeader title="Give Feedback" description="Help us improve HybridX" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Category</p>
              <Select value={type} onValueChange={(v) => setType(v ?? "GENERAL")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUG">Bug report</SelectItem>
                  <SelectItem value="FEATURE_REQUEST">Feature suggestion</SelectItem>
                  <SelectItem value="CONFUSION">Something was confusing</SelectItem>
                  <SelectItem value="GENERAL">General feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">What happened?</p>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required placeholder="Tell us about your experience..." />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !message.trim()}>
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
              Send Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
