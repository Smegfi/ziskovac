import { createFileRoute } from "@tanstack/react-router"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { expense } from "@/lib/expenses-schema"
import {
  getAuthenticatedUserId,
  jsonError,
  updateExpenseSchema,
  validateCategoryOwnership,
} from "./-_shared"

export const Route = createFileRoute("/api/expenses/$id")({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const body = await request.json()
        const parsed = updateExpenseSchema.safeParse(body)

        if (!parsed.success) {
          return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload")
        }

        if (parsed.data.categoryId) {
          const category = await validateCategoryOwnership(parsed.data.categoryId, userId)
          if (!category) {
            return jsonError("Category not found", 404)
          }
        }

        const [updated] = await db
          .update(expense)
          .set(parsed.data)
          .where(and(eq(expense.id, params.id), eq(expense.userId, userId)))
          .returning()

        if (!updated) {
          return jsonError("Expense not found", 404)
        }

        return Response.json({ item: updated })
      },
      DELETE: async ({ params, request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const [deleted] = await db
          .delete(expense)
          .where(and(eq(expense.id, params.id), eq(expense.userId, userId)))
          .returning({ id: expense.id })

        if (!deleted) {
          return jsonError("Expense not found", 404)
        }

        return Response.json({ ok: true })
      },
    },
  },
})
