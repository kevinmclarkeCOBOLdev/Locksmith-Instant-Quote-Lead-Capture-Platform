import { NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, quotes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { DEFAULT_TENANT_ID } from '@/db/helpers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || DEFAULT_TENANT_ID;

    // Fetch leads and left-join quotes
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
