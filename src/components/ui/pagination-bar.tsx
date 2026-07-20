import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationBarProps {
  page: number
  pages: number
  total: number
  onPageChange: (page: number) => void
}

export function PaginationBar({ page, pages, total, onPageChange }: PaginationBarProps) {
  if (pages <= 1) return null
  function go(p: number) {
    onPageChange(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">{total} total</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => go(page - 1)}>
          <ChevronLeft className="size-4" />
        </Button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => go(p)}>
            {p}
          </Button>
        ))}
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => go(page + 1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
