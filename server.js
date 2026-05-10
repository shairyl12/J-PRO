// ============================================================
// J-Pro Light & Sound Rentals — Node.js Backend Server
// ============================================================
// Updated for ES Modules + Static File Serving
// ============================================================

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'jpro-secret-key-change-in-production';

// ============================================================
// Middleware
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, Images) from the root directory
app.use(express.static(__dirname));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// Aiven MySQL Database Connection Pool
// ============================================================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true },
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

// ============================================================
// Authentication Middleware
// ============================================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

// ============================================================
// Database Schema Initialization
// ============================================================
async function initDatabase() {
  try {
    const conn = await pool.getConnection();

    // Users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'customer') DEFAULT 'customer',
        phone VARCHAR(20),
        company VARCHAR(100),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Equipment table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category ENUM('lighting', 'sound', 'staging', 'accessories') NOT NULL,
        description TEXT,
        daily_rate DECIMAL(10,2) NOT NULL,
        weekly_rate DECIMAL(10,2) NOT NULL,
        available INT DEFAULT 0,
        total INT DEFAULT 0,
        image VARCHAR(10),
        \`condition\` ENUM('excellent', 'good', 'fair') DEFAULT 'good',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(20) PRIMARY KEY,
        customer_id VARCHAR(20) NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') DEFAULT 'pending',
        total_cost DECIMAL(12,2) NOT NULL,
        deposit DECIMAL(12,2) NOT NULL,
        notes TEXT,
        event_type VARCHAR(50),
        venue VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Booking Equipment table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS booking_equipment (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id VARCHAR(20) NOT NULL,
        equipment_id VARCHAR(20) NOT NULL,
        quantity INT DEFAULT 1,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
      )
    `);

    // Seed admin
    const [adminRows] = await conn.query('SELECT id FROM users WHERE email = ?', ['admin@jpro.com']);
    if (adminRows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await conn.query(
        'INSERT INTO users (id, name, email, password, role, phone, company) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['ADM-001', 'System Administrator', 'admin@jpro.com', hashedPassword, 'admin', '+63 900 000 0000', 'J-Pro Rentals']
      );
      console.log('✅ Admin user seeded');
    }

    conn.release();
    console.log('✅ Database schema initialized');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
  }
}

// ============================================================
// FRONTEND ROUTE
// ============================================================

// FIX: Serves index.html when visiting the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================
// AUTH ROUTES
// ============================================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, company, address } = req.body;
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = `CUS-${Date.now().toString().slice(-6)}`;
    await pool.query('INSERT INTO users (id, name, email, password, role, phone, company, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
    [id, name, email, hashedPassword, 'customer', phone, company, address]);

    const token = jwt.sign({ id, email, role: 'customer', name }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id, name, email, role: 'customer' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// EQUIPMENT & BOOKING ROUTES
// ============================================================

app.get('/api/equipment', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipment ORDER BY category, name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
    // Your existing booking logic...
    res.status(201).json({ message: "Feature active" });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'J-Pro API' }));

// ============================================================
// Start Server
// ============================================================
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initDatabase();
});
