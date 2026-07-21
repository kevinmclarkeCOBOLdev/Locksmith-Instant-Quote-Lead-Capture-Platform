import { mutation } from './_generated/server';
import {
  DEFAULT_QUOTE_RULES,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_EMAIL_TEMPLATES,
  DEFAULT_SMS_TEMPLATES
} from './constants';

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get or create tenant
    let tenantId;
    const existingTenants = await ctx.db.query('tenants').collect();
    if (existingTenants.length > 0) {
      tenantId = existingTenants[0]._id;
    } else {
      tenantId = await ctx.db.insert('tenants', {
        name: 'Atypikal Locksmith Services',
        createdAt: Date.now(),
        businessPhone: '+447700900077',
        businessEmail: 'info@atypikallocksmiths.co.uk',
        quoteRules: DEFAULT_QUOTE_RULES,
        notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
        emailTemplates: DEFAULT_EMAIL_TEMPLATES,
        smsTemplates: DEFAULT_SMS_TEMPLATES
      });
    }

    // 2. Clear old test users, leads, quotes, and audit logs to make it a clean seed
    const oldUsers = await ctx.db.query('users').collect();
    for (const u of oldUsers) {
      await ctx.db.delete(u._id);
    }
    const oldLeads = await ctx.db.query('leads').collect();
    for (const l of oldLeads) {
      await ctx.db.delete(l._id);
    }
    const oldQuotes = await ctx.db.query('quotes').collect();
    for (const q of oldQuotes) {
      await ctx.db.delete(q._id);
    }
    const oldLogs = await ctx.db.query('audit_logs').collect();
    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
    }

    // 3. Create test users (Supabase Auth Mock user ids)
    await ctx.db.insert('users', {
      tenantId,
      email: 'admin@atypikallocksmiths.co.uk',
      authUserId: '11111111-1111-1111-1111-111111111111',
      password: 'MockPassword123!'
    });
    await ctx.db.insert('users', {
      tenantId,
      email: 'kevin.clarke@example.com',
      authUserId: '22222222-2222-2222-2222-222222222222',
      password: 'MockPassword456!'
    });

    // 4. Create test leads & quotes
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Lead 1: Emergency lockout (Completed)
    const lead1Id = await ctx.db.insert('leads', {
      tenantId,
      name: 'John Doe',
      phone: '+447700900011',
      email: 'john.doe@example.com',
      postcode: 'OX1 1AA',
      lat: 51.752,
      lng: -1.258,
      serviceType: 'Locked Out',
      propertyType: 'House',
      urgency: 'Emergency',
      message: 'Locked key inside bedroom, need urgent access.',
      status: 'completed',
      createdAt: now - 5 * oneDay
    });
    await ctx.db.insert('quotes', {
      tenantId,
      leadId: lead1Id,
      minPrice: 90,
      maxPrice: 130,
      quoteType: 'instant'
    });

    // Lead 2: Lock replacement (Booked)
    const lead2Id = await ctx.db.insert('leads', {
      tenantId,
      name: 'Sarah Smith',
      phone: '+447700900022',
      email: 'sarah.smith@example.com',
      postcode: 'OX2 6EE',
      lat: 51.765,
      lng: -1.272,
      serviceType: 'Lock Replacement',
      propertyType: 'Flat',
      urgency: 'Same Day',
      message: 'Need to change front door locks after moving in.',
      status: 'booked',
      createdAt: now - 3 * oneDay
    });
    await ctx.db.insert('quotes', {
      tenantId,
      leadId: lead2Id,
      minPrice: 150,
      maxPrice: 220,
      quoteType: 'instant'
    });

    // Lead 3: Commercial Locksmith (New)
    const lead3Id = await ctx.db.insert('leads', {
      tenantId,
      name: 'Office Manager',
      phone: '+447700900033',
      email: 'office@company.com',
      postcode: 'OX4 2ZZ',
      lat: 51.731,
      lng: -1.215,
      serviceType: 'Commercial Locksmith',
      propertyType: 'Office',
      urgency: 'Flexible',
      message: 'Master key system installation request.',
      status: 'new',
      createdAt: now - 1 * oneDay
    });
    await ctx.db.insert('quotes', {
      tenantId,
      leadId: lead3Id,
      minPrice: 350,
      maxPrice: 500,
      quoteType: 'instant'
    });

    // Lead 4: Lost Keys (Contacted)
    const lead4Id = await ctx.db.insert('leads', {
      tenantId,
      name: 'David Jones',
      phone: '+447700900044',
      email: 'david.jones@example.com',
      postcode: 'SW1A 1AA',
      lat: 51.501,
      lng: -0.141,
      serviceType: 'Lost Keys',
      propertyType: 'Retail',
      urgency: 'Emergency',
      message: 'Lost keys to shop front shutter.',
      status: 'contacted',
      createdAt: now - 12 * 60 * 60 * 1000 // 12 hours ago
    });
    await ctx.db.insert('quotes', {
      tenantId,
      leadId: lead4Id,
      minPrice: 120,
      maxPrice: 180,
      quoteType: 'instant'
    });

    // 5. Create audit logs
    await ctx.db.insert('audit_logs', {
      tenantId,
      event: 'database_seeded',
      metadata: {
        seededBy: 'system',
        usersCount: 2,
        leadsCount: 4,
        quotesCount: 4
      },
      createdAt: now
    });

    return {
      success: true,
      seededTenant: tenantId,
      users: [
        { email: 'admin@atypikallocksmiths.co.uk', password: 'MockPassword123!' },
        { email: 'kevin.clarke@example.com', password: 'MockPassword456!' }
      ]
    };
  }
});
