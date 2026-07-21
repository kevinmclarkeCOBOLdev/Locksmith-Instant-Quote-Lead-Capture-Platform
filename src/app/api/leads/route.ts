import { NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, quotes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { DEFAULT_TENANT_ID } from '@/db/helpers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env['NEXT_PUBLIC_CONVEX_URL'];
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get('tenantId');

    if (convex) {
      // Find default tenant if no id passed
      const tenantData = await convex.mutation(api.tenants.getOrCreateDefaultTenant, {});
      const tenantId = tenantIdParam || (tenantData as any)?._id;

      const leadsList = await convex.query(api.leads.getLeads, { tenantId: tenantId as any });
      return NextResponse.json({
        success: true,
        leads: leadsList
      });
    }

    const tenantId = tenantIdParam || DEFAULT_TENANT_ID;

    // Fetch leads and left-join quotes (Drizzle)
    const results = await db
      .select({
        lead: leads,
        quote: quotes,
      })
      .from(leads)
      .leftJoin(quotes, eq(leads.id, quotes.leadId))
      .where(eq(leads.tenantId, tenantId))
      .orderBy(desc(leads.createdAt));

    // Map into flat structure
    const formatted = results.map((row: any) => ({
      ...row.lead,
      quote: row.quote ? {
        id: row.quote.id,
        minPrice: row.quote.minPrice,
        maxPrice: row.quote.maxPrice,
        quoteType: row.quote.quoteType
      } : null
    }));

    return NextResponse.json({
      success: true,
      leads: formatted
    });
  } catch (error: any) {
    console.error('Error in /api/leads:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
