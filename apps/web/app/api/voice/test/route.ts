// Simple test endpoint to verify Vercel function deployment
export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Vercel function is working'
  }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}

export async function POST() {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    method: 'POST',
    timestamp: new Date().toISOString() 
  }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}