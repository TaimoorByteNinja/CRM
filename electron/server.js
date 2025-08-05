const path = require('path');
const express = require('express');
const sqlite3 = require('better-sqlite3');
const { app: electronApp } = require('electron');

function startBackend() {
  const dbPath = path.join(electronApp.getPath('userData'), 'businesshub.db');
  const db = new sqlite3(dbPath);
  db.exec(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_name TEXT,
    amount REAL,
    created_at TEXT
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

  server.listen(4000, () => {
    console.log('Local API server running at http://localhost:4000');
  });
}

module.exports = { startBackend };
