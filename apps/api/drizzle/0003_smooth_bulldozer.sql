ALTER TABLE "issues" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "customer_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "service_operations" ALTER COLUMN "issue_id" DROP NOT NULL;