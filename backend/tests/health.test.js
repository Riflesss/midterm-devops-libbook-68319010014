const request = require('supertest');

jest.mock('../db', () => ({
  query: jest.fn(),
}));

const app = require('../index');

describe('GET /health', () => {
  it('should return status ok and a version string', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('version');
  });
});
