# J-Pro Light & Sound Rentals — Booking & Reservation System

A complete full-stack booking and reservation system for professional event equipment rentals.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Admin UI   │  │ Customer UI  │  │ Login System │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API (HTTP/JSON)
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              BACKEND (Node.js + Express.js)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Routes  │  │Booking Routes│  │Equipment API │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ JWT Security │  │  Middleware  │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────┬───────────────────────────────────┘
                          │ MySQL Protocol (SSL)
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              DATABASE (Aiven MySQL Cloud)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  users   │  │bookings  │  │equipment │  │booking_  │   │
│  │  table   │  │  table   │  │  table   │  │equipment │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Aiven account (free tier available at https://aiven.io)

### 1. Setup Aiven MySQL Database

1. Sign up at [Aiven Console](https://console.aiven.io)
2. Create a new MySQL service (free plan available)
3. Create a database named `jpro_rentals`
4. Note your connection details (host, port, user, password)

### 2. Install Backend Dependencies

```bash
# Install backend packages
npm install express mysql2 cors dotenv bcryptjs jsonwebtoken

# Or use the provided package file
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your Aiven credentials
nano .env
```

Update these values in `.env`:
```env
DB_HOST=your-project.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your-actual-password
DB_NAME=jpro_rentals
JWT_SECRET=generate-a-secure-random-string
```

### 4. Start the Backend Server

```bash
node server.js
```

You should see:
```
╔══════════════════════════════════════════════╗
║   J-Pro Light & Sound Rentals API Server     ║
║   Node.js + Express + Aiven MySQL            ║
╠══════════════════════════════════════════════╣
║   Server running on port 3000                ║
║   API endpoint: http://localhost:3000/api    ║
║   Health check: http://localhost:3000/api/health ║
╚══════════════════════════════════════════════╝

✅ Connected to Aiven MySQL Cloud Database
✅ Database schema initialized
✅ Admin user seeded (admin@jpro.com / admin123)
✅ Equipment catalog seeded (15 items)
```

### 5. Start the Frontend (Development)

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 6. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## 🔐 Authentication

### Demo Credentials

**Admin Access:**
- Email: `admin@jpro.com`
- Password: `admin123`

**Customer Access:**
- Email: `maria@santosweddings.com`
- Password: `customer123`

All 5 demo customers use password: `customer123`

### JWT Token Flow

1. Client sends credentials to `POST /api/auth/login`
2. Server validates against Aiven MySQL database
3. Server returns JWT token (24-hour expiry)
4. Client includes token in `Authorization: Bearer <token>` header
5. Server validates token on each request

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` — Login (admin or customer)
- `POST /api/auth/register` — Register new customer
- `GET /api/auth/me` — Get current user profile

### Equipment
- `GET /api/equipment` — List all equipment
- `GET /api/equipment/:id` — Get single equipment
- `POST /api/equipment` — Add equipment (admin only)
- `PUT /api/equipment/:id` — Update equipment (admin only)
- `DELETE /api/equipment/:id` — Delete equipment (admin only)

### Bookings
- `GET /api/bookings` — List bookings (admin: all, customer: own)
- `GET /api/bookings/:id` — Get booking details
- `POST /api/bookings` — Create new booking
- `PUT /api/bookings/:id/status` — Update status (admin only)
- `DELETE /api/bookings/:id` — Cancel booking

### Customers
- `GET /api/customers` — List all customers (admin only)
- `GET /api/customers/:id` — Get customer details (admin only)

### Dashboard
- `GET /api/dashboard/stats` — Get system statistics (admin only)

### Health
- `GET /api/health` — Check server and database status

## 🗄️ Database Schema

### users
```sql
- id (VARCHAR, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- role (ENUM: admin, customer)
- phone (VARCHAR)
- company (VARCHAR)
- address (TEXT)
- created_at (TIMESTAMP)
```

### equipment
```sql
- id (VARCHAR, PK)
- name (VARCHAR)
- category (ENUM: lighting, sound, staging, accessories)
- description (TEXT)
- daily_rate (DECIMAL)
- weekly_rate (DECIMAL)
- available (INT)
- total (INT)
- image (VARCHAR)
- condition (ENUM: excellent, good, fair)
```

### bookings
```sql
- id (VARCHAR, PK)
- customer_id (VARCHAR, FK → users)
- customer_name (VARCHAR)
- start_date (DATE)
- end_date (DATE)
- status (ENUM: pending, confirmed, active, completed, cancelled)
- total_cost (DECIMAL)
- deposit (DECIMAL)
- notes (TEXT)
- event_type (VARCHAR)
- venue (VARCHAR)
- created_at (TIMESTAMP)
```

### booking_equipment
```sql
- id (INT, PK, AUTO_INCREMENT)
- booking_id (VARCHAR, FK → bookings)
- equipment_id (VARCHAR, FK → equipment)
- quantity (INT)
```

## 🎯 Features

### Admin Panel
- ✅ Full system dashboard with statistics
- ✅ Equipment catalog management (CRUD)
- ✅ View and manage all bookings
- ✅ Update booking status workflow
- ✅ Customer database management
- ✅ Revenue tracking

### Customer Portal
- ✅ Personal dashboard with booking history
- ✅ Browse equipment catalog
- ✅ Create new bookings
- ✅ Track booking status
- ✅ View booking details
- ✅ Cancel pending bookings

### Security
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ SQL injection protection (parameterized queries)
- ✅ SSL/TLS database connection
- ✅ CORS configuration

## 📦 Equipment Inventory

**Lighting (6 items):**
- LED Par Can 64 — ₱45/day
- Moving Head Spot 300W — ₱120/day
- LED Wash Light 18x15W — ₱85/day
- Strobe Light 3000W — ₱55/day
- Haze Machine Pro — ₱65/day
- LED Video Wall Panel P3 — ₱180/day

**Sound (5 items):**
- JBL SRX Line Array — ₱350/day
- QSC KW153 Powered Speaker — ₱95/day
- Allen & Heath SQ-7 Mixer — ₱200/day
- Shure ULX-D Wireless Mic Set — ₱150/day
- Subwoofer QSC KS118 — ₱110/day

**Staging (2 items):**
- Stage Platform 4x8 — ₱40/day
- Pipe & Drape Kit — ₱75/day

**Accessories (2 items):**
- DMX Controller GrandMA2 — ₱250/day
- Power Distribution Box — ₱80/day

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite 7
- Tailwind CSS 4
- Lucide React (icons)
- TypeScript

### Backend
- Node.js
- Express.js 4
- MySQL2 (driver)
- JSON Web Tokens (JWT)
- bcryptjs (password hashing)
- dotenv (environment variables)

### Database
- Aiven MySQL (Cloud)
- SSL/TLS encrypted connections
- Automatic connection pooling

## 📝 Development Notes

### Adding New API Endpoints

```javascript
// Example: Add a new route
app.get('/api/reports/monthly', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_cost) as revenue
      FROM bookings
      WHERE status != 'cancelled'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### Testing API with cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jpro.com","password":"admin123"}'

# Get equipment (with token)
curl http://localhost:3000/api/equipment \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "equipment_ids": ["EQ-001", "EQ-006"],
    "start_date": "2025-07-15",
    "end_date": "2025-07-16",
    "event_type": "Wedding",
    "venue": "Shangri-La Hotel",
    "notes": "Need setup by 2PM"
  }'
```

## 🚢 Deployment

### Backend Deployment (Aiven + Railway/Render)

1. Push code to GitHub
2. Connect to Railway or Render
3. Set environment variables in dashboard
4. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set API base URL in environment

## 📄 License

© 2025 J-Pro Light & Sound Rentals. All rights reserved.

## 🤝 Support

For technical support or questions:
- Email: support@jpro.com
- Phone: +63 900 000 0000
- Website: https://jpro.com

---

**Built with ❤️ for the Philippine events industry**
