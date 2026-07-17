import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  DEFAULT_QUOTE_RULES,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_EMAIL_TEMPLATES,
  DEFAULT_SMS_TEMPLATES
} from './constants';

export const getOrCreateDefaultTenant = mutation({
  args: {},
  handler: async (ctx) => {
    // Find the first tenant in the database
    const existingTenants = await ctx.db.query('tenants').collect();
    if (existingTenants.length > 0) {
      return existingTenants[0];
    }

    // Create default tenant if none exists
    const tenantId = await ctx.db.insert('tenants', {
      name: 'Atypikal Locksmith Services',
      createdAt: Date.now(),
      businessPhone: '+447700900077',
      businessEmail: 'info@atypikallocksmiths.co.uk',
      quoteRules: DEFAULT_QUOTE_RULES,
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      emailTemplates: DEFAULT_EMAIL_TEMPLATES,
      smsTemplates: DEFAULT_SMS_TEMPLATES
    });

    const tenant = await ctx.db.get(tenantId);

    // Also seed a default user
    const existingUsers = await ctx.db.query('users').collect();
    if (existingUsers.length === 0 && tenant) {
      await ctx.db.insert('users', {
        tenantId: tenant._id,
        email: 'admin@atypikallocksmiths.co.uk',
        authUserId: '11111111-1111-1111-1111-111111111111'
      });
    }

    return tenant;
  }
});

export const getTenantById = query({
  args: { tenantId: v.id('tenants') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tenantId);
  }
});

export const updateTenantSettings = mutation({
  args: {
    tenantId: v.id('tenants'),
    name: v.optional(v.string()),
    businessPhone: v.optional(v.string()),
    businessEmail: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    quoteRules: v.optional(v.any()),
    notificationSettings: v.optional(v.any()),
    emailTemplates: v.optional(v.any()),
    smsTemplates: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { tenantId, ...updates } = args;
    await ctx.db.patch(tenantId, updates);
    return await ctx.db.get(tenantId);
  }
});
