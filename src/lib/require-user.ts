import { createClient } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function requireUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Unauthorized")
  return user
}

export async function requireUserId() {
  const user = await requireUser()
  try {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email ?? "" },
      create: { id: user.id, email: user.email ?? "", name: user.user_metadata?.full_name ?? user.email ?? "" },
    })
  } catch {
    // Non-critical: user record sync failure shouldn't block the action
  }
  return user.id
}
