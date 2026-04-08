import { createFileRoute } from "@tanstack/react-router"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import * as schema from "@/lib/schema"
import { getStripeClient, STRIPE_PLANS, type SubscriptionPlan } from "@/lib/stripe"
import { z } from "zod"

const createCheckoutSessionSchema = z.object({
  plan: z.enum(["monthly", "annual"] as const),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

async function getAuthenticatedUserId(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  return session?.user.id ?? null
}

export const Route = createFileRoute("/api/billing/checkout-session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const body = await request.json()
        const parsed = createCheckoutSessionSchema.safeParse(body)

        if (!parsed.success) {
          return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload")
        }

        try {
          const stripe = await getStripeClient()
          const plan = parsed.data.plan as SubscriptionPlan
          const planConfig = STRIPE_PLANS[plan]

          if (!planConfig.stripePriceId) {
            return jsonError("Price ID not configured for this plan", 500)
          }

          // Get or create Stripe customer
          let subscription = await db.query.subscription.findFirst({
            where: eq(schema.subscription.userId, userId),
          })

          let customerId = subscription?.stripeCustomerId

          if (!customerId) {
            // Create customer in Stripe
            const user = await auth.api.getUser({ userId })
            const customer = await stripe.customers.create({
              email: user?.email,
              metadata: {
                userId,
              },
            })
            customerId = customer.id

            // Save customer ID
            if (subscription) {
              await db
                .update(schema.subscription)
                .set({ stripeCustomerId: customerId })
                .where(eq(schema.subscription.id, subscription.id))
            }
          }

          // Create checkout session
          const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
              {
                price: planConfig.stripePriceId,
                quantity: 1,
              },
            ],
            success_url: parsed.data.successUrl,
            cancel_url: parsed.data.cancelUrl,
            metadata: {
              userId,
              plan,
            },
          })

          return Response.json({ sessionId: session.id, url: session.url })
        } catch (error) {
          console.error("Checkout session creation error:", error)
          return jsonError("Failed to create checkout session", 500)
        }
      },
    },
  },
})
