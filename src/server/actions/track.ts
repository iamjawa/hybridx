"use server"

import { prisma } from "@/lib/prisma"

export async function trackEvent(event: string, metadata?: Record<string, any>, route?: string) {
  try {
    await prisma.analyticsEvent.create({
      data: { event, metadata: metadata ?? {}, route: route ?? null },
    })
  } catch {
    // Non-critical
  }
}
