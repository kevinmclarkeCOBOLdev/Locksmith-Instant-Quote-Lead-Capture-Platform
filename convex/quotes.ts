import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const createQuote = mutation({
  args: {
    tenantId: v.id('tenants'),
    leadId: v.id('leads'),
    minPrice: v.number(),
    maxPrice: v.number(),
    quoteType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('quotes', {
      tenantId: args.tenantId,
      leadId: args.leadId,
      minPrice: args.minPrice,
      maxPrice: args.maxPrice,
      quoteType: args.quoteType,
    });
  },
});
