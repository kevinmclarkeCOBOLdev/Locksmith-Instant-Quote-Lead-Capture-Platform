# Convex Integration Guide

This guide details the step-by-step process to set up, link, and deploy your own Convex account and database with this application.

---

## Step 1: Create a Convex Account
1. Visit [Convex](https://www.convex.dev/) and sign up / log in (using GitHub, Google, or email).
2. Once logged in, you will be taken to your Convex dashboard.

---

## Step 2: Initialize & Link the Project
Convex provides an automated CLI flow that log-in verifies your machine, prompts you to create a project, and auto-populates the environment variables.

1. Open your terminal in the root of the project:
   ```bash
   npx convex dev
   ```
2. The CLI will output a login URL (or automatically open a browser tab) asking you to authenticate:
   ```text
   Choose a project to configure, or create a new one:
   > Create a new project
   ```
3. Follow the CLI prompts:
   - Select **Create a new project**.
   - Provide a project name (e.g., `locksmith-instant-quote`).
   - Choose your team/organization.

4. Once the process completes, the CLI will:
   - Create a `.env.local` file (or append to it) with the required environment variables:
     ```env
     CONVEX_DEPLOYMENT="mighty-wombat-123" # your deployment name
     NEXT_PUBLIC_CONVEX_URL="https://mighty-wombat-123.convex.cloud" # your public URL
     ```
   - Automatically compile and upload the schema and functions under the `/convex` directory to your new Convex deployment.

---

## Step 3: Run the Development Server
With Convex running in development mode, any changes you make to the `/convex` folder will automatically sync to your cloud database.

1. Keep the Convex sync running in one terminal tab:
   ```bash
   npx convex dev
   ```
2. Start the local Next.js development server in another terminal tab:
   ```bash
   npm run dev
   ```
3. The API routes will detect `NEXT_PUBLIC_CONVEX_URL` in `.env.local` and seamlessly route all lead, quote, and tenant requests to Convex instead of the PostgreSQL fallback.

---

## Step 4: Deploying to Production (e.g., Vercel)
When deploying your app to production, you need to configure your production Convex deployment.

1. **Deploy the database schema/functions**:
   Run the deploy command from the project root:
   ```bash
   npx convex deploy
   ```
   This compiles and deploys your local `/convex` backend code directly to your production Convex deployment.

2. **Add Environment Variables to Hosting Provider**:
   In your hosting dashboard (e.g., Vercel, Netlify):
   - Add the environment variable `NEXT_PUBLIC_CONVEX_URL` with your production Convex deployment URL.
