import { createFileRoute } from "@tanstack/react-router"
import { db } from "@/lib/db"
import { and, eq } from "drizzle-orm"
import * as schema from "@/lib/schema"
import { getAuthenticatedUserId, jsonError, createLineItemSchema } from "./-_shared"

export const Route = createFileRoute("/api/quotes/line-items/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        // Get quoteId from query params
        const url = new URL(request.url)
        const quoteId = url.searchParams.get("quoteId")

        if (!quoteId) {
          return jsonError("Missing quoteId parameter", 400)
        }

        // Verify user owns the quote
        const quote = await db.query.quote.findFirst({
          where: and(eq(schema.quote.id, quoteId), eq(schema.quote.userId, userId)),
        })

        if (!quote) {
          return jsonError("Quote not found", 404)
        }

        try {
          const lineItems = await db.query.quoteLineItem.findMany({
            where: eq(schema.quoteLineItem.quoteId, quoteId),
            orderBy: (item) => item.sortOrder,
          })
          return Response.json(lineItems)
        } catch (error) {
          console.error("GET /api/quotes/line-items error:", error)
          return jsonError("Failed to fetch line items", 500)
        }
      },

      POST: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const body = await request.json()
        const quoteId = body.quoteId

        if (!quoteId) {
          return jsonError("Missing quoteId", 400)
        }

        // Verify user owns the quote
        const quote = await db.query.quote.findFirst({
          where: and(eq(schema.quote.id, quoteId), eq(schema.quote.userId, userId)),
        })

        if (!quote) {
          return jsonError("Quote not found", 404)
        }

        const parsed = createLineItemSchema.safeParse(body)
        if (!parsed.success) {
          return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload")
        }

        try {
          const result = await db
            .insert(schema.quoteLineItem)
            .values({
              quoteId,
              userId,
              type: parsed.data.type,
              description: parsed.data.description,
              quantity: String(parsed.data.quantity),
              unit: parsed.data.unit || null,
              unitPrice: String(parsed.data.unitPrice),
              hourlyRate: parsed.data.hourlyRate ? String(parsed.data.hourlyRate) : null,
              subtotal: String(parsed.data.quantity * parsed.data.unitPrice),
              sortOrder: parsed.data.sortOrder,
            })
            .returning()

          return Response.json(result[0])
        } catch (error) {
          console.error("POST /api/quotes/line-items error:", error)
          return jsonError("Failed to create line item", 500)
        }
      },
    },
  },
})
