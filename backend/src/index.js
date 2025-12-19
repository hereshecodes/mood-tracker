const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database tables
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS moods (
        id SERIAL PRIMARY KEY,
        mood VARCHAR(50) NOT NULL,
        note TEXT,
        energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all moods (with optional date filtering)
app.get('/api/moods', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = 'SELECT * FROM moods';
    const params = [];

    if (start_date && end_date) {
      query += ' WHERE created_at >= $1 AND created_at <= $2';
      params.push(start_date, end_date);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching moods:', err);
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
});

// Get mood stats
app.get('/api/moods/stats', async (req, res) => {
  try {
    const moodCounts = await pool.query(`
      SELECT mood, COUNT(*) as count
      FROM moods
      GROUP BY mood
      ORDER BY count DESC
    `);

    const avgEnergy = await pool.query(`
      SELECT AVG(energy_level) as average_energy
      FROM moods
      WHERE energy_level IS NOT NULL
    `);

    const weeklyMoods = await pool.query(`
      SELECT
        DATE(created_at) as date,
        mood,
        COUNT(*) as count
      FROM moods
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at), mood
      ORDER BY date DESC
    `);

    res.json({
      moodCounts: moodCounts.rows,
      averageEnergy: parseFloat(avgEnergy.rows[0]?.average_energy) || 0,
      weeklyMoods: weeklyMoods.rows,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Create a new mood entry
app.post('/api/moods', async (req, res) => {
  try {
    const { mood, note, energy_level } = req.body;

    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    const result = await pool.query(
      'INSERT INTO moods (mood, note, energy_level) VALUES ($1, $2, $3) RETURNING *',
      [mood, note || null, energy_level || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating mood:', err);
    res.status(500).json({ error: 'Failed to create mood entry' });
  }
});

// Delete a mood entry
app.delete('/api/moods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM moods WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mood not found' });
    }

    res.json({ message: 'Mood deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error('Error deleting mood:', err);
    res.status(500).json({ error: 'Failed to delete mood' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
  await initDb();
});
