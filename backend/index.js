require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./db');
const booksRouter = require('./routes/books');

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      isbn VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      year INTEGER,
      status VARCHAR(50) DEFAULT 'available'
    );
  `);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.use('/api/books', booksRouter);

const PORT = process.env.PORT || 3000;

/* istanbul ignore next */
if (require.main === module) {
  ensureSchema()
    .catch((err) => {
      console.error('Failed to ensure database schema:', err.message);
    })
    .finally(() => {
      app.listen(PORT, () => {
        console.log(`libbook-api listening on port ${PORT}`);
      });
    });
}

module.exports = app;
