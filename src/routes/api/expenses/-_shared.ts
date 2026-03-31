import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { expense, expenseCategory } from "@/lib/expenses-schema"
import { and, desc, eq, gte, lte, sql } from "drizzle-orm"
import { z } from "zod"

const optionalColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/)
  .optional()

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1).max(120),
  amount: z.number().int().positive(),
  currency: z.string().trim().min(3).max(3).default("CZK"),
  date: z.coerce.date(),
  note: z.string().trim().max(1000).optional(),
  categoryId: z.string().trim().optional().nullable(),
})

export const updateExpenseSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    amount: z.number().int().positive().optional(),
    currency: z.string().trim().min(3).max(3).optional(),
    date: z.coerce.date().optional(),
    note: z.string().trim().max(1000).optional().nullable(),
    categoryId: z.string().trim().optional().nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  })

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  color: optionalColorSchema,
})

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    description: z.string().trim().max(500).optional().nullable(),
    color: optionalColorSchema.nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  })

export async function getAuthenticatedUserId(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  return session?.user.id ?? null
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export async function validateCategoryOwnership(categoryId: string, userId: string) {
  const category = await db.query.expenseCategory.findFirst({
    where: and(eq(expenseCategory.id, categoryId), eq(expenseCategory.userId, userId)),
  })

  return category
}

export async function listExpensesForUser({
  userId,
  categoryId,
  from,
  to,
}: {
  userId: string
  categoryId?: string | null
  from?: Date
  to?: Date
}) {
  const conditions = [eq(expense.userId, userId)]

  if (categoryId) {
    conditions.push(eq(expense.categoryId, categoryId))
  }
  if (from) {
    conditions.push(gte(expense.date, from))
  }
  if (to) {
    conditions.push(lte(expense.date, to))
  }

  return db
    .select({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      currency: expense.currency,
      date: expense.date,
      note: expense.note,
      categoryId: expense.categoryId,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      categoryName: expenseCategory.name,
      categoryColor: expenseCategory.color,
    })
    .from(expense)
    .leftJoin(expenseCategory, eq(expense.categoryId, expenseCategory.id))
    .where(and(...conditions))
    .orderBy(desc(expense.date), desc(expense.createdAt))
}

export async function listCategoriesForUser(userId: string) {
  return db
    .select({
      id: expenseCategory.id,
      name: expenseCategory.name,
      description: expenseCategory.description,
      color: expenseCategory.color,
      createdAt: expenseCategory.createdAt,
      updatedAt: expenseCategory.updatedAt,
      expenseCount: sql<number>`cast(count(${expense.id}) as int)`,
    })
    .from(expenseCategory)
    .leftJoin(expense, eq(expenseCategory.id, expense.categoryId))
    .where(eq(expenseCategory.userId, userId))
    .groupBy(expenseCategory.id)
    .orderBy(expenseCategory.name)
}
