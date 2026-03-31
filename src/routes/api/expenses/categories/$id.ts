import { createFileRoute } from "@tanstack/react-router"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { expenseCategory } from "@/lib/expenses-schema"
import { getAuthenticatedUserId, jsonError, updateCategorySchema } from "../-_shared"

export const Route = createFileRoute("/api/expenses/categories/$id")({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const body = await request.json()
        const parsed = updateCategorySchema.safeParse(body)

        if (!parsed.success) {
          return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload")
        }

        const [updated] = await db
          .update(expenseCategory)
          .set(parsed.data)
          .where(and(eq(expenseCategory.id, params.id), eq(expenseCategory.userId, userId)))
          .returning()

        if (!updated) {
          return jsonError("Category not found", 404)
        }

        return Response.json({ item: updated })
      },
      DELETE: async ({ params, request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const [deleted] = await db
          .delete(expenseCategory)
          .where(and(eq(expenseCategory.id, params.id), eq(expenseCategory.userId, userId)))
          .returning({ id: expenseCategory.id })

        if (!deleted) {
          return jsonError("Category not found", 404)
        }

        return Response.json({ ok: true })
      },
    },
  },
})
