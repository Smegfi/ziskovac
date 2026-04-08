import { createFileRoute } from "@tanstack/react-router"
import { getAuthenticatedUserId, jsonError, getQuoteSettings, updateQuoteSettingsSchema } from "./-_shared"

export const Route = createFileRoute("/api/quotes/settings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const settings = await getQuoteSettings(userId)

        return Response.json({
          id: settings.id,
          billableHoursTarget: settings.billableHoursTarget,
          currency: settings.currency,
        })
      },

      PATCH: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const body = await request.json()
        const parsed = updateQuoteSettingsSchema.safeParse(body)

        if (!parsed.success) {
          return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload")
        }

        const { billableHoursTarget } = parsed.data

        // This will be implemented in hourly-rate-calculator.ts
        const updated = await import("@/lib/hourly-rate-calculator").then((m) =>
          m.updateBillableHoursTarget(userId, billableHoursTarget),
        )

        return Response.json({
          id: updated.id,
          billableHoursTarget: updated.billableHoursTarget,
          currency: updated.currency,
        })
      },
    },
  },
})
