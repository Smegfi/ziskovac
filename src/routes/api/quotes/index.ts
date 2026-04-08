import { createFileRoute } from "@tanstack/react-router"
import { db } from "@/lib/db"
import { getAuthenticatedUserId, jsonError, listQuotesForUser, createQuoteSchema } from "./-_shared"
import * as schema from "@/lib/schema"

export const Route = createFileRoute("/api/quotes/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        try {
          const quotes = await listQuotesForUser(userId)
          return Response.json(quotes)
        } catch (error) {
          console.error("GET /api/quotes error:", error)
          return jsonError("Failed to fetch quotes", 500)
        }
      },

      POST: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const body = await request.json()
        const parsed = createQuoteSchema.safeParse(body)

        if (!parsed.success) {
          return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload")
        }

        try {
          const result = await db
            .insert(schema.quote)
            .values({
              userId,
              title: parsed.data.title,
              clientName: parsed.data.clientName,
              description: parsed.data.description,
              month: parsed.data.month,
              billableHours: parsed.data.billableHours ? String(parsed.data.billableHours) : null,
              monthlyOverheadCosts: parsed.data.monthlyOverheadCosts
                ? String(parsed.data.monthlyOverheadCosts)
                : "0",
              projectDurationMonths: parsed.data.projectDurationMonths
                ? String(parsed.data.projectDurationMonths)
                : "1",
              targetMarginPercent: parsed.data.targetMarginPercent
                ? String(parsed.data.targetMarginPercent)
                : "30",
              targetProfitAmount: parsed.data.targetProfitAmount
                ? String(parsed.data.targetProfitAmount)
                : null,
              customRate: parsed.data.customRate ? String(parsed.data.customRate) : null,
              currency: parsed.data.currency,
              status: parsed.data.status,
            })
            .returning()

          return Response.json(result[0])
        } catch (error) {
          console.error("POST /api/quotes error:", error)
          return jsonError("Failed to create quote", 500)
        }
      },
    },
  },
})
