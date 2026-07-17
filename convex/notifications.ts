import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const createNotification = mutation({
  args: {
    tenantId: v.id('tenants'),
    leadId: v.id('leads'),
    channel: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('notifications', {
      tenantId: args.tenantId,
      leadId: args.leadId,
      channel: args.channel,
      status: args.status,
    });
  },
});
