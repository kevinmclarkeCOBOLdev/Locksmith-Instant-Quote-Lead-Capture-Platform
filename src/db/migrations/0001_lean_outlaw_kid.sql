ALTER TABLE "tenants" ADD COLUMN "business_phone" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "business_email" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "quote_rules" jsonb;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "notification_settings" jsonb;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "email_templates" jsonb;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "sms_templates" jsonb;