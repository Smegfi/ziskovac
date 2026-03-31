import { createFileRoute } from "@tanstack/react-router"
import { db } from "@/lib/db"
import { expense } from "@/lib/expenses-schema"
import { createExpenseSchema, getAuthenticatedUserId, jsonError, listExpensesForUser, validateCategoryOwnership } from "./-_shared"

export const Route = createFileRoute("/api/expenses/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const url = new URL(request.url)
        const categoryId = url.searchParams.get("categoryId")
        const fromDateRaw = url.searchParams.get("from")
        const toDateRaw = url.searchParams.get("to")

        const from = fromDateRaw ? new Date(fromDateRaw) : undefined
        const to = toDateRaw ? new Date(toDateRaw) : undefined

        if (fromDateRaw && Number.isNaN(from?.getTime())) {
          return jsonError("Invalid 'from' date format")
        }
        if (toDateRaw && Number.isNaN(to?.getTime())) {
          return jsonError("Invalid 'to' date format")
        }

        const items = await listExpensesForUser({
          userId,
          categoryId,
          from,
          to,
        })

        return Response.json({ items })
      },
      POST: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        const body = await request.json()
        const parsed = createExpenseSchema.safeParse(body)

        if (!parsed.success) {
          return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload")
        }

        if (parsed.data.categoryId) {
          const category = await validateCategoryOwnership(parsed.data.categoryId, userId)
          if (!category) {
            return jsonError("Category not found", 404)
          }
        }

        const [created] = await db
          .insert(expense)
          .values({
            userId,
            title: parsed.data.title,
            amount: parsed.data.amount,
            currency: parsed.data.currency,
            date: parsed.data.date,
            note: parsed.data.note,
            categoryId: parsed.data.categoryId,
          })
          .returning()

        return Response.json({ item: created }, { status: 201 })
      },
    },
  },
})
