# PRODUCT NAME

Locksmith Instant Quote & Lead Capture Platform

---

# ROLE

You are a senior SaaS architect, senior full-stack engineer, product designer, Supabase specialist, and conversion optimisation expert.

Your task is to build a production-ready lead generation platform designed specifically for locksmith businesses.

The platform must integrate seamlessly with any website regardless of:

* WordPress
* Elementor
* Webflow
* Wix
* Squarespace
* Shopify
* Custom HTML
* React
* Next.js

The platform should be built as a reusable SaaS product capable of serving multiple locksmith companies from a single codebase.

---

# PRIMARY OBJECTIVE

Increase locksmith enquiries by converting visitors into qualified leads.

The system should:

1. Qualify visitors
2. Generate instant estimates
3. Capture lead information
4. Store all data in Supabase
5. Notify locksmith businesses
6. Track conversions
7. Produce measurable ROI

---

# CORE USER JOURNEY

Visitor arrives on website

↓

Clicks:

"Get an Instant Quote"

↓

Wizard opens

↓

User answers questions

↓

Estimated price displayed

↓

Lead details collected

↓

Lead stored

↓

Notifications sent

↓

Lead enters dashboard

---

# TECHNOLOGY STACK

Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

Backend

* Next.js API Routes

Database

* Supabase PostgreSQL

Authentication

* Supabase Auth

Realtime

* Supabase Realtime

ORM

* Drizzle ORM

Validation

* Zod

Forms

* React Hook Form

Email

* Resend

Hosting

* Vercel

Maps

* OpenStreetMap
* Nominatim API

Analytics

* PostHog

---

# MULTI TENANT STRUCTURE

Tenant
└ Locksmith Business
└ Users
└ Leads
└ Quotes
└ Service Areas
└ Notifications

Every record must contain:

tenant_id

Implement:

* RLS
* Tenant isolation
* Audit logs

---

# EMBEDDABLE WIDGET

Create:

1. JavaScript Widget
2. React Component
3. iFrame Embed

Example:

<script
src="https://app.domain.com/widget.js"
data-tenant="TENANT_ID">
</script>

Widget loads asynchronously.

No dependencies.

Works on any website.

---

# INSTANT QUOTE WIZARD

STEP 1

What do you need help with?

Options:

* Locked Out
* Lost Keys
* Broken Key
* Lock Replacement
* Lock Repair
* UPVC Door Lock
* Security Upgrade
* Commercial Locksmith

---

STEP 2

Property Type

* House
* Flat
* Office
* Retail
* Commercial Unit

---

STEP 3

Urgency

* Emergency
* Same Day
* Flexible

---

STEP 4

Postcode

Validate postcode.

Use geocoding.

Store coordinates.

---

STEP 5

Optional Details

Message field.

---

STEP 6

Estimate Generation

Generate estimated price range.

Example:

Emergency Lockout

£75 - £120

Lock Replacement

£90 - £180

Commercial Lock Change

£150 - £350

Quote engine must be configurable.

No hard-coded pricing.

---

# LEAD CAPTURE

Before displaying estimate collect:

Name

Phone

Email

Postcode

Consent checkbox

Required.

Store lead.

---

# DATABASE TABLES

tenants

id
name
created_at

---

users

id
tenant_id
email

---

leads

id
tenant_id
name
phone
email
postcode
lat
lng
service_type
property_type
urgency
message
status
created_at

---

quotes

id
tenant_id
lead_id
min_price
max_price
quote_type

---

notifications

id
tenant_id
lead_id
channel
status

---

service_areas

id
tenant_id
postcode_prefix

---

audit_logs

id
tenant_id
event
metadata
created_at

---

# SUPABASE REQUIREMENTS

Generate:

* SQL schema
* Migrations
* RLS policies
* Indexes
* Seed data

Every query must be tenant scoped.

---

# API ENDPOINTS

POST

/api/quote

Returns estimate

---

POST

/api/lead

Creates lead

---

POST

/api/notify

Sends notifications

---

GET

/api/dashboard

Returns dashboard data

---

GET

/api/leads

Returns leads

---

PATCH

/api/leads/:id

Updates status

---

# NOTIFICATIONS

When lead submitted:

Send Email

via Resend

Send SMS

via Twilio abstraction layer

Send Dashboard Notification

via Supabase Realtime

---

# DASHBOARD

Create premium SaaS dashboard.

Pages:

Dashboard

Leads

Quotes

Settings

Analytics

---

# DASHBOARD METRICS

Display:

Total Leads

Quotes Generated

Conversion Rate

Leads This Month

Average Quote Value

Top Services

---

# LEAD PIPELINE

Statuses

New

Contacted

Quoted

Booked

Completed

Lost

Drag-and-drop Kanban board.

---

# SETTINGS

Business Name

Business Phone

Business Email

Logo

Quote Rules

Service Areas

Notification Settings

Email Templates

SMS Templates

---

# SECURITY

Implement:

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

# UI DESIGN

Design style:

Atypical Studio quality

Premium

Clean

Modern

Fast

Minimal

Conversion focused

Mobile first

---

# SUCCESS METRIC

The product succeeds if:

A locksmith receives more qualified enquiries than through a standard contact form.

Every feature should increase:

* lead volume
* lead quality
* conversion rate
* business revenue

Avoid unnecessary complexity.

Prioritise simplicity, speed, and measurable ROI.

