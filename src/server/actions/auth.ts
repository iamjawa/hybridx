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

export async function signUp(email: string, password: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` } })
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
