import { createFileRoute } from "@tanstack/react-router"
import { db } from "@/lib/db"
import { expenseCategory } from "@/lib/expenses-schema"
import { createCategorySchema, getAuthenticatedUserId, jsonError, listCategoriesForUser } from "../-_shared"

export const Route = createFileRoute("/api/expenses/categories/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const items = await listCategoriesForUser(userId)
        return Response.json({ items })
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

        const [created] = await db
          .insert(expenseCategory)
          .values({
            userId,
            name: parsed.data.name,
            description: parsed.data.description,
            color: parsed.data.color,
          })
          .returning()

        return Response.json({ item: created }, { status: 201 })
      },
    },
  },
})
