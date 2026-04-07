const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// MySQL connection pool — supports Railway's MYSQL_URL or individual env vars
function createPool() {
  const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

  if (dbUrl) {
    // Railway provides a connection URL like: mysql://user:pass@host:port/dbname
    console.log('🔗 Using MYSQL_URL connection string');
    return mysql.createPool(dbUrl);
  }

  // Fallback to individual environment variables (local development)
  console.log('🔗 Using individual DB env vars (local mode)');
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

const pool = createPool();

// Auto-create the contact_messages table if it doesn't exist
async function initializeDatabase() {
  try {
    const conn = await pool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database table ready');
    conn.release();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
}

// Test database connection
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
  }
}

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid email address'
    });
  }

  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    );
    conn.release();

    console.log(`📧 New contact message from ${name} (${email})`);

    res.json({
      success: true,
      message: 'Message sent successfully!',
      id: result.insertId
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save message. Please try again.'
    });
  }
});

// Get all contact messages (for admin)
app.get('/api/contact', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    conn.release();

    res.json({ success: true, messages: rows });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    conn.release();
    res.json({ status: 'OK', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.json({ status: 'OK', database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// Start server — bind to 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await testConnection();
  await initializeDatabase();
});