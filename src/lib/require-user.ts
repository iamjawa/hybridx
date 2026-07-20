import { createClient } from "@/lib/auth"

export async function requireUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Unauthorized")
  return user
}

export async function requireUserId() {
  const user = await requireUser()
  return user.id
}
