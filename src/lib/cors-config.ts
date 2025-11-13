export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://lmnpzfafwslxeqmdrucx.supabase.co',
];

export function getCorsHeaders(origin?: string | null): Record<string, string> {
  const isDevelopment = Deno.env.get('DENO_DEPLOYMENT_ID') === undefined;

  const allowedOrigin = isDevelopment
    ? '*'
    : (origin && ALLOWED_ORIGINS.includes(origin)) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
    'Access-Control-Max-Age': '86400',
  };
}
