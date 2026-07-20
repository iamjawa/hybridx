"use server"

import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/lib/types"
import { requireUserId } from "@/lib/require-user"
import { trackEvent, EVENTS } from "@/lib/tracking"
import { FeedbackSchema } from "@/lib/validations"
import { z } from "zod/v4"

export async function submitFeedback(data: { type: string; message: string; route?: string }): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const parsed = FeedbackSchema.parse(data)
    await prisma.feedback.create({ data: { ...parsed, userId } })
    trackEvent(EVENTS.FEEDBACK_SUBMITTED, { type: data.type })
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues.map(e => e.message).join(", ") }
    return { success: false, error: "Failed to submit feedback" }
  }
}
