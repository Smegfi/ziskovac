import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, index, boolean } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

/**
 * Subscriptions table - tracks user Stripe subscription status
 * Links user to their Stripe subscription and plan
 */
export const subscription = pgTable(
  "subscription",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Stripe references
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    stripeCustomerId: text("stripe_customer_id").unique(),
    stripePriceId: text("stripe_price_id"), // Current price/plan

    // Plan info
    plan: text("plan").notNull().default("free"), // free, monthly, annual
    status: text("status").notNull().default("active"), // active, canceled, past_due, incomplete
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    canceledAt: timestamp("canceled_at"),

    // Billing info
    currency: text("currency").default("USD"),
    lastPaymentDate: timestamp("last_payment_date"),
    nextBillingDate: timestamp("next_billing_date"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("subscription_user_id_idx").on(table.userId),
    index("subscription_stripe_customer_id_idx").on(table.stripeCustomerId),
    index("subscription_status_idx").on(table.status),
  ],
)

/**
 * Billing events table - audit trail of subscription lifecycle events
 * Tracks Stripe webhook events for debugging and compliance
 */
export const billingEvent = pgTable(
  "billing_event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Event info
    eventType: text("event_type").notNull(), // e.g., customer.subscription.created, invoice.paid, etc.
    stripeEventId: text("stripe_event_id").unique().notNull(),
    stripeResource: text("stripe_resource"), // JSON string of the Stripe resource

    // Processing
    processed: boolean("processed").notNull().default(false),
    error: text("error"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("billing_event_user_id_idx").on(table.userId),
    index("billing_event_event_type_idx").on(table.eventType),
    index("billing_event_stripe_event_id_idx").on(table.stripeEventId),
  ],
)

/**
 * Relations
 */
export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id],
  }),
}))

export const billingEventRelations = relations(billingEvent, ({ one }) => ({
  user: one(user, {
    fields: [billingEvent.userId],
    references: [user.id],
  }),
}))
