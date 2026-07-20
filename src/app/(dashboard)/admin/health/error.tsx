"use client"
import { ErrorPage } from "@/components/ui/error-page"
export default function HealthError({ error, reset }: any) { return <ErrorPage error={error} reset={reset} label="health dashboard" /> }
