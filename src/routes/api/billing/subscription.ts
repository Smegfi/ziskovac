import { createFileRoute } from "@tanstack/react-router"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import * as schema from "@/lib/schema"
import { STRIPE_PLANS, SubscriptionPlan } from "@/lib/stripe"
import { z } from "zod"

const updateSubscriptionSchema = z.object({
  plan: z.enum(["free", "monthly", "annual"] as const),
})

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

async function getAuthenticatedUserId(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  return session?.user.id ?? null
}

export const Route = createFileRoute("/api/billing/subscription")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        try {
          // Get or create subscription record
          let subscription = await db.query.subscription.findFirst({
            where: eq(schema.subscription.userId, userId),
          })

          if (!subscription) {
            // Create free subscription for new users
            const [newSubscription] = await db
              .insert(schema.subscription)
              .values({
                userId,
                plan: "free",
                status: "active",
              })
              .returning()

            subscription = newSubscription
          }

          return Response.json({
            subscription,
            plans: STRIPE_PLANS,
          })
        } catch (error) {
          console.error("GET /api/billing/subscription error:", error)
          return jsonError("Failed to fetch subscription", 500)
        }
      },

      POST: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const body = await request.json()
        const parsed = updateSubscriptionSchema.safeParse(body)

        if (!parsed.success) {
          return jsonError(parsed.error.issues[0]?.message ?? "Invalid plan")
        }

        try {
          const plan = parsed.data.plan as SubscriptionPlan

          // Get existing subscription
          let subscription = await db.query.subscription.findFirst({
            where: eq(schema.subscription.userId, userId),
          })

          if (!subscription) {
            // Create new subscription
            const [newSubscription] = await db
              .insert(schema.subscription)
              .values({
                userId,
                plan,
                status: plan === "free" ? "active" : "incomplete",
              })
              .returning()

            subscription = newSubscription
          } else {
            // Update existing subscription
            // If upgrading from free, status should be incomplete until payment
            // If downgrading to free, status should be active
            const newStatus = plan === "free" ? "active" : subscription.status

            const [updated] = await db
              .update(schema.subscription)
              .set({
                plan,
                status: newStatus,
                updatedAt: new Date(),
              })
              .where(eq(schema.subscription.id, subscription.id))
              .returning()

            subscription = updated
          }

          return Response.json(subscription)
        } catch (error) {
          console.error("POST /api/billing/subscription error:", error)
          return jsonError("Failed to update subscription", 500)
        }
      },
    },
  },
})
