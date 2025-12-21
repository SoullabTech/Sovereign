import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

export async function GET() {
  const anon = createHash('md5').update('demo-user').digest('hex');
  const data = { dataset_id: anon, facets: [{ name: 'fire', conf: 0.7 }] };
  return NextResponse.json(data, {
    headers: {
      'Content-Disposition': `attachment; filename="maia-research-${anon}.json"`,
    },
  });
}
