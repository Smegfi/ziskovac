import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { quote } from "@/lib/quote-schema"
import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { calculateFloorHourlyRate, getOrCreateQuoteSettings } from "@/lib/hourly-rate-calculator"

export const updateQuoteSettingsSchema = z.object({
  billableHoursTarget: z.number().int().positive().min(1).max(8760),
})

export const createQuoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  clientName: z.string().trim().max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  month: z.string().trim().optional(),
  billableHours: z.number().positive().optional(),
  monthlyOverheadCosts: z.number().nonnegative().default(0),
  projectDurationMonths: z.number().positive().default(1),
  targetMarginPercent: z.number().nonnegative().default(30),
  targetProfitAmount: z.number().nonnegative().optional(),
  customRate: z.number().positive().optional(),
  currency: z.string().trim().min(3).max(3).default("CZK"),
  status: z.enum(["draft", "sent", "accepted", "rejected"]).default("draft"),
})

export const updateQuoteSchema = createQuoteSchema.partial()

export async function getAuthenticatedUserId(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  return session?.user.id ?? null
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export async function getQuoteSettings(userId: string) {
  return getOrCreateQuoteSettings(userId)
}

export async function calculateQuoteForMonth(userId: string, month: string) {
  const result = await calculateFloorHourlyRate(userId, month)
  if (!result) {
    return null
  }

  // Check if quote already exists for this month
  let existingQuote = await db.query.quote.findFirst({
    where: and(eq(quote.userId, userId), eq(quote.month, month)),
  })

  if (!existingQuote) {
    // Create new quote
    const [newQuote] = await db
      .insert(quote)
      .values({
        userId,
        month,
        title: `Quote for ${month}`,
        floorHourlyRate: result.floorHourlyRate.toString(),
        currency: "CZK",
      })
      .returning()

    existingQuote = newQuote
  }

  return {
    quote: existingQuote,
    calculation: result,
  }
}

export async function listQuotesForUser(userId: string, limit = 50) {
  return db.query.quote.findMany({
    where: eq(quote.userId, userId),
    limit,
  })
}
