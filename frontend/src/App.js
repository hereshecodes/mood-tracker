import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: '#22c55e' },
  { id: 'excited', emoji: '🤩', label: 'Excited', color: '#f59e0b' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: '#60a5fa' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: '#8b5cf6' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: '#f97316' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: '#3b82f6' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: '#ef4444' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', color: '#6b7280' },
];

function App() {
  const [activeTab, setActiveTab] = useState('log');
  const [moods, setMoods] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMoods();
    fetchStats();
  }, []);

  const fetchMoods = async () => {
    try {
      const res = await fetch(`${API_URL}/api/moods`);
      const data = await res.json();
      setMoods(data);
    } catch (err) {
      console.error('Failed to fetch moods:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/moods/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/moods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          energy_level: energyLevel,
          note: note.trim() || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to save mood');

      setSelectedMood(null);
      setEnergyLevel(3);
      setNote('');
      fetchMoods();
      fetchStats();
    } catch (err) {
      setError('Failed to save mood. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/moods/${id}`, { method: 'DELETE' });
      fetchMoods();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete mood:', err);
    }
  };

  const getMoodData = (moodId) => MOODS.find((m) => m.id === moodId) || { emoji: '❓', label: moodId };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const pieData = stats?.moodCounts?.map((item) => ({
    name: getMoodData(item.mood).label,
    value: parseInt(item.count),
    color: getMoodData(item.mood).color,
  })) || [];

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: 32, marginTop: 20 }}>
        Mood Tracker
      </h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          Log Mood
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {activeTab === 'log' && (
        <div className="card">
          <h2>How are you feeling?</h2>
          <div className="mood-grid">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                className={`mood-btn ${selectedMood === mood.id ? 'selected' : ''}`}
                onClick={() => setSelectedMood(mood.id)}
              >
                <span className="emoji">{mood.emoji}</span>
                <span className="label">{mood.label}</span>
              </button>
            ))}
          </div>

          <div className="energy-slider">
            <label>
              Energy Level: {energyLevel}/5
              <input
                type="range"
                min="1"
                max="5"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              />
            </label>
          </div>

          <textarea
            className="note-input"
            placeholder="Add a note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!selectedMood || loading}
          >
            {loading ? 'Saving...' : 'Save Mood'}
          </button>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h2>Recent Moods</h2>
          {moods.length === 0 ? (
            <p className="loading">No moods logged yet. Start tracking!</p>
          ) : (
            <ul className="history-list">
              {moods.slice(0, 20).map((mood) => {
                const moodData = getMoodData(mood.mood);
                return (
                  <li key={mood.id} className="history-item">
                    <span className="emoji">{moodData.emoji}</span>
                    <div className="details">
                      <div className="mood-name">{moodData.label}</div>
                      {mood.note && <div className="note">{mood.note}</div>}
                    </div>
                    <div className="meta">
                      <div>Energy: {mood.energy_level}/5</div>
                      <div>{formatDate(mood.created_at)}</div>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(mood.id)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{moods.length}</div>
              <div className="stat-label">Total Entries</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {stats?.averageEnergy?.toFixed(1) || '—'}
              </div>
              <div className="stat-label">Avg Energy</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {stats?.moodCounts?.[0]
                  ? getMoodData(stats.moodCounts[0].mood).emoji
                  : '—'}
              </div>
              <div className="stat-label">Most Common</div>
            </div>
          </div>

          <div className="card">
            <h3>Mood Distribution</h3>
            {pieData.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="loading">No data yet</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
