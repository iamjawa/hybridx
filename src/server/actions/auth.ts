"use server"

import { createClient } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { ActionResult } from "@/lib/types"
import { trackEvent, EVENTS } from "@/lib/tracking"

export async function signInWithEmail(email: string, password: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: error.message }
  redirect("/dashboard")
}

export async function signUp(email: string, password: string, name?: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (error) return { success: false, error: error.message }
  trackEvent(EVENTS.SIGNUP_COMPLETED, { email })
  return { success: true }
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) return { success: false, error: error.message }
  redirect("/login")
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signInWithGoogle(): Promise<ActionResult<{ url: string }>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hybridx-production.up.railway.app"
  if (!supabaseUrl) return { success: false, error: "Supabase not configured" }

  const redirectTo = `${siteUrl}/auth/callback`
  const url = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`

  return { success: true, data: { url } }
}

export async function syncCurrentUser(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }
    
    const { prisma } = await import("@/lib/prisma")
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email ?? "", name: user.user_metadata?.full_name ?? user.email ?? "" },
      create: { id: user.id, email: user.email ?? "", name: user.user_metadata?.full_name ?? user.email ?? "" },
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
