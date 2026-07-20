import { prisma } from "@/lib/prisma"

export async function auditLog(params: {
  action: string
  entity: string
  entityId?: string
  userId?: string
  metadata?: Record<string, any>
}) {
  try {
    await prisma.auditLog.create({ data: params })
  } catch {
    // Audit logging is non-critical — never throw
  }
}
