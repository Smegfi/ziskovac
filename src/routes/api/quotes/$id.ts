import { createFileRoute } from "@tanstack/react-router"
import { db } from "@/lib/db"
import { and, eq } from "drizzle-orm"
import * as schema from "@/lib/schema"
import { getAuthenticatedUserId, jsonError } from "./-_shared"

export const Route = createFileRoute("/api/quotes/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const quoteRecord = await db.query.quote.findFirst({
          where: and(eq(schema.quote.id, params.id), eq(schema.quote.userId, userId)),
        })

        if (!quoteRecord) {
          return jsonError("Not found", 404)
        }

        return Response.json(quoteRecord)
      },

      PATCH: async ({ params, request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        // Verify ownership
        const quoteRecord = await db.query.quote.findFirst({
          where: and(eq(schema.quote.id, params.id), eq(schema.quote.userId, userId)),
        })

        if (!quoteRecord) {
          return jsonError("Not found", 404)
        }

        const body = await request.json()

        // Build update object with type-safe fields
        const updates: any = {}
        const allowedFields = [
          "title",
          "clientName",
          "description",
          "month",
          "billableHours",
          "monthlyOverheadCosts",
          "projectDurationMonths",
          "targetMarginPercent",
          "targetProfitAmount",
          "floorHourlyRate",
          "customRate",
          "overheadAllocation",
          "totalCost",
          "netProfit",
          "recommendedPrice",
          "currency",
          "status",
        ]

        for (const field of allowedFields) {
          if (field in body && body[field] !== undefined) {
            updates[field] = body[field]
          }
        }

        try {
          const result = await db
            .update(schema.quote)
            .set(updates)
            .where(eq(schema.quote.id, params.id))
            .returning()

          if (!result.length) {
            return jsonError("Failed to update quote", 500)
          }

          return Response.json(result[0])
        } catch (error) {
          console.error(`PATCH /api/quotes/${params.id} error:`, error)
          return jsonError("Failed to update quote", 500)
        }
      },

      DELETE: async ({ params, request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        // Verify ownership
        const quoteRecord = await db.query.quote.findFirst({
          where: and(eq(schema.quote.id, params.id), eq(schema.quote.userId, userId)),
        })

        if (!quoteRecord) {
          return jsonError("Not found", 404)
        }

        try {
          await db.delete(schema.quote).where(eq(schema.quote.id, params.id))
          return Response.json({ success: true })
        } catch (error) {
          console.error(`DELETE /api/quotes/${params.id} error:`, error)
          return jsonError("Failed to delete quote", 500)
        }
      },
    },
  },
})
