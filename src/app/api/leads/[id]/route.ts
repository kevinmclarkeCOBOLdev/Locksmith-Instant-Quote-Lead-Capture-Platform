import { NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

const updateSchema = z.object({
  status: z.enum(['new', 'contacted', 'quoted', 'booked', 'completed', 'lost']),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error.issues.map(e => e.message).join(', ')
      }, { status: 400 });
    }

    const { status } = result.data;

    if (convex) {
      // Fetch existing lead (Convex)
      const lead = await convex.query(api.leads.getLeadById, { leadId: id as any });
      if (!lead) {
        return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
      }

      const l = lead as any;

      // Update status
      const updatedLead = await convex.mutation(api.leads.updateLeadStatus, {
        leadId: id as any,
        status,
      });

      // Log event
      await convex.mutation(api.auditLogs.createAuditLog, {
        tenantId: l.tenantId as any,
        event: 'Lead Status Updated',
        metadata: { leadId: id, oldStatus: l.status, newStatus: status },
      });

      return NextResponse.json({
        success: true,
        lead: {
          id: (updatedLead as any)?._id,
          ...(updatedLead as any)
        }
      });
    }

    // Fetch existing lead (Drizzle)
    const existing = await db.select().from(leads).where(eq(leads.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const lead = existing[0];

    // Update status
    const [updatedLead] = await db
      .update(leads)
      .set({ status })
      .where(eq(leads.id, id))
      .returning();

    // Log event
    await db.insert(auditLogs).values({
      tenantId: lead.tenantId,
      event: 'Lead Status Updated',
      metadata: { leadId: id, oldStatus: lead.status, newStatus: status },
    });

    return NextResponse.json({
      success: true,
      lead: updatedLead
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/leads/[id]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
