import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const createLead = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert('leads', {
      ...args,
      status: 'new',
      createdAt: Date.now(),
    });
    return leadId;
  },
});

export const getLeads = query({
  args: { tenantId: v.id('tenants') },
  handler: async (ctx, args) => {
    const leadsList = await ctx.db
      .query('leads')
      .withIndex('by_tenant', (q) => q.eq('tenantId', args.tenantId))
      .collect();

    // Sort by createdAt descending
    const sortedLeads = leadsList.sort((a, b) => b.createdAt - a.createdAt);

    const results = [];
    for (const lead of sortedLeads) {
      const quote = await ctx.db
        .query('quotes')
        .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
        .first();

      results.push({
        id: lead._id,
        tenantId: lead.tenantId,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        postcode: lead.postcode,
        lat: lead.lat,
        lng: lead.lng,
        serviceType: lead.serviceType,
        propertyType: lead.propertyType,
        urgency: lead.urgency,
        message: lead.message ?? null,
        status: lead.status,
        createdAt: new Date(lead.createdAt).toISOString(),
        quote: quote ? {
          id: quote._id,
          minPrice: quote.minPrice.toString(),
          maxPrice: quote.maxPrice.toString(),
          quoteType: quote.quoteType
        } : null
      });
    }

    return results;
  },
});

export const getLeadById = query({
  args: { leadId: v.id('leads') },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) return null;

    const quote = await ctx.db
      .query('quotes')
      .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
      .first();

    return {
      id: lead._id,
      tenantId: lead.tenantId,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      postcode: lead.postcode,
      lat: lead.lat,
      lng: lead.lng,
      serviceType: lead.serviceType,
      propertyType: lead.propertyType,
      urgency: lead.urgency,
      message: lead.message ?? null,
      status: lead.status,
      createdAt: new Date(lead.createdAt).toISOString(),
      quote: quote ? {
        id: quote._id,
        minPrice: quote.minPrice.toString(),
        maxPrice: quote.maxPrice.toString(),
        quoteType: quote.quoteType
      } : null
    };
  }
});

export const updateLeadStatus = mutation({
  args: {
    leadId: v.id('leads'),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.leadId, { status: args.status });
    return await ctx.db.get(args.leadId);
  },
});

export const getDashboardMetrics = query({
  args: { tenantId: v.id('tenants') },
  handler: async (ctx, args) => {
    const leads = await ctx.db
      .query('leads')
      .withIndex('by_tenant', (q) => q.eq('tenantId', args.tenantId))
      .collect();

    const quotes = await ctx.db
      .query('quotes')
      .collect();
    const tenantQuotes = quotes.filter(q => q.tenantId === args.tenantId);

    const totalLeads = leads.length;
    const totalQuotes = tenantQuotes.length;

    const convertedLeads = leads.filter(l => l.status === 'booked' || l.status === 'completed').length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthMs = startOfMonth.getTime();
    const leadsThisMonth = leads.filter(l => l.createdAt >= startOfMonthMs).length;

    let totalQuoteVal = 0;
    for (const q of tenantQuotes) {
      totalQuoteVal += (q.minPrice + q.maxPrice) / 2;
    }
    const averageQuoteValue = totalQuotes > 0 ? Math.round(totalQuoteVal / totalQuotes) : 0;

    const serviceCounts: Record<string, number> = {};
    for (const l of leads) {
      serviceCounts[l.serviceType] = (serviceCounts[l.serviceType] || 0) + 1;
    }
    const topServices = Object.entries(serviceCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts: Record<string, { count: number; index: number }> = {};
    for (const l of leads) {
      const date = new Date(l.createdAt);
      const monStr = monthNames[date.getMonth()];
      const monNum = date.getMonth();
      if (!monthlyCounts[monStr]) {
        monthlyCounts[monStr] = { count: 0, index: monNum };
      }
      monthlyCounts[monStr].count++;
    }

    const chartData = Object.entries(monthlyCounts)
      .map(([name, info]) => ({ name, Leads: info.count, index: info.index }))
      .sort((a, b) => a.index - b.index)
      .map(({ name, Leads }) => ({ name, Leads }));

    return {
      totalLeads,
      totalQuotes,
      conversionRate,
      leadsThisMonth,
      averageQuoteValue,
      topServices,
      chartData: chartData.length > 0 ? chartData : [{ name: 'No Data', Leads: 0 }]
    };
  }
});
