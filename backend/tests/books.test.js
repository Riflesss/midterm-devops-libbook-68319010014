const request = require('supertest');

jest.mock('../db', () => ({
  query: jest.fn(),
}));

const app = require('../index');
const pool = require('../db');

describe('Books API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/books should return a list of books', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Test Book' }] });
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1, title: 'Test Book' }]);
  });

  it('POST /api/books should reject a request missing required fields', async () => {
    const res = await request(app).post('/api/books').send({ title: 'No ISBN or author' });
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/books/:id should return 404 when the book does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/books/999');
    expect(res.statusCode).toBe(404);
  });
});
