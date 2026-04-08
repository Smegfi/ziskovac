import { createFileRoute } from "@tanstack/react-router"
import { db } from "@/lib/db"
import { getAuthenticatedUserId, jsonError, listCategoriesForUser, createCategorySchema } from "../-_shared"
import * as schema from "@/lib/schema"

export const Route = createFileRoute("/api/overhead/categories/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        try {
          const categories = await listCategoriesForUser(userId)
          return Response.json(categories)
        } catch (error) {
          console.error("GET /api/overhead/categories error:", error)
          return jsonError("Failed to fetch categories", 500)
        }
      },

      POST: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const body = await request.json()
        const parsed = createCategorySchema.safeParse(body)

        if (!parsed.success) {
          return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload")
        }

        try {
          const result = await db
            .insert(schema.overheadCategory)
            .values({
              userId,
              name: parsed.data.name,
              color: parsed.data.color,
            })
            .returning()

          return Response.json(result[0])
        } catch (error) {
          console.error("POST /api/overhead/categories error:", error)
          return jsonError("Failed to create category", 500)
        }
      },
    },
  },
})
