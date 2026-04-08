import { createFileRoute } from "@tanstack/react-router"
import { db } from "@/lib/db"
import {
  getAuthenticatedUserId,
  jsonError,
  listCostsForUser,
  createCostSchema,
  validateCategoryOwnership,
} from "../-_shared"
import * as schema from "@/lib/schema"

export const Route = createFileRoute("/api/overhead/costs/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        try {
          const costs = await listCostsForUser(userId)
          return Response.json(costs)
        } catch (error) {
          console.error("GET /api/overhead/costs error:", error)
          return jsonError("Failed to fetch costs", 500)
        }
      },

      POST: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const body = await request.json()
        const parsed = createCostSchema.safeParse(body)

        if (!parsed.success) {
          return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload")
        }

        // Verify category ownership
        const category = await validateCategoryOwnership(parsed.data.categoryId, userId)
        if (!category) {
          return jsonError("Category not found", 404)
        }

        try {
          const result = await db
            .insert(schema.overheadCost)
            .values({
              userId,
              categoryId: parsed.data.categoryId,
              month: parsed.data.month,
              amount: parsed.data.amount.toString(),
              isFixed: parsed.data.isFixed,
              description: parsed.data.description,
            })
            .returning()

          return Response.json(result[0])
        } catch (error) {
          console.error("POST /api/overhead/costs error:", error)
          return jsonError("Failed to create cost", 500)
        }
      },
    },
  },
})
