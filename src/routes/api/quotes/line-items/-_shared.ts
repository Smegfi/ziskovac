import { auth } from "@/lib/auth"
import { z } from "zod"

export const createLineItemSchema = z.object({
  type: z.enum(["service", "material", "hourly"]),
  description: z.string().trim().min(1).max(500),
  quantity: z.number().positive().default(1),
  unit: z.string().trim().max(50).optional(),
  unitPrice: z.number().nonnegative(),
  hourlyRate: z.number().positive().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
})

export const updateLineItemSchema = createLineItemSchema.partial()

export async function getAuthenticatedUserId(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  return session?.user.id ?? null
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}
