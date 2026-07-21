import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  tenants: defineTable({
    name: v.string(),
    createdAt: v.number(),
    businessPhone: v.optional(v.string()),
    businessEmail: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    quoteRules: v.optional(v.any()),
    notificationSettings: v.optional(v.any()),
    emailTemplates: v.optional(v.any()),
    smsTemplates: v.optional(v.any()),
  }),

  users: defineTable({
    tenantId: v.id('tenants'),
    email: v.string(),
    authUserId: v.string(),
    password: v.optional(v.string()),
  }).index('by_authUserId', ['authUserId']),

  leads: defineTable({
    tenantId: v.id('tenants'),
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    postcode: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    serviceType: v.string(),
    propertyType: v.string(),
    urgency: v.string(),
    message: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
  }).index('by_tenant', ['tenantId']),

  quotes: defineTable({
    tenantId: v.id('tenants'),
    leadId: v.id('leads'),
    minPrice: v.number(),
    maxPrice: v.number(),
    quoteType: v.string(),
  }).index('by_lead', ['leadId']),

  notifications: defineTable({
    tenantId: v.id('tenants'),
    leadId: v.id('leads'),
    channel: v.string(),
    status: v.string(),
  }).index('by_tenant', ['tenantId']),

  service_areas: defineTable({
    tenantId: v.id('tenants'),
    postcodePrefix: v.string(),
  }).index('by_tenant_postcode', ['tenantId', 'postcodePrefix']),

  audit_logs: defineTable({
    tenantId: v.id('tenants'),
    event: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index('by_tenant', ['tenantId']),
});
