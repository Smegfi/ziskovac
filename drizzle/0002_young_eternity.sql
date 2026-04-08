CREATE TABLE "quote_line_item" (
	"id" text PRIMARY KEY NOT NULL,
	"quote_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit" text,
	"unit_price" numeric(12, 2) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"hourly_rate" numeric(10, 2),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "overhead_category" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "overhead_cost" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category_id" text NOT NULL,
	"month" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"is_fixed" boolean DEFAULT false NOT NULL,
	"description" text,
	"currency" text DEFAULT 'CZK' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "overhead_summary" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"month" text NOT NULL,
	"total_fixed" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_variable" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_overhead" numeric(12, 2) DEFAULT '0' NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'CZK' NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote_line_item" ADD CONSTRAINT "quote_line_item_quote_id_quote_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_line_item" ADD CONSTRAINT "quote_line_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overhead_category" ADD CONSTRAINT "overhead_category_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overhead_cost" ADD CONSTRAINT "overhead_cost_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overhead_cost" ADD CONSTRAINT "overhead_cost_category_id_overhead_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."overhead_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overhead_summary" ADD CONSTRAINT "overhead_summary_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quote_line_item_quote_id_idx" ON "quote_line_item" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_line_item_user_id_idx" ON "quote_line_item" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "quote_line_item_sort_order_idx" ON "quote_line_item" USING btree ("quote_id","sort_order");--> statement-breakpoint
CREATE INDEX "overhead_category_user_id_idx" ON "overhead_category" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "overhead_cost_user_id_idx" ON "overhead_cost" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "overhead_cost_category_id_idx" ON "overhead_cost" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "overhead_cost_month_idx" ON "overhead_cost" USING btree ("month");--> statement-breakpoint
CREATE INDEX "overhead_cost_user_month_idx" ON "overhead_cost" USING btree ("user_id","month");--> statement-breakpoint
CREATE INDEX "overhead_summary_user_id_idx" ON "overhead_summary" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "overhead_summary_month_idx" ON "overhead_summary" USING btree ("month");--> statement-breakpoint
CREATE INDEX "overhead_summary_user_month_idx" ON "overhead_summary" USING btree ("user_id","month");