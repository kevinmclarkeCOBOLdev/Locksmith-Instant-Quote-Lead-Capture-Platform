import { NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, quotes, auditLogs, tenants } from '@/db/schema';
import { getOrCreateDefaultTenant, DEFAULT_QUOTE_RULES } from '@/db/helpers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { api } from '@/../convex/_generated/api';
import { getConvexClient } from '@/lib/convex';
import { sendLeadNotifications } from '@/services/notificationService';

const leadSchema = z.object({
  tenantId: z.string().optional(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  postcode: z.string(),
  serviceType: z.string(),
  propertyType: z.string(),
  urgency: z.string(),
  message: z.string().optional(),
});

// Helper for Nominatim Geocoding with strict 2.5s timeout
async function geocodePostcode(postcode: string): Promise<{ lat: number | null; lng: number | null }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(postcode)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'LocksmithLeadPlatform/1.0 (contact@locksmithleadplatform.co.uk)',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('Nominatim request failed');
    const data = await response.json();
    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.error('Geocoding notice (bypassed smoothly):', postcode, err);
  }
  return { lat: null, lng: null };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = leadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error.issues.map(e => e.message).join(', ')
      }, { status: 400 });
    }

    const data = result.data;

    // 1. Geocode with timeout protection
    const { lat, lng } = await geocodePostcode(data.postcode);

    const convex = getConvexClient();

    if (convex) {
      try {
        console.log('[API /api/lead] Attempting Convex lead submission...');
        // 2. Fetch tenant & calculate quote
        const tenantData = await convex.mutation(api.tenants.getOrCreateDefaultTenant, {});
        if (!tenantData) throw new Error('Tenant could not be initialized in Convex');

        const tid = (tenantData as any)._id;
        const quoteRules = (tenantData as any).quoteRules || DEFAULT_QUOTE_RULES;

        const basePrice = quoteRules.pricing[data.serviceType] || { min: 70, max: 120 };
        const propMultiplier = quoteRules.multipliers?.property?.[data.propertyType] ?? 1.0;
        const urgencyMultiplier = quoteRules.multipliers?.urgency?.[data.urgency] ?? 1.0;

        const minPrice = Math.round(basePrice.min * propMultiplier * urgencyMultiplier);
        const maxPrice = Math.round(basePrice.max * propMultiplier * urgencyMultiplier);

        // 3. Insert lead
        const newLeadId = await convex.mutation(api.leads.createLead, {
          tenantId: tid,
          name: data.name,
          phone: data.phone,
          email: data.email,
          postcode: data.postcode,
          lat: lat || undefined,
          lng: lng || undefined,
          serviceType: data.serviceType,
          propertyType: data.propertyType,
          urgency: data.urgency,
          message: data.message,
        });

        // 4. Insert quote
        const newQuoteId = await convex.mutation(api.quotes.createQuote, {
          tenantId: tid,
          leadId: newLeadId,
          minPrice,
          maxPrice,
          quoteType: 'instant',
        });

        // 5. Create audit log
        await convex.mutation(api.auditLogs.createAuditLog, {
          tenantId: tid,
          event: 'Lead Created',
          metadata: { leadId: newLeadId, quoteId: newQuoteId, name: data.name },
        });

        // 6. Trigger notifications directly in-process
        try {
          await sendLeadNotifications({
            tenantId: tid,
            leadId: newLeadId,
            minPrice,
            maxPrice,
          });
        } catch (notifyErr) {
          console.error('Async notify triggers failed:', notifyErr);
        }

        console.log('[API /api/lead] Lead and quote successfully saved in Convex:', newLeadId);

        return NextResponse.json({
          success: true,
          engine: 'convex',
          lead: {
            id: newLeadId,
            tenantId: tid,
            name: data.name,
            phone: data.phone,
            email: data.email,
            postcode: data.postcode,
            lat,
            lng,
            serviceType: data.serviceType,
            propertyType: data.propertyType,
            urgency: data.urgency,
            message: data.message || null,
            status: 'new',
          },
          quote: {
            id: newQuoteId,
            tenantId: tid,
            leadId: newLeadId,
            minPrice,
            maxPrice,
            quoteType: 'instant',
          },
        });
      } catch (convexErr: any) {
        console.error('[API /api/lead] Convex operation failed, falling back to local DB:', convexErr);
      }
    } else {
      console.warn('[API /api/lead] No Convex URL environment variable detected. Using local fallback.');
    }

    // Local / Drizzle fallback
    const tid = data.tenantId || (await getOrCreateDefaultTenant()).id;

    // 2. Fetch tenant & calculate quote (Drizzle)
    const tenantList = await db.select().from(tenants).where(eq(tenants.id, tid));
    const tenantData = tenantList[0] || (await getOrCreateDefaultTenant());
    const quoteRules = (tenantData.quoteRules as typeof DEFAULT_QUOTE_RULES) || DEFAULT_QUOTE_RULES;

    const basePrice = quoteRules.pricing[data.serviceType] || { min: 70, max: 120 };
    const propMultiplier = quoteRules.multipliers?.property?.[data.propertyType] ?? 1.0;
    const urgencyMultiplier = quoteRules.multipliers?.urgency?.[data.urgency] ?? 1.0;

    const minPrice = Math.round(basePrice.min * propMultiplier * urgencyMultiplier);
    const maxPrice = Math.round(basePrice.max * propMultiplier * urgencyMultiplier);

    // 3. Insert lead
    const [newLead] = await db.insert(leads).values({
      tenantId: tid,
      name: data.name,
      phone: data.phone,
      email: data.email,
      postcode: data.postcode,
      lat,
      lng,
      serviceType: data.serviceType,
      propertyType: data.propertyType,
      urgency: data.urgency,
      message: data.message || null,
      status: 'new',
    }).returning();

    // 4. Insert quote
    const [newQuote] = await db.insert(quotes).values({
      tenantId: tid,
      leadId: newLead.id,
      minPrice: minPrice.toString(),
      maxPrice: maxPrice.toString(),
      quoteType: 'instant',
    }).returning();

    // 5. Create audit log
    await db.insert(auditLogs).values({
      tenantId: tid,
      event: 'Lead Created',
      metadata: { leadId: newLead.id, quoteId: newQuote.id, name: data.name },
    });

    // 6. Trigger notifications directly in-process
    try {
      await sendLeadNotifications({
        tenantId: tid,
        leadId: newLead.id,
        minPrice,
        maxPrice,
      });
    } catch (notifyErr) {
      console.error('Async notify triggers failed:', notifyErr);
    }

    return NextResponse.json({
      success: true,
      engine: 'local_fallback',
      lead: newLead,
      quote: newQuote,
    });
  } catch (error: any) {
    console.error('Error in /api/lead:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
