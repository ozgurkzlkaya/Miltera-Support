ALTER TABLE "locations" RENAME COLUMN "description" TO "notes";--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "address" text;