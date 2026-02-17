/**
 * CORS middleware
 */
export function cors() {
  return async (c, next) => {
    const origin = c.req.header('Origin') || '*';

    // Allow Cloudflare Pages and localhost
    const allowedPatterns = [
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/.*\.pages\.dev$/,
      /^https?:\/\/.*\.cloudworkstations\.dev$/,
    ];

    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));

    if (isAllowed || origin === '*') {
      c.header('Access-Control-Allow-Origin', origin);
      c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      c.header('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (c.req.method === 'OPTIONS') {
      return c.text('', 204);
    }

    await next();
  };
}
