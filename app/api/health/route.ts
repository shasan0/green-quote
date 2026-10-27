import { connection } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET() {
  await connection();
  return NextResponse.json({ status: 'ok', uptimeSeconds: Math.round(process.uptime()) });
}
