import { db } from "./db"
import { expense } from "./expenses-schema"
import { quoteSettings } from "./quote-schema"
import { and, eq, gte, lt } from "drizzle-orm"

/**
 * Calculate the floor hourly rate based on monthly expenses and billable hours target
 * Formula: total monthly costs / billable hours target = floor hourly rate
 */
export async function calculateFloorHourlyRate(
  userId: string,
  month: string, // YYYY-MM format
): Promise<{
  floorHourlyRate: number
  totalCosts: number
  billableHours: number
} | null> {
  // Get user's billable hours target
  const settings = await db.query.quoteSettings.findFirst({
    where: eq(quoteSettings.userId, userId),
  })

  if (!settings) {
    return null
  }

  // Get expenses for the specified month
  const monthStart = new Date(`${month}-01T00:00:00Z`)
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)

  const expenses = await db.query.expense.findMany({
    where: and(eq(expense.userId, userId), gte(expense.date, monthStart), lt(expense.date, monthEnd)),
  })

  // Calculate total costs (amounts are stored in cents, convert to currency units)
  const totalCents = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalCosts = totalCents / 100

  // Calculate floor hourly rate
  const floorHourlyRate =
    settings.billableHoursTarget > 0 ? totalCosts / settings.billableHoursTarget : 0

  return {
    floorHourlyRate: Math.ceil(floorHourlyRate * 100) / 100, // Round up to 2 decimal places
    totalCosts,
    billableHours: settings.billableHoursTarget,
  }
}

/**
 * Get or create quote settings for a user
 */
export async function getOrCreateQuoteSettings(userId: string) {
  let settings = await db.query.quoteSettings.findFirst({
    where: eq(quoteSettings.userId, userId),
  })

  if (!settings) {
    // Create default settings
    const [newSettings] = await db
      .insert(quoteSettings)
      .values({
        userId,
        billableHoursTarget: 160, // Default 160 hours/month
        currency: "CZK",
      })
      .returning()

    settings = newSettings
  }

  return settings
}

/**
 * Update billable hours target
 */
export async function updateBillableHoursTarget(userId: string, billableHours: number) {
  const [updated] = await db
    .update(quoteSettings)
    .set({ billableHoursTarget: billableHours })
    .where(eq(quoteSettings.userId, userId))
    .returning()

  return updated
}
