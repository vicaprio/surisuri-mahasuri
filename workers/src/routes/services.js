import { Hono } from 'hono';
import { query, queryOne } from '../utils/db.js';

const services = new Hono();

/**
 * GET /api/services
 * Get all services
 */
services.get('/', async (c) => {
  try {
    const db = c.env.DB;

    const result = await query(
      db,
      'SELECT * FROM services WHERE is_active = 1 ORDER BY category, name'
    );

    return c.json({
      data: result.results || [],
    });
  } catch (error) {
    console.error('Get services error:', error);
    return c.json({ error: 'Failed to fetch services' }, 500);
  }
});

/**
 * GET /api/services/:id
 * Get service by ID
 */
services.get('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const db = c.env.DB;

    const service = await queryOne(
      db,
      'SELECT * FROM services WHERE id = ? AND is_active = 1',
      [id]
    );

    if (!service) {
      return c.json({ error: 'Service not found' }, 404);
    }

    return c.json({ data: service });
  } catch (error) {
    console.error('Get service error:', error);
    return c.json({ error: 'Failed to fetch service' }, 500);
  }
});

export default services;
