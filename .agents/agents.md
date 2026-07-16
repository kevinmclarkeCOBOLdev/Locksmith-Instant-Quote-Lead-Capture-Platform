# Agent Settings

* Model: gemini-3.5-flash
* Thinking Level: high

# Workspace Metadata

* Environment: SaaS Application Development
* Architecture: Multi-Tenant SaaS
* Frontend: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui
* Backend: Next.js API Routes
* Database: Supabase PostgreSQL
* Authentication: Supabase Auth
* Realtime: Supabase Realtime
* Email: Resend
* SMS: Twilio (Provider Abstraction Layer)
* ORM: Drizzle ORM
* Validation: Zod
* Forms: React Hook Form
* Maps: OpenStreetMap, Nominatim API
* Analytics: PostHog
* Deployment: Vercel

# Primary Goal

Build a production-ready Locksmith Instant Quote & Lead Capture Platform that helps locksmith businesses:

* Qualify visitors
* Generate instant estimates
* Capture lead information
* Store all data in Supabase
* Notify locksmith businesses
* Track conversions
* Produce measurable ROI

The platform must be built as a reusable SaaS product capable of serving multiple locksmith companies from a single codebase.

---

# Core User Journey

1. Visitor arrives on website
2. Clicks: "Get an Instant Quote"
3. Wizard opens
4. User answers questions
5. Estimated price displayed
6. Lead details collected
7. Lead stored
8. Notifications sent
9. Lead enters dashboard

---

# Operating Rules

## 1. Architecture First

Before generating code:

* Identify affected modules
* Identify database impacts
* Identify API impacts
* Identify authentication impacts
* Identify tenant isolation requirements

Always evaluate:

Frontend
↓
API Layer
↓
Business Logic
↓
Supabase
↓
Realtime Events

before making modifications.

---

## 2. Multi-Tenant Safety Rules

EVERY business record MUST belong to a tenant.

Required fields:

`tenant_id`

must exist on:

* tenants
* users
* leads
* quotes
* notifications
* service_areas
* audit_logs

Never generate code that risks tenant data leakage.

All queries must be tenant-scoped.

---

## 3. Row Level Security Enforcement

Whenever generating:

* migrations
* schema
* SQL
* policies

always include:

* RLS policies
* tenant ownership checks
* authenticated user checks

No table should be publicly accessible unless explicitly requested.

---

## 4. Production-Ready Code Only

Never generate:

* TODO comments
* placeholders
* pseudo-code
* mock implementations

Every function must be complete.

Every endpoint must be fully implemented.

Every database operation must be production-safe.

---

## 5. API Design Standards

All API endpoints must:

* use TypeScript
* validate requests with Zod
* return consistent response objects
* handle errors properly
* log failures

Response format:

```json
{
  "success": boolean,
  "data"?: object,
  "error"?: string
}
```

Standard Endpoints:
* `POST /api/quote`: Returns estimate
* `POST /api/lead`: Creates lead
* `POST /api/notify`: Sends notifications
* `GET /api/dashboard`: Returns dashboard data
* `GET /api/leads`: Returns leads
* `PATCH /api/leads/:id`: Updates status

---

## 6. Database Standards

Use:

* Drizzle ORM
* Supabase PostgreSQL

Generate:

* SQL schema
* Migrations
* RLS policies
* Indexes
* Seed data

Always optimize for:

* scalability
* query performance
* maintainability
* strict tenant scoping for every query

Database Schema:
* **tenants**: `id`, `name`, `created_at`
* **users**: `id`, `tenant_id`, `email`
* **leads**: `id`, `tenant_id`, `name`, `phone`, `email`, `postcode`, `lat`, `lng`, `service_type`, `property_type`, `urgency`, `message`, `status`, `created_at`
* **quotes**: `id`, `tenant_id`, `lead_id`, `min_price`, `max_price`, `quote_type`
* **notifications**: `id`, `tenant_id`, `lead_id`, `channel`, `status`
* **service_areas**: `id`, `tenant_id`, `postcode_prefix`
* **audit_logs**: `id`, `tenant_id`, `event`, `metadata`, `created_at`

---

