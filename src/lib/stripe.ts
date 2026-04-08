/**
 * Stripe Integration Utility
 * Handles Stripe API interactions and webhook processing
 */

interface StripeConfig {
  secretKey: string
  publishableKey: string
  webhookSecret: string
}

let stripeConfig: StripeConfig | null = null

/**
 * Initialize Stripe configuration from environment variables
 */
export function initializeStripe(): StripeConfig {
  if (stripeConfig) {
    return stripeConfig
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secretKey || !publishableKey || !webhookSecret) {
    throw new Error(
      "Missing Stripe configuration. Please set STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, and STRIPE_WEBHOOK_SECRET environment variables.",
    )
  }

  stripeConfig = {
    secretKey,
    publishableKey,
    webhookSecret,
  }

  return stripeConfig
}

/**
 * Get Stripe API client instance
 * Uses dynamic import to avoid bundling Stripe SDK unless needed
 */
export async function getStripeClient() {
  const config = initializeStripe()
  const { Stripe } = await import("stripe")
  return new Stripe(config.secretKey, { apiVersion: "2024-04-10" })
}

/**
 * Stripe pricing plans configuration
 */
export const STRIPE_PLANS = {
  free: {
    name: "Free",
    description: "Perfect for getting started",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Basic quote calculator",
      "Up to 5 quotes per month",
      "Standard support",
    ],
  },
  monthly: {
    name: "Professional",
    description: "For active freelancers",
    monthlyPrice: 29,
    annualPrice: 290, // 10 months for annual
    stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID,
    features: [
      "Unlimited quotes",
      "Advanced calculations",
      "Quote history",
      "Priority support",
      "PDF exports",
    ],
  },
  annual: {
    name: "Professional Annual",
    description: "Save 2 months with annual billing",
    monthlyPrice: 0,
    annualPrice: 290,
    stripePriceId: process.env.STRIPE_ANNUAL_PRICE_ID,
    features: [
      "Everything in Monthly",
      "Save 2 months of billing",
      "Priority support",
    ],
  },
} as const

export type SubscriptionPlan = keyof typeof STRIPE_PLANS

/**
 * Verify Stripe webhook signature
 */
export async function verifyWebhookSignature(
  body: string,
  signature: string,
  webhookSecret: string,
): Promise<boolean> {
  try {
    const { Stripe } = await import("stripe")
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-04-10",
    })

    // Verify signature using Stripe's built-in method
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    return !!event
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return false
  }
}

/**
 * Handle Stripe webhook events
 * Updates subscription status and handles lifecycle events
 */
export async function handleStripeWebhookEvent(event: any): Promise<void> {
  const eventType = event.type

  // Import db here to avoid circular dependencies
  const { db } = await import("./db")
  const { eq } = await import("drizzle-orm")
  const schema = await import("./schema")

  switch (eventType) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object
      const customerId = subscription.customer
      const userId = subscription.metadata?.userId

      if (!userId) {
        console.warn("Missing userId in subscription metadata")
        break
      }

      try {
        await db
          .update(schema.subscription)
          .set({
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: customerId,
            stripePriceId: subscription.items?.data?.[0]?.price?.id,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            nextBillingDate: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date(),
          })
          .where(eq(schema.subscription.userId, userId))

        console.log(`Subscription ${eventType} processed for user ${userId}`)
      } catch (error) {
        console.error(`Error processing subscription ${eventType}:`, error)
      }
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object
      const userId = subscription.metadata?.userId

      if (!userId) {
        console.warn("Missing userId in subscription metadata")
        break
      }

      try {
        await db
          .update(schema.subscription)
          .set({
            status: "canceled",
            canceledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(schema.subscription.userId, userId))

        console.log(`Subscription cancelled for user ${userId}`)
      } catch (error) {
        console.error("Error processing subscription cancellation:", error)
      }
      break
    }

    case "invoice.paid": {
      const invoice = event.data.object
      const customerId = invoice.customer
      const userId = invoice.metadata?.userId

      if (!customerId || !userId) {
        console.warn("Missing customer or user ID in invoice")
        break
      }

      try {
        await db
          .update(schema.subscription)
          .set({
            lastPaymentDate: new Date(invoice.created * 1000),
            updatedAt: new Date(),
          })
          .where(eq(schema.subscription.stripeCustomerId, customerId))

        console.log(`Invoice paid for user ${userId}`)
      } catch (error) {
        console.error("Error processing invoice.paid:", error)
      }
      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object
      const customerId = invoice.customer

      if (!customerId) {
        console.warn("Missing customer ID in invoice")
        break
      }

      try {
        await db
          .update(schema.subscription)
          .set({
            status: "past_due",
            updatedAt: new Date(),
          })
          .where(eq(schema.subscription.stripeCustomerId, customerId))

        console.log("Payment failed - subscription marked as past_due")
      } catch (error) {
        console.error("Error processing invoice.payment_failed:", error)
      }
      break
    }

    default:
      console.log("Unhandled webhook event:", eventType)
  }
}
