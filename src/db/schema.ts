import { pgTable, uuid, text, timestamp, numeric, doublePrecision, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Tenants table
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  businessPhone: text('business_phone'),
  businessEmail: text('business_email'),
  logoUrl: text('logo_url'),
  quoteRules: jsonb('quote_rules'), // Pricing rules by service_type, property_type, urgency
  notificationSettings: jsonb('notification_settings'),
  emailTemplates: jsonb('email_templates'),
  smsTemplates: jsonb('sms_templates'),
});

// Relations for tenants
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  leads: many(leads),
  quotes: many(quotes),
  notifications: many(notifications),
  serviceAreas: many(serviceAreas),
  auditLogs: many(auditLogs),
}));

// 2. Users table (linked to Supabase Auth user id)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Matches Supabase Auth user ID
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  password: text('password'),
});

// Relations for users
export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
}));

// 3. Leads table
export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  postcode: text('postcode').notNull(),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  serviceType: text('service_type').notNull(), // Locked Out, Lost Keys, etc.
  propertyType: text('property_type').notNull(), // House, Flat, etc.
  urgency: text('urgency').notNull(), // Emergency, Same Day, Flexible
  message: text('message'),
  status: text('status').default('new').notNull(), // new, contacted, quoted, booked, completed, lost
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations for leads
export const leadsRelations = relations(leads, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [leads.tenantId],
    references: [tenants.id],
  }),
  quotes: many(quotes),
  notifications: many(notifications),
}));

// 4. Quotes table
export const quotes = pgTable('quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  minPrice: numeric('min_price').notNull(),
  maxPrice: numeric('max_price').notNull(),
  quoteType: text('quote_type').notNull(), // e.g., "instant"
});

// Relations for quotes
export const quotesRelations = relations(quotes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [quotes.tenantId],
    references: [tenants.id],
  }),
  lead: one(leads, {
    fields: [quotes.leadId],
    references: [leads.id],
  }),
}));

// 5. Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  channel: text('channel').notNull(), // email, sms, realtime
  status: text('status').default('pending').notNull(), // pending, sent, failed
});

// Relations for notifications
export const notificationsRelations = relations(notifications, ({ one }) => ({
  tenant: one(tenants, {
    fields: [notifications.tenantId],
    references: [tenants.id],
  }),
  lead: one(leads, {
    fields: [notifications.leadId],
    references: [leads.id],
  }),
}));

// 6. Service Areas table
export const serviceAreas = pgTable('service_areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  postcodePrefix: text('postcode_prefix').notNull(), // e.g., "SW1", "W1"
});

// Relations for service areas
export const serviceAreasRelations = relations(serviceAreas, ({ one }) => ({
  tenant: one(tenants, {
    fields: [serviceAreas.tenantId],
    references: [tenants.id],
  }),
}));

// 7. Audit Logs table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  event: text('event').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations for audit logs
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditLogs.tenantId],
    references: [tenants.id],
  }),
}));
