import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getOrCreateDefaultTenant, DEFAULT_QUOTE_RULES } from '@/db/helpers';
import { z } from 'zod';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env['NEXT_PUBLIC_CONVEX_URL'];
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

const quoteSchema = z.object({
  tenantId: z.string().optional(),
  serviceType: z.string(),
  propertyType: z.string(),
  urgency: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = quoteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error.issues.map(e => e.message).join(', ')
      }, { status: 400 });
    }

    const { tenantId, serviceType, propertyType, urgency } = result.data;

    let quoteRules = DEFAULT_QUOTE_RULES;

    if (convex) {
      // In Convex, get default tenant settings
      const tenantData = await convex.mutation(api.tenants.getOrCreateDefaultTenant, {});
      if (tenantData && (tenantData as any).quoteRules) {
        quoteRules = (tenantData as any).quoteRules;
      }
    } else {
      const tid = tenantId || (await getOrCreateDefaultTenant()).id;
      // Fetch tenant rules
      const tenantList = await db.select().from(tenants).where(eq(tenants.id, tid));
      const tenantData = tenantList[0] || (await getOrCreateDefaultTenant());
      quoteRules = (tenantData.quoteRules as typeof DEFAULT_QUOTE_RULES) || DEFAULT_QUOTE_RULES;
    }

    // Extract base pricing
    const basePrice = quoteRules.pricing[serviceType] || { min: 70, max: 120 };
    const propMultiplier = quoteRules.multipliers?.property?.[propertyType] ?? 1.0;
    const urgencyMultiplier = quoteRules.multipliers?.urgency?.[urgency] ?? 1.0;

    const minPrice = Math.round(basePrice.min * propMultiplier * urgencyMultiplier);
    const maxPrice = Math.round(basePrice.max * propMultiplier * urgencyMultiplier);

    return NextResponse.json({
      success: true,
      minPrice,
      maxPrice,
    });
  } catch (error: any) {
    console.error('Error in /api/quote:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
