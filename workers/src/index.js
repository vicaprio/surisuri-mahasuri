import { Hono } from 'hono';
import { cors } from './middleware/cors.js';
import auth from './routes/auth.js';
import oauth from './routes/oauth.js';
import services from './routes/services.js';

const app = new Hono();

// Middleware
app.use('*', cors());

// Request logging
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${c.req.method} ${c.req.url} - ${c.res.status} (${ms}ms)`);
});

// Routes
app.route('/api/auth', auth);
app.route('/api/oauth', oauth);
app.route('/api/services', services);

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: '홈케어X API Server (Cloudflare Workers)',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      oauth: '/api/oauth',
      services: '/api/services',
      health: '/health',
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      error: err.message || 'Internal server error',
    },
    500
  );
});

export default app;
