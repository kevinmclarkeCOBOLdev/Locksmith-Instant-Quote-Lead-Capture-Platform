import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getOrCreateDefaultTenant, DEFAULT_TENANT_ID } from '@/db/helpers';
import { z } from 'zod';

const tenantSettingsSchema = z.object({
  name: z.string(),
  businessPhone: z.string(),
  businessEmail: z.string().email(),
  logoUrl: z.string().optional().nullable(),
  quoteRules: z.any(),
  notificationSettings: z.any(),
  emailTemplates: z.any(),
  smsTemplates: z.any(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || DEFAULT_TENANT_ID;

    const tenantList = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    const tenant = tenantList[0] || (await getOrCreateDefaultTenant());

    return NextResponse.json({
      success: true,
      tenant
    });
  } catch (error: any) {
    console.error('Error fetching tenant details:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = tenantSettingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error.issues.map(e => e.message).join(', ')
      }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || DEFAULT_TENANT_ID;
    const data = result.data;

    // Check if tenant exists, otherwise init
    const existing = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    if (existing.length === 0) {
      await getOrCreateDefaultTenant();
    }

    // Update
    const [updatedTenant] = await db
      .update(tenants)
      .set({
        name: data.name,
        businessPhone: data.businessPhone,
        businessEmail: data.businessEmail,
        logoUrl: data.logoUrl || null,
        quoteRules: data.quoteRules,
        notificationSettings: data.notificationSettings,
        emailTemplates: data.emailTemplates,
        smsTemplates: data.smsTemplates,
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    return NextResponse.json({
      success: true,
      tenant: updatedTenant
    });
  } catch (error: any) {
    console.error('Error updating tenant details:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
