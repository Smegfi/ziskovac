import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { z } from "zod"

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

export const createCostSchema = z.object({
  categoryId: z.string().trim().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.number().nonnegative(),
  isFixed: z.boolean().default(true),
  description: z.string().trim().max(500).optional(),
})

export async function getAuthenticatedUserId(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  return session?.user.id ?? null
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export async function validateCategoryOwnership(categoryId: string, userId: string) {
  return db.query.overheadCategory.findFirst({
    where: (cat, { eq, and }) => and(eq(cat.id, categoryId), eq(cat.userId, userId)),
  })
}

export async function listCategoriesForUser(userId: string) {
  return db.query.overheadCategory.findMany({
    where: (cat) => eq(cat.userId, userId),
  })
}

export async function listCostsForUser(userId: string) {
  return db.query.overheadCost.findMany({
    where: (cost) => eq(cost.userId, userId),
  })
}
