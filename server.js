// ============================================================
// J-Pro Light & Sound Rentals — Node.js Backend Server
// ============================================================
// Stack: Node.js + Express.js + Aiven MySQL (Cloud Database)
//
// SETUP:
//   1. npm install express mysql2 cors dotenv bcryptjs jsonwebtoken
//   2. Copy .env.example to .env and fill in your Aiven credentials
//   3. node server.js
//
// The server connects to Aiven MySQL cloud database and exposes
// RESTful API endpoints for the booking & reservation system.
// ============================================================

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'jpro-secret-key-change-in-production';

// ============================================================
// Middleware
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// Aiven MySQL Database Connection Pool
// ============================================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'your-aiven-host.aivencloud.com',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'your-aiven-password',
  database: process.env.DB_NAME || 'jpro_rentals',
  ssl: { rejectUnauthorized: true },
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

// Test database connection
pool.getConnection()
  .then(conn => {
    console.log('✅ Connected to Aiven MySQL Cloud Database');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.log('⚠️  Running in MOCK MODE — using in-memory data');
  });

// ============================================================
// Authentication Middleware
// ============================================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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
        condition ENUM('excellent', 'good', 'fair') DEFAULT 'good',
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

    // Booking Equipment (many-to-many)
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

    // Seed admin user if not exists
    const [adminRows] = await conn.query('SELECT id FROM users WHERE email = ?', ['admin@jpro.com']);
    if (adminRows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await conn.query(
        'INSERT INTO users (id, name, email, password, role, phone, company) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['ADM-001', 'System Administrator', 'admin@jpro.com', hashedPassword, 'admin', '+63 900 000 0000', 'J-Pro Rentals']
      );
      console.log('✅ Admin user seeded (admin@jpro.com / admin123)');
    }

    // Seed equipment if table is empty
    const [eqRows] = await conn.query('SELECT COUNT(*) as count FROM equipment');
    if (eqRows[0].count === 0) {
      const equipmentSeed = [
        ['EQ-001', 'LED Par Can 64', 'lighting', 'High-intensity LED par can with RGBW color mixing.', 45, 250, 24, 30, '🔴', 'excellent'],
        ['EQ-002', 'Moving Head Spot 300W', 'lighting', 'Professional moving head spotlight with gobo wheel.', 120, 700, 8, 12, '🔦', 'excellent'],
        ['EQ-003', 'LED Wash Light 18x15W', 'lighting', 'Full-color LED wash light with zoom.', 85, 500, 16, 20, '💡', 'good'],
        ['EQ-004', 'Strobe Light 3000W', 'lighting', 'High-power strobe light with adjustable flash rate.', 55, 320, 6, 8, '⚡', 'good'],
        ['EQ-005', 'Haze Machine Pro', 'lighting', 'Professional haze machine with timer and remote.', 65, 380, 4, 5, '🌫️', 'excellent'],
        ['EQ-006', 'JBL SRX Line Array', 'sound', 'Professional line array speaker system for large venues.', 350, 2000, 4, 8, '🔊', 'excellent'],
        ['EQ-007', 'QSC KW153 Powered Speaker', 'sound', '15-inch 3-way powered loudspeaker. 1000W.', 95, 550, 12, 16, '📢', 'good'],
        ['EQ-008', 'Allen & Heath SQ-7 Mixer', 'sound', '48-channel digital mixer with 12 stereo mixes.', 200, 1200, 2, 3, '🎛️', 'excellent'],
        ['EQ-009', 'Shure ULX-D Wireless Mic Set', 'sound', 'Digital wireless microphone system with 8 channels.', 150, 900, 6, 10, '🎤', 'excellent'],
        ['EQ-010', 'Subwoofer QSC KS118', 'sound', '18-inch powered subwoofer. 3600W peak power.', 110, 650, 6, 8, '🔉', 'good'],
        ['EQ-011', 'Stage Platform 4x8', 'staging', 'Modular stage platform with adjustable height.', 40, 220, 30, 50, '🎪', 'good'],
        ['EQ-012', 'Pipe & Drape Kit', 'staging', 'Complete pipe and drape system with uprights.', 75, 420, 10, 15, '🎭', 'good'],
        ['EQ-013', 'DMX Controller GrandMA2', 'accessories', 'Professional lighting console for DMX programming.', 250, 1500, 1, 2, '🎮', 'excellent'],
        ['EQ-014', 'Power Distribution Box', 'accessories', '200A power distribution with multiple outputs.', 80, 450, 5, 6, '🔌', 'good'],
        ['EQ-015', 'LED Video Wall Panel P3', 'lighting', 'Indoor LED video wall panel with P3 pixel pitch.', 180, 1050, 20, 40, '📺', 'excellent'],
      ];

      for (const eq of equipmentSeed) {
        await conn.query(
          'INSERT INTO equipment (id, name, category, description, daily_rate, weekly_rate, available, total, image, `condition`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          eq
        );
      }
      console.log('✅ Equipment catalog seeded (15 items)');
    }

    conn.release();
    console.log('✅ Database schema initialized');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
  }
}

