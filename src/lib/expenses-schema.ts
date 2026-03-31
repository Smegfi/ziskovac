import { relations } from "drizzle-orm"
import { integer, pgTable, text, timestamp, index } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

export const expenseCategory = pgTable(
  "expense_category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("expense_category_user_id_idx").on(table.userId)]
)

export const expense = pgTable(
  "expense",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => expenseCategory.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").default("CZK").notNull(),
    date: timestamp("date").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("expense_user_id_idx").on(table.userId),
    index("expense_category_id_idx").on(table.categoryId),
    index("expense_date_idx").on(table.date),
  ]
)

export const expenseCategoryRelations = relations(expenseCategory, ({ one, many }) => ({
  user: one(user, {
    fields: [expenseCategory.userId],
    references: [user.id],
  }),
  expenses: many(expense),
}))

export const expenseRelations = relations(expense, ({ one }) => ({
  user: one(user, {
    fields: [expense.userId],
    references: [user.id],
  }),
  category: one(expenseCategory, {
    fields: [expense.categoryId],
    references: [expenseCategory.id],
  }),
}))
