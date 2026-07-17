import { NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, tenants, notifications, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getOrCreateDefaultTenant, DEFAULT_EMAIL_TEMPLATES, DEFAULT_SMS_TEMPLATES, DEFAULT_NOTIFICATION_SETTINGS } from '@/db/helpers';
import { emailProvider } from '@/services/email';
import { smsProvider } from '@/services/sms';
import { z } from 'zod';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

const notifySchema = z.object({
  tenantId: z.string(),
  leadId: z.string(),
  minPrice: z.number(),
  maxPrice: z.number(),
});

function renderTemplate(template: string, variables: Record<string, any>): string {
  let output = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    output = output.replace(regex, value !== undefined && value !== null ? String(value) : '');
  }
  return output;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = notifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error.issues.map(e => e.message).join(', ')
      }, { status: 400 });
    }

    const { tenantId, leadId, minPrice, maxPrice } = result.data;

    if (convex) {
      // 1. Fetch Lead (Convex)
      const lead = await convex.query(api.leads.getLeadById, { leadId: leadId as any });
      if (!lead) {
        return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
      }

      // 2. Fetch Tenant settings (Convex)
      const tenant = await convex.mutation(api.tenants.getOrCreateDefaultTenant, {});
      if (!tenant) throw new Error('Tenant not found');

      const l = lead as any;
      const t = tenant as any;

      const notifSettings = t.notificationSettings || DEFAULT_NOTIFICATION_SETTINGS;
      const emailTemplates = t.emailTemplates || DEFAULT_EMAIL_TEMPLATES;
      const smsTemplates = t.smsTemplates || DEFAULT_SMS_TEMPLATES;

      const variables = {
        name: l.name,
        phone: l.phone,
        email: l.email,
        postcode: l.postcode,
        serviceType: l.serviceType,
        propertyType: l.propertyType,
        urgency: l.urgency,
        message: l.message || 'No details provided.',
        minPrice,
        maxPrice,
      };

      const notificationRecords: any[] = [];

      // 3. Send Email
      if (notifSettings.emailEnabled && t.businessEmail) {
        const emailHtml = renderTemplate(emailTemplates.leadNotification, variables);
        const emailRes = await emailProvider.sendEmail({
          to: t.businessEmail,
          subject: `New Lead - ${l.name} (${l.serviceType})`,
          html: emailHtml,
        });

        const newNotifId = await convex.mutation(api.notifications.createNotification, {
          tenantId: t._id,
          leadId: l.id as any,
          channel: 'email',
          status: emailRes.success ? 'sent' : 'failed',
        });
        notificationRecords.push({ id: newNotifId, channel: 'email', status: emailRes.success ? 'sent' : 'failed' });
      }

      // 4. Send SMS
      if (notifSettings.smsEnabled && t.businessPhone) {
        const smsBody = renderTemplate(smsTemplates.leadNotification, variables);
        const smsRes = await smsProvider.sendSMS({
          to: t.businessPhone,
          body: smsBody,
        });

        const newNotifId = await convex.mutation(api.notifications.createNotification, {
          tenantId: t._id,
          leadId: l.id as any,
          channel: 'sms',
          status: smsRes.success ? 'sent' : 'failed',
        });
        notificationRecords.push({ id: newNotifId, channel: 'sms', status: smsRes.success ? 'sent' : 'failed' });
      }

      // 5. Realtime Notification log
      if (notifSettings.dashboardEnabled) {
        const newNotifId = await convex.mutation(api.notifications.createNotification, {
          tenantId: t._id,
          leadId: l.id as any,
          channel: 'realtime',
          status: 'sent',
        });
        notificationRecords.push({ id: newNotifId, channel: 'realtime', status: 'sent' });
      }

      // Log to audit logs
      await convex.mutation(api.auditLogs.createAuditLog, {
        tenantId: t._id,
        event: 'Notifications Dispatched',
        metadata: { leadId, count: notificationRecords.length },
      });

      return NextResponse.json({
        success: true,
        notifications: notificationRecords,
      });
    }

    // 1. Fetch Lead (Drizzle)
    const leadList = await db.select().from(leads).where(eq(leads.id, leadId));
    const lead = leadList[0];
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    // 2. Fetch Tenant settings (Drizzle)
    const tenantList = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    const tenant = tenantList[0] || (await getOrCreateDefaultTenant());

    const notifSettings = (tenant.notificationSettings as typeof DEFAULT_NOTIFICATION_SETTINGS) || DEFAULT_NOTIFICATION_SETTINGS;
    const emailTemplates = (tenant.emailTemplates as typeof DEFAULT_EMAIL_TEMPLATES) || DEFAULT_EMAIL_TEMPLATES;
    const smsTemplates = (tenant.smsTemplates as typeof DEFAULT_SMS_TEMPLATES) || DEFAULT_SMS_TEMPLATES;

    const variables = {
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      postcode: lead.postcode,
      serviceType: lead.serviceType,
      propertyType: lead.propertyType,
      urgency: lead.urgency,
      message: lead.message || 'No details provided.',
      minPrice,
      maxPrice,
    };

    const notificationRecords: any[] = [];

    // 3. Send Email
    if (notifSettings.emailEnabled && tenant.businessEmail) {
      const emailHtml = renderTemplate(emailTemplates.leadNotification, variables);
      const emailRes = await emailProvider.sendEmail({
        to: tenant.businessEmail,
        subject: `New Lead - ${lead.name} (${lead.serviceType})`,
        html: emailHtml,
      });

      const [emailNotif] = await db.insert(notifications).values({
        tenantId,
        leadId,
        channel: 'email',
        status: emailRes.success ? 'sent' : 'failed',
      }).returning();
      notificationRecords.push(emailNotif);
    }

    // 4. Send SMS
    if (notifSettings.smsEnabled && tenant.businessPhone) {
      const smsBody = renderTemplate(smsTemplates.leadNotification, variables);
      const smsRes = await smsProvider.sendSMS({
        to: tenant.businessPhone,
        body: smsBody,
      });

      const [smsNotif] = await db.insert(notifications).values({
        tenantId,
        leadId,
        channel: 'sms',
        status: smsRes.success ? 'sent' : 'failed',
      }).returning();
      notificationRecords.push(smsNotif);
    }

    // 5. Realtime Notification log
    if (notifSettings.dashboardEnabled) {
      const [realtimeNotif] = await db.insert(notifications).values({
        tenantId,
        leadId,
        channel: 'realtime',
        status: 'sent', // Always logged as sent for realtime push
      }).returning();
      notificationRecords.push(realtimeNotif);
    }

    // Log to audit logs
    await db.insert(auditLogs).values({
      tenantId,
      event: 'Notifications Dispatched',
      metadata: { leadId, count: notificationRecords.length },
    });

    return NextResponse.json({
      success: true,
      notifications: notificationRecords,
    });
  } catch (error: any) {
    console.error('Error in /api/notify:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