// ============================================================
// AUTH ROUTES
// ============================================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    conn.release();

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        company: user.company,
        address: user.address,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, company, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const conn = await pool.getConnection();

    // Check if email already exists
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      conn.release();
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = `CUS-${Date.now().toString().slice(-6)}`;

    await conn.query(
      'INSERT INTO users (id, name, email, password, role, phone, company, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, 'customer', phone || null, company || null, address || null]
    );
    conn.release();

    const token = jwt.sign(
      { id, email, role: 'customer', name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id, name, email, role: 'customer', phone, company, address },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/auth/me — Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT id, name, email, role, phone, company, address, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ============================================================
// EQUIPMENT ROUTES
// ============================================================

// GET /api/equipment — List all equipment
app.get('/api/equipment', async (req, res) => {
  try {
    const { category, search } = req.query;
    const conn = await pool.getConnection();

    let query = 'SELECT * FROM equipment WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY category, name';

    const [rows] = await conn.query(query, params);
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/equipment/:id — Get single equipment
app.get('/api/equipment/:id', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM equipment WHERE id = ?', [req.params.id]);
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// POST /api/equipment — Add new equipment (admin only)
app.post('/api/equipment', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, name, category, description, daily_rate, weekly_rate, available, total, image, condition } = req.body;

    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO equipment (id, name, category, description, daily_rate, weekly_rate, available, total, image, `condition`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, category, description, daily_rate, weekly_rate, available, total, image || '📦', condition || 'good']
    );
    conn.release();

    res.status(201).json({ message: 'Equipment added successfully.', id });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// PUT /api/equipment/:id — Update equipment (admin only)
app.put('/api/equipment/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, category, description, daily_rate, weekly_rate, available, total, condition } = req.body;

    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE equipment SET name=?, category=?, description=?, daily_rate=?, weekly_rate=?, available=?, total=?, `condition`=? WHERE id=?',
      [name, category, description, daily_rate, weekly_rate, available, total, condition, req.params.id]
    );
    conn.release();

    res.json({ message: 'Equipment updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// DELETE /api/equipment/:id — Delete equipment (admin only)
app.delete('/api/equipment/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM equipment WHERE id = ?', [req.params.id]);
    conn.release();

    res.json({ message: 'Equipment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ============================================================
// BOOKING ROUTES
// ============================================================

// GET /api/bookings — List bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    let query = 'SELECT * FROM bookings';
    const params = [];

    // Customers can only see their own bookings
    if (req.user.role === 'customer') {
      query += ' WHERE customer_id = ?';
      params.push(req.user.id);
    } else if (req.query.status) {
      query += ' WHERE status = ?';
      params.push(req.query.status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await conn.query(query, params);

    // Fetch equipment for each booking
    for (const booking of rows) {
      const [eqRows] = await conn.query(
        `SELECT e.id, e.name, e.image, be.quantity
         FROM booking_equipment be
         JOIN equipment e ON be.equipment_id = e.id
         WHERE be.booking_id = ?`,
        [booking.id]
      );
      booking.equipment = eqRows;
    }

    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/bookings/:id — Get single booking
app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const booking = rows[0];

    // Check customer can only access own booking
    if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
      conn.release();
      return res.status(403).json({ error: 'Access denied.' });
    }

    const [eqRows] = await conn.query(
      `SELECT e.id, e.name, e.image, e.daily_rate, e.weekly_rate, be.quantity
       FROM booking_equipment be
       JOIN equipment e ON be.equipment_id = e.id
       WHERE be.booking_id = ?`,
      [booking.id]
    );
    booking.equipment = eqRows;

    conn.release();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// POST /api/bookings — Create new booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { equipment_ids, start_date, end_date, event_type, venue, notes } = req.body;

    if (!equipment_ids || !start_date || !end_date || !event_type || !venue) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const conn = await pool.getConnection();

    // Fetch customer info
    const [userRows] = await conn.query('SELECT id, name FROM users WHERE id = ?', [req.user.id]);
    if (userRows.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'User not found.' });
    }

    // Calculate total cost
    let totalCost = 0;
    const days = Math.max(1, Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)) + 1);

    for (const eqId of equipment_ids) {
      const [eqRows] = await conn.query('SELECT daily_rate, weekly_rate, available FROM equipment WHERE id = ?', [eqId]);
      if (eqRows.length === 0) {
        conn.release();
        return res.status(404).json({ error: `Equipment ${eqId} not found.` });
      }
      if (eqRows[0].available <= 0) {
        conn.release();
        return res.status(400).json({ error: `Equipment ${eqId} is not available.` });
      }

      const eq = eqRows[0];
      if (days >= 7) {
        totalCost += eq.weekly_rate * Math.floor(days / 7) + eq.daily_rate * (days % 7);
      } else {
        totalCost += eq.daily_rate * days;
      }
    }

    const bookingId = `BK-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const deposit = Math.round(totalCost * 0.5);

    // Insert booking
    await conn.query(
      'INSERT INTO bookings (id, customer_id, customer_name, start_date, end_date, status, total_cost, deposit, notes, event_type, venue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [bookingId, req.user.id, userRows[0].name, start_date, end_date, 'pending', totalCost, deposit, notes || '', event_type, venue]
    );

    // Insert booking-equipment relationships & decrement availability
    for (const eqId of equipment_ids) {
      await conn.query(
        'INSERT INTO booking_equipment (booking_id, equipment_id) VALUES (?, ?)',
        [bookingId, eqId]
      );
      await conn.query(
        'UPDATE equipment SET available = available - 1 WHERE id = ? AND available > 0',
        [eqId]
      );
    }

    conn.release();

    res.status(201).json({
      message: 'Booking created successfully.',
      booking: {
        id: bookingId,
        total_cost: totalCost,
        deposit,
        days,
        status: 'pending',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// PUT /api/bookings/:id/status — Update booking status (admin only)
app.put('/api/bookings/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const conn = await pool.getConnection();

    // Get current booking
    const [bookingRows] = await conn.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (bookingRows.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const currentStatus = bookingRows[0].status;

    // Update status
    await conn.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);

    // If completed or cancelled, restore equipment availability
    if ((status === 'completed' || status === 'cancelled') && currentStatus !== 'completed' && currentStatus !== 'cancelled') {
      await conn.query(
        `UPDATE equipment SET available = available + 1
         WHERE id IN (SELECT equipment_id FROM booking_equipment WHERE booking_id = ?)`,
        [req.params.id]
      );
    }

    conn.release();
    res.json({ message: `Booking status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// DELETE /api/bookings/:id — Cancel/delete booking
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const [bookingRows] = await conn.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (bookingRows.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Customers can only cancel their own pending bookings
    if (req.user.role === 'customer') {
      if (bookingRows[0].customer_id !== req.user.id) {
        conn.release();
        return res.status(403).json({ error: 'Access denied.' });
      }
      if (bookingRows[0].status !== 'pending') {
        conn.release();
        return res.status(400).json({ error: 'Only pending bookings can be cancelled.' });
      }
    }

    // Restore equipment availability
    if (bookingRows[0].status !== 'completed' && bookingRows[0].status !== 'cancelled') {
      await conn.query(
        `UPDATE equipment SET available = available + 1
         WHERE id IN (SELECT equipment_id FROM booking_equipment WHERE booking_id = ?)`,
        [req.params.id]
      );
    }

    await conn.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
    conn.release();

    res.json({ message: 'Booking cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ============================================================
// CUSTOMER / USER ROUTES
// ============================================================

// GET /api/customers — List all customers (admin only)
app.get('/api/customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT id, name, email, phone, company, address, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
      ['customer']
    );
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/customers/:id — Get customer details (admin only)
app.get('/api/customers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT id, name, email, phone, company, address, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    // Get customer's bookings
    const [bookings] = await conn.query(
      'SELECT * FROM bookings WHERE customer_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json({ ...rows[0], bookings });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ============================================================
// DASHBOARD STATS ROUTE
// ============================================================

// GET /api/dashboard/stats — Get dashboard statistics (admin only)
app.get('/api/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const [totalBookings] = await conn.query('SELECT COUNT(*) as count FROM bookings');
    const [activeRentals] = await conn.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'active'");
    const [pendingBookings] = await conn.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");
    const [completedBookings] = await conn.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'");
    const [revenue] = await conn.query("SELECT COALESCE(SUM(total_cost), 0) as total FROM bookings WHERE status != 'cancelled'");
    const [availableEquipment] = await conn.query('SELECT COALESCE(SUM(available), 0) as total FROM equipment');

    conn.release();

    res.json({
      totalBookings: totalBookings[0].count,
      activeRentals: activeRentals[0].count,
      totalRevenue: revenue[0].total,
      availableEquipment: availableEquipment[0].total,
      pendingBookings: pendingBookings[0].count,
      completedBookings: completedBookings[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error: ' + err.message;
  }

  res.json({
    status: 'ok',
    service: 'J-Pro Light & Sound Rentals API',
    version: '2.1.0',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// 404 Handler
// ============================================================
app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ============================================================
// Global Error Handler
// ============================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ============================================================
// Start Server
// ============================================================
app.listen(PORT, async () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   J-Pro Light & Sound Rentals API Server     ║');
  console.log('║   Node.js + Express + Aiven MySQL            ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║   Server running on port ${PORT}               ║`);
  console.log(`║   API endpoint: http://localhost:${PORT}/api    ║`);
  console.log('║   Health check: http://localhost:' + PORT + '/api/health ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  // Initialize database schema
  await initDatabase();
});
