import { db } from '@/db';
import { leads, tenants, notifications, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getOrCreateDefaultTenant, DEFAULT_EMAIL_TEMPLATES, DEFAULT_SMS_TEMPLATES, DEFAULT_NOTIFICATION_SETTINGS } from '@/db/helpers';
import { emailProvider } from '@/services/email';
import { smsProvider } from '@/services/sms';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/../convex/_generated/api';

export interface SendNotificationsParams {
  tenantId: string;
  leadId: string;
  minPrice: number;
  maxPrice: number;
}

function renderTemplate(template: string, variables: Record<string, any>): string {
  let output = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    output = output.replace(regex, value !== undefined && value !== null ? String(value) : '');
  }
  return output;
}

export async function sendLeadNotifications(params: SendNotificationsParams) {
  const { tenantId, leadId, minPrice, maxPrice } = params;
  const convex = getConvexClient();

  if (convex) {
    try {
      // 1. Fetch Lead (Convex)
      const lead = await convex.query(api.leads.getLeadById, { leadId: leadId as any });
      if (!lead) {
        console.warn(`[Notifications] Lead ${leadId} not found in Convex.`);
        return { success: false, error: 'Lead not found' };
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
          leadId: leadId as any,
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
          leadId: leadId as any,
          channel: 'sms',
          status: smsRes.success ? 'sent' : 'failed',
        });
        notificationRecords.push({ id: newNotifId, channel: 'sms', status: smsRes.success ? 'sent' : 'failed' });
      }

      // 5. Realtime Notification log
      if (notifSettings.dashboardEnabled) {
        const newNotifId = await convex.mutation(api.notifications.createNotification, {
          tenantId: t._id,
          leadId: leadId as any,
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

      return { success: true, notifications: notificationRecords };
    } catch (convexErr) {
      console.error('[Notifications] Convex dispatch failed, falling back to local DB:', convexErr);
    }
  }

  // Drizzle / Fallback path
  try {
    const leadList = await db.select().from(leads).where(eq(leads.id, leadId));
    const lead = leadList[0];
    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }

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

    if (notifSettings.dashboardEnabled) {
      const [realtimeNotif] = await db.insert(notifications).values({
        tenantId,
        leadId,
        channel: 'realtime',
        status: 'sent',
      }).returning();
      notificationRecords.push(realtimeNotif);
    }

    await db.insert(auditLogs).values({
      tenantId,
      event: 'Notifications Dispatched',
      metadata: { leadId, count: notificationRecords.length },
    });

    return { success: true, notifications: notificationRecords };
  } catch (err: any) {
    console.error('Error in sendLeadNotifications:', err);
    return { success: false, error: err.message || 'Internal notification error' };
  }
}
