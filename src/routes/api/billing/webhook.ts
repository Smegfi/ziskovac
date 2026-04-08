import { createFileRoute } from "@tanstack/react-router"
import { db } from "@/lib/db"
import * as schema from "@/lib/schema"
import { verifyWebhookSignature, handleStripeWebhookEvent } from "@/lib/stripe"

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export const Route = createFileRoute("/api/billing/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.text()
          const signature = request.headers.get("stripe-signature")

          if (!signature) {
            return jsonError("Missing signature header", 400)
          }

          const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
          if (!webhookSecret) {
            console.error("STRIPE_WEBHOOK_SECRET not configured")
            return jsonError("Webhook secret not configured", 500)
          }

          // Verify webhook signature
          const isValid = await verifyWebhookSignature(body, signature, webhookSecret)
          if (!isValid) {
            console.warn("Invalid webhook signature")
            return jsonError("Invalid signature", 401)
          }

          // Parse event
          const event = JSON.parse(body)

          // Log event for audit trail
          if (event.data?.object?.metadata?.userId) {
            await db
              .insert(schema.billingEvent)
              .values({
                userId: event.data.object.metadata.userId,
                eventType: event.type,
                stripeEventId: event.id,
                stripeResource: JSON.stringify(event.data.object),
                processed: false,
              })
              .catch((err) => {
                console.error("Failed to log billing event:", err)
              })
          }

          // Handle the event
          await handleStripeWebhookEvent(event)

          return Response.json({ received: true })
        } catch (error) {
          console.error("Webhook processing error:", error)
          return jsonError("Webhook processing failed", 500)
        }
      },
    },
  },
})
