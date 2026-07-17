# Convex Database Integration Walkthrough

This document summarizes the changes made to integrate Convex database into the Locksmith Instant Quote & Lead Capture Platform, preserving PostgreSQL/Drizzle fallback.

## 🛠️ Changes Implemented

### 1. Convex Schema & Query/Mutation Endpoints
Created schema definitions matching the PostgreSQL schema and implemented high-performance serverless functions:

*   **`convex/schema.ts`**: Defines tables for `tenants`, `leads`, `quotes`, `notifications`, and `auditLogs` with necessary indexes for efficient retrieval.
*   **`convex/tenants.ts`**:
    *   `getOrCreateDefaultTenant` (Mutation): Seeds and returns a default tenant with default pricing, email, and notification settings.
    *   `updateTenantSettings` (Mutation): Updates tenant rules and notification preferences.
*   **`convex/leads.ts`**:
    *   `createLead` (Mutation): Inserts a new lead.
    *   `getLeads` (Query): Retrieves all leads for a tenant, matching quotes and sorting by creation date.
    *   `getLeadById` (Query): Retrieves details of a specific lead.
    *   `updateLeadStatus` (Mutation): Updates the status of a lead (e.g., from 'new' to 'quoted').
    *   `getDashboardMetrics` (Query): High-performance aggregation function calculating total leads, conversion rates, monthly trends, and service request statistics server-side.
*   **`convex/quotes.ts`**:
    *   `createQuote` (Mutation): Logs quote estimates.
*   **`convex/notifications.ts`**:
    *   `createNotification` (Mutation): Dispatches and logs dispatch statuses.
*   **`convex/auditLogs.ts`**:
    *   `createAuditLog` (Mutation): Adds audit logging trail records.

### 2. Next.js Routing Integration
We refactored all Next.js API endpoints to check for `NEXT_PUBLIC_CONVEX_URL`. When configured, they route operations to Convex; otherwise, they fall back to local PostgreSQL/Drizzle:

*   [GET & POST] `/api/tenant`
*   [POST] `/api/quote`
*   [POST] `/api/lead`
*   [GET] `/api/leads`
*   [PATCH] `/api/leads/[id]`
*   [GET] `/api/dashboard`
*   [POST] `/api/notify`

### 3. Frontend & Client-side Setup
*   **`src/components/ConvexClientProvider.tsx`**: Sets up `ConvexProvider` for client-side state hooks.
*   **`src/app/layout.tsx`**: Wrapped with `ConvexClientProvider` to expose hooks to the client application.
*   **`.gitignore`**: Added `.convex/` directory exclusion rule.

---

## 🧪 Verification & Development

To test or run Convex integration:

1.  **Configure environment variables**:
    Add your Convex project URL to `.env.local`:
    ```env
    NEXT_PUBLIC_CONVEX_URL="https://your-convex-deployment-url.convex.cloud"
    ```
2.  **Run Convex Development server**:
    Start the local syncing process:
    ```bash
    npx convex dev
    ```
3.  **Run local build**:
    Verify production compilation:
    ```bash
    npm run build
    ```
