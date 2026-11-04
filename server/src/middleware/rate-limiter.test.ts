import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

describe('API Rate Limiters', () => {
  let testApp: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    testApp = express();
    testApp.use(express.json());

    // Rate limiter configured identically to contact & booking routes
    const testLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 3, // limit to 3 requests per test window
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests. Please try again later.',
        },
      },
    });

    testApp.post('/api/test-limit', testLimiter, (_req, res) => {
      res.status(200).json({ success: true, message: 'allowed' });
    });
  });

  it('allows requests within the configured threshold', async () => {
    const res1 = await request(testApp).post('/api/test-limit').send({});
    const res2 = await request(testApp).post('/api/test-limit').send({});
    const res3 = await request(testApp).post('/api/test-limit').send({});

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(200);
  });

  it('blocks excess requests with 429 TOO_MANY_REQUESTS', async () => {
    // Exceed the limit of 3
    await request(testApp).post('/api/test-limit').send({});
    await request(testApp).post('/api/test-limit').send({});
    await request(testApp).post('/api/test-limit').send({});

    const blockedRes = await request(testApp).post('/api/test-limit').send({});
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body.error.code).toBe('TOO_MANY_REQUESTS');
    expect(blockedRes.headers).toHaveProperty('ratelimit-limit');
    expect(blockedRes.headers).toHaveProperty('ratelimit-remaining');
  });
});
