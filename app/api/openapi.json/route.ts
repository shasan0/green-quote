import { openApiSpec } from '@/src/lib/openapi';
import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json(openApiSpec);
}
