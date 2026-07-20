"use client"
import { ErrorPage } from "@/components/ui/error-page"
export default function SettingsError({ error, reset }: any) { return <ErrorPage error={error} reset={reset} label="settings" /> }
