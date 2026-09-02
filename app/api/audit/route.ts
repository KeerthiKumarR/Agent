import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const logs = await db.getAuditLogs();
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, title, detail, agent, payload } = await req.json();
    if (!type || !title || !detail) {
      return NextResponse.json({ error: 'type, title, and detail are required' }, { status: 400 });
    }

    const newLog = await db.addAuditLog({
      type,
      title,
      detail,
      agent,
      payload
    });

    return NextResponse.json({ log: newLog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
