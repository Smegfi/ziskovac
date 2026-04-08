import { createFileRoute } from "@tanstack/react-router"
import { getAuthenticatedUserId, jsonError, calculateQuoteForMonth } from "./-_shared"
import { z } from "zod"

const calculateRequestSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM format
})

export const Route = createFileRoute("/api/quotes/calculate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const body = await request.json()
        const parsed = calculateRequestSchema.safeParse(body)

        if (!parsed.success) {
          return jsonError("Invalid month format. Use YYYY-MM")
        }

        const { month } = parsed.data

        try {
          const result = await calculateQuoteForMonth(userId, month)

          if (!result) {
            return jsonError("Could not calculate hourly rate. No settings found.")
          }

          return Response.json({
            month,
            floorHourlyRate: result.quote.floorHourlyRate
              ? parseFloat(result.quote.floorHourlyRate)
              : result.calculation.floorHourlyRate,
            totalCosts: result.calculation.totalCosts,
            billableHours: result.calculation.billableHours,
            currency: result.quote.currency,
            calculatedAt: new Date().toISOString(),
          })
        } catch (error) {
          console.error("Error calculating hourly rate:", error)
          return jsonError("Failed to calculate hourly rate", 500)
        }
      },
    },
  },
})
