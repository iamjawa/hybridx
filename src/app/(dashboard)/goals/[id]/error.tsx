"use client"
import { ErrorPage } from "@/components/ui/error-page"
export default function GoalDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorPage error={error} reset={reset} label="goal" />
}
