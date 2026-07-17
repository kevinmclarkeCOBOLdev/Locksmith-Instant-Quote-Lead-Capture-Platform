import { NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, quotes } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { DEFAULT_TENANT_ID } from '@/db/helpers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get('tenantId');

    if (convex) {
      // Find default tenant if no id passed
      const tenantData = await convex.mutation(api.tenants.getOrCreateDefaultTenant, {});
      const tenantId = tenantIdParam || (tenantData as any)?._id;

      const metrics = await convex.query(api.leads.getDashboardMetrics, { tenantId: tenantId as any });
      return NextResponse.json({
        success: true,
        metrics
      });
    }

    const tenantId = tenantIdParam || DEFAULT_TENANT_ID;

    // 1. Fetch total leads (Drizzle)
    const [leadsCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(eq(leads.tenantId, tenantId));
    const totalLeads = leadsCountRes?.count || 0;

    // 2. Fetch quotes generated count
    const [quotesCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(quotes)
      .where(eq(quotes.tenantId, tenantId));
    const totalQuotes = quotesCountRes?.count || 0;

    // 3. Fetch conversion rate: (booked + completed leads / total leads) * 100
    const [convertedRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(
        sql`${leads.tenantId} = ${tenantId} AND (${leads.status} = 'booked' OR ${leads.status} = 'completed')`
      );
    const convertedLeads = convertedRes?.count || 0;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // 4. Fetch leads this month (since first day of current month)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const [leadsThisMonthRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(
        sql`${leads.tenantId} = ${tenantId} AND ${leads.createdAt} >= ${firstDayOfMonth}`
      );
    const leadsThisMonth = leadsThisMonthRes?.count || 0;

    // 5. Fetch average quote value (mid-point of min and max price)
    const [avgQuoteRes] = await db
      .select({
        avgVal: sql<number>`COALESCE(avg((${quotes.minPrice}::numeric + ${quotes.maxPrice}::numeric) / 2), 0)::int`
      })
      .from(quotes)
      .where(eq(quotes.tenantId, tenantId));
    const averageQuoteValue = avgQuoteRes?.avgVal || 0;

    // 6. Top Services requested
    const topServices = await db
      .select({
        name: leads.serviceType,
        value: sql<number>`count(*)::int`
      })
      .from(leads)
      .where(eq(leads.tenantId, tenantId))
      .groupBy(leads.serviceType)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    // 7. Monthly chart data (last 6 months)
    const monthlyData = await db
      .select({
        month: sql<string>`to_char(${leads.createdAt}, 'Mon')`,
        count: sql<number>`count(*)::int`,
        monthNum: sql<number>`extract(month from ${leads.createdAt})::int`
      })
      .from(leads)
      .where(eq(leads.tenantId, tenantId))
      .groupBy(sql`to_char(${leads.createdAt}, 'Mon')`, sql`extract(month from ${leads.createdAt})`)
      .orderBy(sql`extract(month from ${leads.createdAt})`);

    // Ensure chart formatting
    const formattedChartData = monthlyData.map((item: any) => ({
      name: item.month,
      Leads: item.count
    }));

    return NextResponse.json({
      success: true,
      metrics: {
        totalLeads,
        totalQuotes,
        conversionRate,
        leadsThisMonth,
        averageQuoteValue,
        topServices,
        chartData: formattedChartData.length > 0 ? formattedChartData : [{ name: 'No Data', Leads: 0 }],
      }
    });
  } catch (error: any) {
    console.error('Error in /api/dashboard:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
