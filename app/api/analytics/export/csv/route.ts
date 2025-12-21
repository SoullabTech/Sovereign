import { NextResponse } from 'next/server';

export async function GET() {
  const csv = 'facet,confidence\nfire,0.7\nwater,0.3\n';
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="maia-analytics.csv"',
    },
  });
}
