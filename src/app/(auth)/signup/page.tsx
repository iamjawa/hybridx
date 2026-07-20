"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { signUp } from "@/server/actions/auth"
import { Sprout, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return }
    setLoading(true)
    const result = await signUp(email, password, name)
    setLoading(false)
    if (!result.success) { toast.error(result.error); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CheckCircle2 className="size-8 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Check your email</h2>
              <p className="text-sm text-muted-foreground">We sent a confirmation link to {email}</p>
            </div>
            <p className="text-xs text-muted-foreground">Click the link to verify your account, then sign in.</p>
            <Link href="/login"><Button variant="outline" className="w-full">Go to Sign In <ArrowRight className="ml-2 size-4" /></Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div id="main-content" className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
              <Sprout className="size-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start your breeding programme with HybridX</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="breeder@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 8 characters" />
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className={password.length >= 8 ? "text-emerald-500" : ""}>✓ At least 8 characters</p>
                  <p className={/\d/.test(password) ? "text-emerald-500" : ""}>✓ Contains a number</p>
                  <p className={/[A-Z]/.test(password) ? "text-emerald-500" : ""}>✓ Contains an uppercase letter</p>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Create account
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
