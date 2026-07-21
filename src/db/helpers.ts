import { db } from './index';
import { tenants, users } from './schema';
import { eq } from 'drizzle-orm';

export const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

export const DEFAULT_QUOTE_RULES = {
  pricing: {
    "Locked Out": { min: 75, max: 120 },
    "Lost Keys": { min: 80, max: 150 },
    "Broken Key": { min: 70, max: 130 },
    "Lock Replacement": { min: 90, max: 180 },
    "Lock Repair": { min: 80, max: 140 },
    "UPVC Door Lock": { min: 95, max: 175 },
    "Security Upgrade": { min: 120, max: 250 },
    "Commercial Locksmith": { min: 150, max: 350 }
  } as Record<string, { min: number; max: number }>,
  multipliers: {
    property: {
      "House": 1.0,
      "Flat": 1.0,
      "Office": 1.2,
      "Retail": 1.3,
      "Commercial Unit": 1.4
    } as Record<string, number>,
    urgency: {
      "Emergency": 1.3,
      "Same Day": 1.1,
      "Flexible": 1.0
    } as Record<string, number>
  }
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
  emailEnabled: true,
  smsEnabled: true,
  dashboardEnabled: true
};

export const DEFAULT_EMAIL_TEMPLATES = {
  leadNotification: `
    <h3>New Locksmith Lead Captured!</h3>
    <p><strong>Name:</strong> {{name}}</p>
    <p><strong>Phone:</strong> {{phone}}</p>
    <p><strong>Email:</strong> {{email}}</p>
    <p><strong>Postcode:</strong> {{postcode}}</p>
    <p><strong>Service Requested:</strong> {{serviceType}}</p>
    <p><strong>Property Type:</strong> {{propertyType}}</p>
    <p><strong>Urgency:</strong> {{urgency}}</p>
    <p><strong>Estimated Price:</strong> £{{minPrice}} - £{{maxPrice}}</p>
    <p><strong>Message:</strong> {{message}}</p>
  `
};

export const DEFAULT_SMS_TEMPLATES = {
  leadNotification: "New Lead! {{name}} requests {{serviceType}} ({{urgency}}). Phone: {{phone}}. Estimate: £{{minPrice}}-£{{maxPrice}}"
};

export async function getOrCreateDefaultTenant() {
  try {
    // Try to find default tenant
    const existing = await db.select().from(tenants).where(eq(tenants.id, DEFAULT_TENANT_ID));
    if (existing.length > 0) {
      return existing[0];
    }

    // Create default tenant
    const [newTenant] = await db.insert(tenants).values({
      id: DEFAULT_TENANT_ID,
      name: 'Atypikal Locksmith Services',
      businessPhone: '+447700900077',
      businessEmail: 'info@atypikallocksmiths.co.uk',
      quoteRules: DEFAULT_QUOTE_RULES,
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      emailTemplates: DEFAULT_EMAIL_TEMPLATES,
      smsTemplates: DEFAULT_SMS_TEMPLATES
    }).returning();

    // Also seed a default user for testing if needed
    const existingUser = await db.select().from(users).where(eq(users.tenantId, DEFAULT_TENANT_ID));
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: '11111111-1111-1111-1111-111111111111', // Dummy user ID for dashboard demo login
        tenantId: DEFAULT_TENANT_ID,
        email: 'admin@atypikallocksmiths.co.uk',
        password: 'MockPassword123!'
      });
    }

    return newTenant;
  } catch (error) {
    console.error('Error during tenant initialization:', error);
    // If table doesn't exist yet, return a fallback object
    return {
      id: DEFAULT_TENANT_ID,
      name: 'Atypikal Locksmith Services',
      businessPhone: '+447700900077',
      businessEmail: 'info@atypikallocksmiths.co.uk',
      quoteRules: DEFAULT_QUOTE_RULES,
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      emailTemplates: DEFAULT_EMAIL_TEMPLATES,
      smsTemplates: DEFAULT_SMS_TEMPLATES
    };
  }
}
