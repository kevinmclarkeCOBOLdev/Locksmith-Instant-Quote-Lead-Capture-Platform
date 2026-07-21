import { query } from './_generated/server';
import { v } from 'convex/values';

export const verifyUser = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();

    if (!user || user.password !== args.password) {
      return null;
    }

    return {
      id: user._id,
      tenantId: user.tenantId,
      email: user.email,
      authUserId: user.authUserId,
    };
  },
});