## 7. SMS Provider Abstraction

Never tightly couple code to Twilio.

Create:

`SMSProvider` Interface

Implement:

`TwilioProvider`

Future providers should be swappable:

* Twilio
* Vonage
* MessageBird
* AWS SNS

without application refactoring.

---

## 8. Email Provider Abstraction

Create:

`EmailProvider` Interface

Implement:

`ResendProvider`

Allow future support for:

* Resend
* SendGrid
* Postmark
* Amazon SES

---

## 9. Embeddable Widget Standards

Create the following formats:
1. JavaScript Widget
2. React Component
3. iFrame Embed

Generated widgets must:
* Load asynchronously
* Have no external dependencies
* Work on any website (WordPress, Webflow, Wix, Squarespace, Shopify, Custom HTML, React, Next.js, etc.)
* Load quickly, be mobile-responsive, and degrade gracefully.

---

## 10. Instant Quote Wizard Standards

Implement a multi-step flow:
* **Step 1 (Service Type)**: Locked Out, Lost Keys, Broken Key, Lock Replacement, Lock Repair, UPVC Door Lock, Security Upgrade, Commercial Locksmith.
* **Step 2 (Property Type)**: House, Flat, Office, Retail, Commercial Unit.
* **Step 3 (Urgency)**: Emergency, Same Day, Flexible.
* **Step 4 (Postcode)**: Validate postcode, geocode (using OpenStreetMap/Nominatim API), store coordinates.
* **Step 5 (Optional Details)**: Message field.
* **Step 6 (Estimate Generation)**: Generate estimated price range (e.g. £75 - £120 for Emergency Lockout). Quote engine must be highly configurable with no hard-coded pricing.

---

## 11. Lead Capture Standards

Before displaying the estimate in Step 6, collect and require:
* Name
* Phone
* Email
* Postcode
* Consent checkbox

On submission:
* Store lead in database
* Generate/store quote estimate
* Trigger notifications
* Log events

---

## 12. Notification Standards

When a lead is submitted:
* Send Email via Resend
* Send SMS via Twilio abstraction layer
* Send Dashboard Notification via Supabase Realtime

---

## 13. Dashboard & Lead Pipeline Standards

Create a premium SaaS dashboard with pages:
* Dashboard
* Leads
* Quotes
* Settings
* Analytics

Dashboard Metrics:
* Total Leads
* Quotes Generated
* Conversion Rate
* Leads This Month
* Average Quote Value
* Top Services

Lead Pipeline Statuses:
* New
* Contacted
* Quoted
* Booked
* Completed
* Lost

Implement a drag-and-drop Kanban board for managing lead pipeline.

Settings:
* Business Name, Phone, Email
* Logo
* Quote Rules
* Service Areas
* Notification Settings (Email/SMS templates)

---

## 14. Security Requirements

Always implement:

* CSRF protection
* Rate limiting
* Input validation
* Zod schemas
* Environment variables
* Audit logging

Never expose:

* service role keys
* API secrets
* provider credentials

---

# Folder Structure Policy

Use:

* `/app`
* `/components`
* `/features`
* `/lib`
* `/services`
* `/providers`
* `/hooks`
* `/db`
* `/schema`
* `/migrations`
* `/types`
* `/utils`

Keep business logic separate from UI.

---

# Anti-Slop Safeguards

* Never rewrite unaffected files.
* Never regenerate entire projects when modifying a single feature.
* Prefer targeted updates.
* Preserve existing architecture.
* Maintain DRY principles.
* Keep code modular and reusable.

---

# UX Philosophy

The platform should feel:

* atypical Studio quality
* premium
* clean
* modern
* fast
* minimal
* conversion-focused
* mobile-first
* operationally useful

Target user:

A locksmith business owner who is not technical.

Interfaces should prioritise:

* clarity
* speed
* simplicity
* business outcomes

over complexity.

---

# Success Criteria

The platform succeeds if a locksmith business owner receives more qualified enquiries than through a standard contact form.

Every feature should increase:

* lead volume
* lead quality
* conversion rate
* business revenue

Avoid unnecessary complexity. Prioritise simplicity, speed, and measurable ROI.
