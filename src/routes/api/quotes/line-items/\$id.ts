import { createFileRoute } from "@tanstack/react-router"
import { db } from "@/lib/db"
import { and, eq } from "drizzle-orm"
import * as schema from "@/lib/schema"
import { getAuthenticatedUserId, jsonError, updateLineItemSchema } from "./-_shared"

export const Route = createFileRoute("/api/quotes/line-items/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        try {
          const lineItem = await db.query.quoteLineItem.findFirst({
            where: and(
              eq(schema.quoteLineItem.id, params.id),
              eq(schema.quoteLineItem.userId, userId),
            ),
          })

          if (!lineItem) {
            return jsonError("Line item not found", 404)
          }

          return Response.json(lineItem)
        } catch (error) {
          console.error("GET /api/quotes/line-items/$id error:", error)
          return jsonError("Failed to fetch line item", 500)
        }
      },

      PATCH: async ({ params, request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        // Verify ownership
        const lineItem = await db.query.quoteLineItem.findFirst({
          where: and(
            eq(schema.quoteLineItem.id, params.id),
            eq(schema.quoteLineItem.userId, userId),
          ),
        })

        if (!lineItem) {
          return jsonError("Line item not found", 404)
        }

        const body = await request.json()
        const parsed = updateLineItemSchema.safeParse(body)

        if (!parsed.success) {
          return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload")
        }

        try {
          const updates: any = {}

          if (parsed.data.type !== undefined) updates.type = parsed.data.type
          if (parsed.data.description !== undefined) updates.description = parsed.data.description
          if (parsed.data.quantity !== undefined) {
            updates.quantity = String(parsed.data.quantity)
          }
          if (parsed.data.unit !== undefined) updates.unit = parsed.data.unit || null
          if (parsed.data.unitPrice !== undefined) {
            updates.unitPrice = String(parsed.data.unitPrice)
          }
          if (parsed.data.hourlyRate !== undefined) {
            updates.hourlyRate = parsed.data.hourlyRate ? String(parsed.data.hourlyRate) : null
          }
          if (parsed.data.sortOrder !== undefined) updates.sortOrder = parsed.data.sortOrder

          // Recalculate subtotal if quantity or unitPrice changed
          if (parsed.data.quantity !== undefined || parsed.data.unitPrice !== undefined) {
            const quantity = parsed.data.quantity ?? Number(lineItem.quantity)
            const unitPrice = parsed.data.unitPrice ?? Number(lineItem.unitPrice)
            updates.subtotal = String(quantity * unitPrice)
          }

          const result = await db
            .update(schema.quoteLineItem)
            .set(updates)
            .where(eq(schema.quoteLineItem.id, params.id))
            .returning()

          if (!result.length) {
            return jsonError("Failed to update line item", 500)
          }

          return Response.json(result[0])
        } catch (error) {
          console.error("PATCH /api/quotes/line-items/$id error:", error)
          return jsonError("Failed to update line item", 500)
        }
      },

      DELETE: async ({ params, request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        // Verify ownership
        const lineItem = await db.query.quoteLineItem.findFirst({
          where: and(
            eq(schema.quoteLineItem.id, params.id),
            eq(schema.quoteLineItem.userId, userId),
          ),
        })

        if (!lineItem) {
          return jsonError("Line item not found", 404)
        }

        try {
          const result = await db
            .delete(schema.quoteLineItem)
            .where(eq(schema.quoteLineItem.id, params.id))
            .returning()

          return Response.json({ deleted: result.length > 0 })
        } catch (error) {
          console.error("DELETE /api/quotes/line-items/$id error:", error)
          return jsonError("Failed to delete line item", 500)
        }
      },
    },
  },
})
