CREATE TABLE "quote" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"client_name" text,
	"description" text,
	"month" text,
	"billable_hours" numeric(10, 2),
	"monthly_overhead_costs" numeric(12, 2) DEFAULT '0',
	"project_duration_months" numeric(10, 2) DEFAULT '1',
	"target_margin_percent" numeric(5, 2) DEFAULT '30',
	"target_profit_amount" numeric(12, 2),
	"floor_hourly_rate" numeric(10, 2),
	"custom_rate" numeric(10, 2),
	"overhead_allocation" numeric(12, 2),
	"total_cost" numeric(12, 2),
	"net_profit" numeric(12, 2),
	"recommended_price" numeric(12, 2),
	"currency" text DEFAULT 'CZK' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"billable_hours_target" integer DEFAULT 160 NOT NULL,
	"currency" text DEFAULT 'CZK' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_settings" ADD CONSTRAINT "quote_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quote_user_id_idx" ON "quote" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "quote_month_idx" ON "quote" USING btree ("month");--> statement-breakpoint
CREATE INDEX "quote_user_month_idx" ON "quote" USING btree ("user_id","month");--> statement-breakpoint
CREATE INDEX "quote_status_idx" ON "quote" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quote_settings_user_id_idx" ON "quote_settings" USING btree ("user_id");