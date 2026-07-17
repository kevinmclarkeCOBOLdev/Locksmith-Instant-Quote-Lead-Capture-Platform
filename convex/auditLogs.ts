import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const createAuditLog = mutation({
  args: {
    tenantId: v.id('tenants'),
    event: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('audit_logs', {
      tenantId: args.tenantId,
      event: args.event,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});
