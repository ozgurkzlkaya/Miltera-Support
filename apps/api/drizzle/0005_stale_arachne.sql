ALTER TABLE "locations" ADD COLUMN "capacity" integer;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "current_count" integer DEFAULT 0;