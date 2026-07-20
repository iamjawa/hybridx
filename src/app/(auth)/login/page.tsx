import Link from "next/link"
import { createClient } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "./form"

export default async function LoginPage(props: { searchParams: Promise<{ setup?: string; message?: string }> }) {
  const searchParams = await props.searchParams

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const needsSetup = !supabaseUrl || !supabaseKey || searchParams.setup === "true"

  if (supabaseUrl && supabaseKey) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session) redirect("/dashboard")
  }

  return (
    <div id="main-content" className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">HybridX</h1>
          <p className="text-sm text-muted-foreground">Sign in to your breeding platform</p>
        </div>
        {needsSetup ? (
          <SetupRequired />
        ) : (
            <LoginForm message={searchParams.message} />
          )}
          <p className="text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
          </p>
      </div>
    </div>
  )
}

function SetupRequired() {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6 text-center space-y-4">
      <div className="text-amber-500 text-3xl">⚡</div>
      <div className="space-y-2">
        <h2 className="font-semibold">Supabase not configured</h2>
        <p className="text-sm text-muted-foreground">
          Add your Supabase project credentials to <code className="rounded bg-muted px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env</code>.
        </p>
      </div>
      <div className="rounded-lg bg-muted p-4 text-left text-xs space-y-1.5 font-mono">
        <p><span className="text-muted-foreground"># .env</span></p>
        <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</p>
      </div>
      <form action="/api/dev-login" method="POST" className="pt-2">
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted"
        >
          Continue without auth (dev only)
        </button>
      </form>
    </div>
  )
}
