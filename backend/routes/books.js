const express = require('express');

const router = express.Router();
const pool = require('../db');

// GET /api/books
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/books
router.post('/', async (req, res) => {
  const {
    isbn, title, author, category, year, status,
  } = req.body;

  if (!isbn || !title || !author) {
    return res.status(400).json({ error: 'isbn, title and author are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO books (isbn, title, author, category, year, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [isbn, title, author, category || null, year || null, status || 'available'],
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/books/:id
router.put('/:id', async (req, res) => {
  const {
    isbn, title, author, category, year, status,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE books SET isbn=$1, title=$2, author=$3, category=$4, year=$5, status=$6
       WHERE id=$7 RETURNING *`,
      [isbn, title, author, category, year, status, req.params.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/books/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM books WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
