"use client"

import { useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const hash = window.location.hash.slice(1)
      const hashParams = new URLSearchParams(hash)
      const accessToken = hashParams.get("access_token")

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          window.location.replace("/dashboard")
          return
        }
      }

      if (accessToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get("refresh_token") || "",
        })
        if (!error) {
          window.location.replace("/dashboard")
          return
        }
      }

      window.location.replace("/login?message=Could not authenticate")
    }
    handleCallback()
  }, [])

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
