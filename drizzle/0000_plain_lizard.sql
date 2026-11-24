CREATE TYPE "public"."match_status" AS ENUM('matched', 'unlisted', 'manual');--> statement-breakpoint
CREATE TYPE "public"."ticket_type" AS ENUM('solo', 'couple');--> statement-breakpoint
CREATE TABLE "faq_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_fr" text NOT NULL,
	"answer_fr" text NOT NULL,
	"question_en" text NOT NULL,
	"answer_en" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"partner_name" text,
	"match_key" text NOT NULL,
	"partner_match_key" text,
	"ticket_type" "ticket_type" NOT NULL,
	"table_number" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guests_table_positive" CHECK ("guests"."table_number" IS NULL OR "guests"."table_number" > 0)
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_code" text NOT NULL,
	"ticket_type" "ticket_type" NOT NULL,
	"primary_name" text NOT NULL,
	"partner_name" text,
	"match_key" text NOT NULL,
	"partner_match_key" text,
	"guest_id" uuid,
	"match_status" "match_status" NOT NULL,
	"locale" text NOT NULL,
	"checked_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_public_code_unique" UNIQUE("public_code"),
	CONSTRAINT "tickets_partner_matches_type" CHECK (("tickets"."ticket_type" = 'couple') = ("tickets"."partner_name" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guests_match_key_idx" ON "guests" USING btree ("match_key");--> statement-breakpoint
CREATE INDEX "guests_partner_match_key_idx" ON "guests" USING btree ("partner_match_key");--> statement-breakpoint
CREATE INDEX "tickets_match_key_idx" ON "tickets" USING btree ("match_key");--> statement-breakpoint
CREATE INDEX "tickets_guest_id_idx" ON "tickets" USING btree ("guest_id");