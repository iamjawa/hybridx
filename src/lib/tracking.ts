import { prisma } from "@/lib/prisma"

const EVENTS = {
  SIGNUP_COMPLETED: "SIGNUP_COMPLETED",
  ONBOARDING_STARTED: "ONBOARDING_STARTED",
  ONBOARDING_COMPLETED: "ONBOARDING_COMPLETED",
  PLANT_CREATED: "PLANT_CREATED",
  CROSS_CREATED: "CROSS_CREATED",
  SEED_BATCH_CREATED: "SEED_BATCH_CREATED",
  SEEDLING_CREATED: "SEEDLING_CREATED",
  EVALUATION_COMPLETED: "EVALUATION_COMPLETED",
  GOAL_CREATED: "GOAL_CREATED",
  CSV_IMPORT_COMPLETED: "CSV_IMPORT_COMPLETED",
  QR_LABEL_CREATED: "QR_LABEL_CREATED",
  FEEDBACK_SUBMITTED: "FEEDBACK_SUBMITTED",
} as const

type EventType = (typeof EVENTS)[keyof typeof EVENTS]

export async function trackEvent(event: EventType, metadata?: Record<string, any>, route?: string) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        event,
        metadata: metadata ?? {},
        route: route ?? null,
      },
    })
  } catch {
    // Non-critical — never throw
  }
}

export { EVENTS }
