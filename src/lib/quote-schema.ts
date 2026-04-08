import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, integer, index, numeric } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

/**
 * Quote settings table - stores user's billing configuration
 * billableHoursTarget: target monthly billable hours (e.g., 160 for full-time)
 * currency: billing currency (default CZK for Czech market)
 */
export const quoteSettings = pgTable(
  "quote_settings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    billableHoursTarget: integer("billable_hours_target").notNull().default(160),
    currency: text("currency").notNull().default("CZK"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("quote_settings_user_id_idx").on(table.userId)],
)

/**
 * Quote table - stores individual quotes with calculation inputs and outputs
 * Supports reactive recalculation as user edits inputs
 */
export const quote = pgTable(
  "quote",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Quote metadata
    title: text("title").notNull(),
    clientName: text("client_name"),
    description: text("description"),
    month: text("month"), // YYYY-MM format for monthly quotes

    // Calculation inputs - persist to enable reactive recalculation
    billableHours: numeric("billable_hours", { precision: 10, scale: 2 }), // Expected billable hours
    monthlyOverheadCosts: numeric("monthly_overhead_costs", { precision: 12, scale: 2 }).default("0"), // Total monthly overhead
    projectDurationMonths: numeric("project_duration_months", { precision: 10, scale: 2 }).default("1"), // Project duration in months
    targetMarginPercent: numeric("target_margin_percent", { precision: 5, scale: 2 }).default("30"), // Desired profit margin %
    targetProfitAmount: numeric("target_profit_amount", { precision: 12, scale: 2 }), // Specific profit target amount

    // Calculated outputs
    floorHourlyRate: numeric("floor_hourly_rate", { precision: 10, scale: 2 }), // Calculated minimum hourly rate
    customRate: numeric("custom_rate", { precision: 10, scale: 2 }), // User-set rate (may be higher than floor)
    overheadAllocation: numeric("overhead_allocation", { precision: 12, scale: 2 }), // Allocated overhead for this quote
    totalCost: numeric("total_cost", { precision: 12, scale: 2 }), // Rate × hours
    netProfit: numeric("net_profit", { precision: 12, scale: 2 }), // Calculated profit
    recommendedPrice: numeric("recommended_price", { precision: 12, scale: 2 }), // Recommended quote price

    currency: text("currency").notNull().default("CZK"),
    status: text("status").default("draft").notNull(), // draft, sent, accepted, rejected
    version: integer("version").default(1).notNull(), // Track quote versions
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("quote_user_id_idx").on(table.userId),
    index("quote_month_idx").on(table.month),
    index("quote_user_month_idx").on(table.userId, table.month),
    index("quote_status_idx").on(table.status),
  ],
)

/**
 * Relations
 */
export const quoteSettingsRelations = relations(quoteSettings, ({ one }) => ({
  user: one(user, {
    fields: [quoteSettings.userId],
    references: [user.id],
  }),
}))

export const quoteRelations = relations(quote, ({ one }) => ({
  user: one(user, {
    fields: [quote.userId],
    references: [user.id],
  }),
}))
