const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db.js');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create a todo
app.post('/api/todos', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const [result] = await db.query('INSERT INTO todos (title) VALUES (?)', [title]);
    const [newTodo] = await db.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
    res.status(201).json(newTodo[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update a todo (toggle completion)
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    if (completed !== undefined) {
      await db.query('UPDATE todos SET completed = ? WHERE id = ?', [completed, id]);
    }
    const [updatedTodo] = await db.query('SELECT * FROM todos WHERE id = ?', [id]);
    res.json(updatedTodo[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM todos WHERE id = ?', [id]);
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
