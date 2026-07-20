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
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">{total} total</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" />
        </Button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => onPageChange(p)}>
            {p}
          </Button>
        ))}
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
