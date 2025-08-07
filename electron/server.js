const path = require('path');
const express = require('express');
const sqlite3 = require('better-sqlite3');
const { app: electronApp } = require('electron');

function startBackend() {
  const dbPath = path.join(electronApp.getPath('userData'), 'craftcrm.db');
  const db = new sqlite3(dbPath);
  
  // Create tables
  db.exec(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_name TEXT,
    amount REAL,
    created_at TEXT
  )`);

  // Create trial and subscription tables
  db.exec(`CREATE TABLE IF NOT EXISTS trial_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS subscription_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_type TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  const server = express();
  server.use(express.json());

  server.get('/api/transactions', (_req, res) => {
    const rows = db.prepare('SELECT * FROM transactions ORDER BY id DESC').all();
    res.json(rows);
  });

  server.post('/api/transactions', (req, res) => {
    const { party_name, amount } = req.body;
    const stmt = db.prepare('INSERT INTO transactions (party_name, amount, created_at) VALUES (?, ?, ?)');
    const result = stmt.run(party_name, amount, new Date().toISOString());
    res.json({ id: result.lastInsertRowid });
  });

  // Trial management endpoints
  server.get('/api/trial', (_req, res) => {
    try {
      const row = db.prepare('SELECT * FROM trial_data ORDER BY id DESC LIMIT 1').get();
      res.json(row || null);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  server.post('/api/trial', (req, res) => {
    try {
      const { start_date, end_date, hash } = req.body;
      const stmt = db.prepare('INSERT INTO trial_data (start_date, end_date, hash) VALUES (?, ?, ?)');
      const result = stmt.run(start_date, end_date, hash);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Subscription management endpoints
  server.get('/api/subscription', (_req, res) => {
    try {
      const row = db.prepare('SELECT * FROM subscription_data WHERE is_active = 1 ORDER BY id DESC LIMIT 1').get();
      res.json(row || null);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  server.post('/api/subscription', (req, res) => {
    try {
      const { plan_type, start_date, end_date, hash } = req.body;
      
      // Deactivate existing subscriptions
      db.prepare('UPDATE subscription_data SET is_active = 0').run();
      
      // Add new subscription
      const stmt = db.prepare('INSERT INTO subscription_data (plan_type, start_date, end_date, hash) VALUES (?, ?, ?, ?)');
      const result = stmt.run(plan_type, start_date, end_date, hash);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  server.listen(4000, () => {
    console.log('Local API server running at http://localhost:4000');
  });
}

module.exports = { startBackend };
