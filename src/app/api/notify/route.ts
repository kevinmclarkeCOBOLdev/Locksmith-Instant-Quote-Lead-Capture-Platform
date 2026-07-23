import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendLeadNotifications } from '@/services/notificationService';

const notifySchema = z.object({
  tenantId: z.string(),
  leadId: z.string(),
  minPrice: z.number(),
  maxPrice: z.number(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = notifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error.issues.map(e => e.message).join(', ')
      }, { status: 400 });
    }

    const res = await sendLeadNotifications(result.data);
    if (!res.success) {
      return NextResponse.json(res, { status: 400 });
    }

    return NextResponse.json(res);
  } catch (error: any) {
    console.error('Error in /api/notify:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
