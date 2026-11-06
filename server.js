// RentHome Bali — локальный сервер (Node.js + Express + MySQL)
// Запуск: node server.js
// Переменные окружения (.env): MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, ADMIN_TOKEN

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123'; // смените в .env

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'rentalbali',
  connectionLimit: 5,
  charset: 'utf8mb4',
});

// Проверка админ-токена
function adminOnly(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers['authorization'] || '';
  const clean = token.replace(/^Bearer\s+/, '');
  if (!clean || clean !== ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: 'admin token required' });
  }
  next();
}

// ============ LISTINGS ============
app.get('/api/listings', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM listings WHERE status='published' ORDER BY created_at DESC LIMIT 200"
    );
    res.json({ ok: true, items: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) });
  }
});

app.post('/api/listings', adminOnly, async (req, res) => {
  try {
    const b = req.body || {};
    const poolq = pool;
    await poolq.query(
      `INSERT INTO listings
        (title, deal_type, role, property_type, district, location, address, price, price_min, currency, category,
         bedrooms, bathrooms, area, land_area, floors, year_built, furnished, tenure, lease_years, available,
         geo_lat, geo_lng, geo_acc, amenities, images, \`desc\`, parties, status, code, mine, \`user\`, owner,
         ai, agent_name, is_verified, is_agent, is_top, is_urgent, legal, rating, reviews, move_in, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
      [
        b.title || '', b.dealType || 'rent', b.role || 'offer', b.propertyType || 'villa',
        b.district || '', b.location || '', b.address || '', b.price || 0, b.priceMin || 0,
        b.currency || 'IDR', b.category || 'monthly', b.bedrooms || 0, b.bathrooms || 0,
        b.area || 0, b.landArea || 0, b.floors || 0, b.yearBuilt || 0, b.furnished !== false ? 1 : 0,
        b.tenure || 'freehold', b.leaseYears || 0, b.available || null,
        b.lat || null, b.lng || null, b.geoAcc || 'exact',
        JSON.stringify(b.amenities || []), JSON.stringify(b.images || []), b.desc || '',
        JSON.stringify(b.parties || []), b.status || 'draft', b.code || ('OBJ' + Date.now()),
        1, 1, b.owner || 'admin', b.ai ? 1 : 0, b.agentName || '', b.isVerified ? 1 : 0,
        b.isAgent ? 1 : 0, b.isTop ? 1 : 0, b.isUrgent ? 1 : 0, b.legal ? 1 : 0,
        b.rating || 0, b.reviews || 0, b.moveIn || null
      ]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) });
  }
});

// ============ PROFILES ============
app.get('/api/profiles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM profiles ORDER BY created_at DESC LIMIT 200');
    res.json({ ok: true, items: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) });
  }
});

app.get('/api/profiles/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM profiles WHERE id=? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ ok: false, error: 'not found' });
    res.json({ ok: true, profile: rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) });
  }
});

app.post('/api/profiles', adminOnly, async (req, res) => {
  try {
    const b = req.body || {};
    const id = b.id || ('u' + Date.now());
    await pool.query(
      `INSERT INTO profiles (id, name, username, email, phone, city, role, bio, public, avatar, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,NOW(),NOW())
       ON DUPLICATE KEY UPDATE name=VALUES(name), updated_at=NOW()`,
      [id, b.name || '', b.username || null, b.email || null, b.phone || null,
       b.city || null, b.role || 'owner', b.bio || null, b.public ? 1 : 0, b.avatar || null]
    );
    res.json({ ok: true, id });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) });
  }
});

// ============ CONTRACTS ============
app.get('/api/contracts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contracts ORDER BY created_at DESC LIMIT 200');
    res.json({ ok: true, items: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) });
  }
});

app.post('/api/contracts', adminOnly, async (req, res) => {
  try {
    const b = req.body || {};
    const id = b.id || ('c' + Date.now());
    await pool.query(
      `INSERT INTO contracts (id, parties, projects, status, created_at)
       VALUES (?,?,?,?,NOW())
       ON DUPLICATE KEY UPDATE parties=VALUES(parties), projects=VALUES(projects), status=VALUES(status)`,
      [id, JSON.stringify(b.parties || []), JSON.stringify(b.projects || []), b.status || 'pending']
    );
    res.json({ ok: true, id });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) });
  }
});

// ============ FAVORITES ============
app.get('/api/favorites', async (req, res) => {
  try {
    const user = req.query.user;
    if (!user) return res.status(400).json({ ok: false, error: 'user required' });
    const [rows] = await pool.query(
      `SELECT l.* FROM favorites f JOIN listings l ON l.id=f.listing_id WHERE f.user_id=? ORDER BY f.created_at DESC`,
      [user]
    );
    res.json({ ok: true, items: rows, count: rows.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) });
  }
});

app.post('/api/favorites', adminOnly, async (req, res) => {
  try {
    const b = req.body || {};
    await pool.query('INSERT IGNORE INTO favorites (user_id, listing_id) VALUES (?,?)',
      [b.userId || '', b.listingId || 0]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) });
  }
});

app.listen(PORT, () => {
  console.log(`RentHome Bali API listening on http://localhost:${PORT}`);
  console.log(`ADMIN_TOKEN=${ADMIN_TOKEN}`);
});
