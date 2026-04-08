import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, index, numeric, boolean, integer } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

/**
 * Overhead cost categories for classification
 */
export const overheadCategory = pgTable(
  "overhead_category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // e.g., "Rent", "Software", "Salary"
    description: text("description"),
    color: text("color"), // For UI purposes
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("overhead_category_user_id_idx").on(table.userId)]
)

/**
 * Monthly overhead costs
 * Tracks fixed and variable overhead costs by month
 */
export const overheadCost = pgTable(
  "overhead_cost",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => overheadCategory.id, { onDelete: "cascade" }),
    month: text("month").notNull(), // YYYY-MM format
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // Cost amount
    isFixed: boolean("is_fixed").default(false).notNull(), // Fixed vs variable
    description: text("description"), // Optional details
    currency: text("currency").default("CZK").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("overhead_cost_user_id_idx").on(table.userId),
    index("overhead_cost_category_id_idx").on(table.categoryId),
    index("overhead_cost_month_idx").on(table.month),
    index("overhead_cost_user_month_idx").on(table.userId, table.month),
  ]
)

/**
 * Overhead cost summary by month (for faster queries)
 * Cached aggregate of monthly overhead totals
 */
export const overheadSummary = pgTable(
  "overhead_summary",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    month: text("month").notNull(), // YYYY-MM format
    totalFixed: numeric("total_fixed", { precision: 12, scale: 2 }).default("0").notNull(),
    totalVariable: numeric("total_variable", { precision: 12, scale: 2 }).default("0").notNull(),
    totalOverhead: numeric("total_overhead", { precision: 12, scale: 2 }).default("0").notNull(),
    itemCount: integer("item_count").default(0).notNull(),
    currency: text("currency").default("CZK").notNull(),
    lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  },
  (table) => [
    index("overhead_summary_user_id_idx").on(table.userId),
    index("overhead_summary_month_idx").on(table.month),
    index("overhead_summary_user_month_idx").on(table.userId, table.month),
  ]
)

// Relations
export const overheadCategoryRelations = relations(overheadCategory, ({ one, many }) => ({
  user: one(user, {
    fields: [overheadCategory.userId],
    references: [user.id],
  }),
  costs: many(overheadCost),
}))

export const overheadCostRelations = relations(overheadCost, ({ one }) => ({
  user: one(user, {
    fields: [overheadCost.userId],
    references: [user.id],
  }),
  category: one(overheadCategory, {
    fields: [overheadCost.categoryId],
    references: [overheadCategory.id],
  }),
}))

export const overheadSummaryRelations = relations(overheadSummary, ({ one }) => ({
  user: one(user, {
    fields: [overheadSummary.userId],
    references: [user.id],
  }),
}))
