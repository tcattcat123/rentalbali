// RentHome Bali — сервер приложения (Node.js + Express + MySQL)
// Запуск: node server.js
//
// Переменные окружения (.env рядом с server.js):
//   PORT            — порт HTTP (по умолчанию 3000)
//   MYSQL_HOST      — хост MySQL (обязательно)
//   MYSQL_PORT      — порт MySQL (по умолчанию 3306)
//   MYSQL_USER      — пользователь MySQL (обязательно)
//   MYSQL_PASSWORD  — пароль MySQL
//   MYSQL_DATABASE  — имя базы (по умолчанию rentalbali)
//   MYSQL_SSL       — true, если хостинг требует TLS
//   ADMIN_TOKEN     — токен админ-публикации (обязательно)

require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

// ---------- Проверка конфигурации: без неё сервер не имеет смысла ----------
const REQUIRED = ['MYSQL_HOST', 'MYSQL_USER', 'ADMIN_TOKEN'];
const missing = REQUIRED.filter((k) => !String(process.env[k] || '').trim());
if (missing.length) {
  console.error('\n[CONFIG] Не заданы переменные окружения: ' + missing.join(', '));
  console.error('[CONFIG] Создайте файл .env рядом с server.js (шаблон — .env.example).');
  console.error('[CONFIG] База должна быть на удалённом сервере, укажите его MYSQL_HOST/USER/PASSWORD.\n');
  process.exit(1);
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const DB_NAME = process.env.MYSQL_DATABASE || 'rentalbali';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD || '',
  database: DB_NAME,
  connectionLimit: 5,
  charset: 'utf8mb4',
  waitForConnections: true,
  enableKeepAlive: true,
  ssl: String(process.env.MYSQL_SSL || '').toLowerCase() === 'true' ? { rejectUnauthorized: false } : undefined,
});

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use('/api', optionalAuth);

// ---------- Авторизация: админ + аккаунты пользователей ----------
const SESSION_DAYS = 365;

function adminOnly(req, res, next) {
  const raw = req.headers['x-admin-token'] || req.headers['authorization'] || '';
  const token = String(raw).replace(/^Bearer\s+/i, '').trim();
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: 'admin token required' });
  }
  next();
}

function bearer(req) {
  const raw = req.headers['authorization'] || req.headers['x-admin-token'] || '';
  return String(raw).replace(/^Bearer\s+/i, '').trim();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [algo, salt, hash] = String(stored || '').split('$');
    if (algo !== 'scrypt' || !salt || !hash) return false;
    const calc = crypto.scryptSync(String(password), salt, 64);
    const known = Buffer.from(hash, 'hex');
    return known.length === calc.length && crypto.timingSafeEqual(known, calc);
  } catch (_) {
    return false;
  }
}

const profileIdFor = (accountId) => 'u' + accountId;

async function resolveAuth(req) {
  const token = bearer(req);
  if (!token) return null;
  if (token === ADMIN_TOKEN) return { admin: true, account: null, token };
  const [rows] = await pool.query(
    `SELECT a.id, a.login, a.name, a.profile_id, s.expires_at,
            DATEDIFF(s.expires_at, NOW()) AS days_left
       FROM sessions s JOIN accounts a ON a.id = s.account_id
      WHERE s.token = ? AND s.expires_at > NOW() LIMIT 1`,
    [token]
  );
  if (!rows.length) return null;
  const a = rows[0];
  // Скользящая сессия: продлеваем, когда осталось меньше 300 дней.
  if (Number(a.days_left) < SESSION_DAYS - 65) {
    await pool.query('UPDATE sessions SET expires_at = DATE_ADD(NOW(), INTERVAL ? DAY) WHERE token = ?', [
      SESSION_DAYS,
      token,
    ]);
  }
  return {
    admin: false,
    account: { id: a.id, login: a.login, name: a.name, profileId: a.profile_id },
    token,
  };
}

async function optionalAuth(req, res, next) {
  try {
    req.auth = await resolveAuth(req);
  } catch (_) {
    req.auth = null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.auth) return res.status(401).json({ ok: false, error: 'auth required' });
  next();
}

const int = (v, d = 0) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};
const num = (v, d = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
};
const bool = (v) => (v === true || v === 1 || v === '1' || v === 'true' ? 1 : 0);
const jsonArr = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p : [];
    } catch (_) {}
  }
  return [];
};
function toDate(v) {
  if (!v) return null;
  const s = String(v).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

// ---------- Преобразование строки MySQL в объект фронтенда ----------
function rowToListing(r) {
  return {
    id: r.id,
    title: r.title,
    type: r.role,
    role: r.role,
    dealType: r.deal_type,
    propertyType: r.property_type,
    district: r.district,
    location: r.location,
    locationEn: r.district,
    address: r.address,
    price: Number(r.price || 0),
    priceMin: Number(r.price_min || 0),
    currency: r.currency,
    category: r.category,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    area: Number(r.area || 0),
    landArea: Number(r.land_area || 0),
    floors: r.floors,
    yearBuilt: r.year_built,
    furnished: !!r.furnished,
    tenure: r.tenure,
    leaseYears: r.lease_years,
    available: r.available,
    lat: r.geo_lat == null ? null : Number(r.geo_lat),
    lng: r.geo_lng == null ? null : Number(r.geo_lng),
    geoAcc: r.geo_acc,
    amenities: jsonArr(r.amenities),
    images: jsonArr(r.images),
    desc: r.desc,
    parties: jsonArr(r.parties),
    status: r.status,
    code: r.code,
    mine: !!r.mine,
    user: !!r.user,
    owner: r.owner,
    ai: !!r.ai,
    agentName: r.agent_name,
    isVerified: !!r.is_verified,
    isAgent: !!r.is_agent,
    isTop: !!r.is_top,
    isUrgent: !!r.is_urgent,
    legal: !!r.legal,
    rating: Number(r.rating || 0),
    reviews: r.reviews,
    moveIn: r.move_in,
    views: r.views,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  };
}

// ---------- Сервисные роуты ----------
app.get('/api/ping', (req, res) => res.json({ ok: true, service: 'rentalbali', db: DB_NAME }));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'up' });
  } catch (e) {
    res.status(503).json({ ok: false, db: 'down', error: String(e.message).slice(0, 200) });
  }
});

app.get('/api/admin/check', adminOnly, (req, res) => res.json({ ok: true, admin: true }));

// ============ АККАУНТЫ И СЕССИИ ============
function publicAccount(a) {
  return { id: a.id, login: a.login, name: a.name, profileId: a.profile_id };
}

async function createSession(accountId) {
  const token = crypto.randomBytes(32).toString('hex');
  await pool.query(
    'INSERT INTO sessions (token, account_id, expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL ? DAY))',
    [token, accountId, SESSION_DAYS]
  );
  await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
  return token;
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const b = req.body || {};
    const login = String(b.login || '').trim().toLowerCase();
    const password = String(b.password || '');
    const name = String(b.name || '').trim().slice(0, 120) || login;
    if (!/^[a-z0-9._-]{3,40}$/.test(login)) {
      return res.status(400).json({ ok: false, error: 'Логин: 3–40 символов, латиница, цифры, точка, дефис или подчёркивание' });
    }
    if (password.length < 4) {
      return res.status(400).json({ ok: false, error: 'Пароль должен быть не короче 4 символов' });
    }
    const [dup] = await pool.query('SELECT id FROM accounts WHERE login = ? LIMIT 1', [login]);
    if (dup.length) return res.status(409).json({ ok: false, error: 'Такой логин уже занят' });

    const [ins] = await pool.query(
      'INSERT INTO accounts (login, pass_hash, name, profile_id) VALUES (?,?,?,NULL)',
      [login, hashPassword(password), name]
    );
    const accountId = ins.insertId;
    const profileId = profileIdFor(accountId);
    await pool.query('UPDATE accounts SET profile_id = ? WHERE id = ?', [profileId, accountId]);
    await upsertProfile({ id: profileId, name, username: login });

    const token = await createSession(accountId);
    res.json({ ok: true, token, account: { id: accountId, login, name, profileId } });
  } catch (e) {
    if (String(e.code) === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, error: 'Такой логин уже занят' });
    }
    res.status(400).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const b = req.body || {};
    const login = String(b.login || '').trim().toLowerCase();
    const password = String(b.password || '');
    const [rows] = await pool.query('SELECT * FROM accounts WHERE login = ? LIMIT 1', [login]);
    if (!rows.length || !verifyPassword(password, rows[0].pass_hash)) {
      return res.status(401).json({ ok: false, error: 'Неверный логин или пароль' });
    }
    const a = rows[0];
    const token = await createSession(a.id);
    res.json({ ok: true, token, account: publicAccount(a) });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = bearer(req);
    if (token && token !== ADMIN_TOKEN) {
      await pool.query('DELETE FROM sessions WHERE token = ?', [token]);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  if (req.auth.admin) return res.json({ ok: true, admin: true, account: null });
  try {
    const a = req.auth.account;
    const [s] = await pool.query('SELECT expires_at FROM sessions WHERE token = ? LIMIT 1', [req.auth.token]);
    const [p] = await pool.query('SELECT * FROM profiles WHERE id = ? LIMIT 1', [a.profileId]);
    res.json({
      ok: true,
      admin: false,
      account: a,
      profile: p.length ? normalizeProfile(p[0]) : null,
      expiresAt: s.length ? s[0].expires_at : null,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

// Сохранение только своего профиля
app.post('/api/profile', requireAuth, async (req, res) => {
  if (!req.auth.account) return res.status(400).json({ ok: false, error: 'admin account has no profile' });
  try {
    const b = Object.assign({}, req.body || {}, { id: req.auth.account.profileId });
    await upsertProfile(b);
    res.json({ ok: true, id: b.id });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

// ============ LISTINGS ============
app.get('/api/listings', async (req, res) => {
  try {
    const mine = String(req.query.mine || '') === '1';
    if (mine) {
      if (!req.auth) return res.status(401).json({ ok: false, error: 'auth required' });
      const sql = req.auth.admin
        ? 'SELECT * FROM listings ORDER BY created_at DESC LIMIT 500'
        : 'SELECT * FROM listings WHERE owner = ? ORDER BY created_at DESC LIMIT 500';
      const params = req.auth.admin ? [] : [req.auth.account.profileId];
      const [rows] = await pool.query(sql, params);
      return res.json({ ok: true, items: rows.map(rowToListing), count: rows.length });
    }
    const all = String(req.query.status || '') === 'all';
    const sql = all
      ? 'SELECT * FROM listings ORDER BY created_at DESC LIMIT 500'
      : "SELECT * FROM listings WHERE status='published' ORDER BY created_at DESC LIMIT 300";
    const [rows] = await pool.query(sql);
    res.json({ ok: true, items: rows.map(rowToListing), count: rows.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

// Создание или обновление объекта по code (повторное сохранение не падает).
async function upsertListing(b, auth) {
  const title = String(b.title || '').trim();
  if (!title) throw new Error('title required');
  let code = String(b.code || '').trim() || 'OBJ' + Date.now() + Math.floor(Math.random() * 1000);
  const status = b.status === 'published' ? 'published' : 'draft';
  const isAdmin = !!(auth && auth.admin);
  const owner = isAdmin
    ? String(b.owner || 'admin')
    : auth && auth.account
      ? auth.account.profileId
      : 'admin';

  // Чужой code не перезаписываем: аккаунту выдаём свободный вариант.
  let [existing] = await pool.query('SELECT id, owner FROM listings WHERE code = ? LIMIT 1', [code]);
  if (existing.length && !isAdmin && existing[0].owner && existing[0].owner !== owner) {
    code = code + '-' + crypto.randomBytes(2).toString('hex');
    [existing] = await pool.query('SELECT id, owner FROM listings WHERE code = ? LIMIT 1', [code]);
  }

  const values = [
    title,
    b.dealType === 'sale' ? 'sale' : 'rent',
    b.role === 'request' ? 'request' : 'offer',
    b.propertyType || 'villa',
    b.district || b.locationEn || '',
    b.location || '',
    b.address || '',
    int(b.price),
    int(b.priceMin),
    b.currency || 'IDR',
    b.category === 'yearly' ? 'yearly' : 'monthly',
    int(b.bedrooms),
    int(b.bathrooms),
    num(b.area),
    num(b.landArea),
    int(b.floors),
    int(b.yearBuilt),
    b.furnished === false ? 0 : 1,
    b.tenure === 'leasehold' ? 'leasehold' : 'freehold',
    int(b.leaseYears),
    toDate(b.available),
    b.lat === '' || b.lat == null ? null : num(b.lat),
    b.lng === '' || b.lng == null ? null : num(b.lng),
    b.geoAcc === 'approx' ? 'approx' : 'exact',
    JSON.stringify(jsonArr(b.amenities)),
    JSON.stringify(jsonArr(b.images)),
    b.desc || '',
    JSON.stringify(jsonArr(b.parties)),
    status,
    bool(b.ai),
    b.agentName || '',
    bool(b.isVerified),
    bool(b.isAgent),
    bool(b.isTop),
    bool(b.isUrgent),
    bool(b.legal),
    num(b.rating),
    int(b.reviews),
    toDate(b.moveIn),
    owner,
  ];

  if (existing.length) {
    await pool.query(
      `UPDATE listings SET
        title=?, deal_type=?, role=?, property_type=?, district=?, location=?, address=?, price=?, price_min=?,
        currency=?, category=?, bedrooms=?, bathrooms=?, area=?, land_area=?, floors=?, year_built=?, furnished=?,
        tenure=?, lease_years=?, available=?, geo_lat=?, geo_lng=?, geo_acc=?, amenities=?, images=?, \`desc\`=?,
        parties=?, status=?, ai=?, agent_name=?, is_verified=?, is_agent=?, is_top=?, is_urgent=?, legal=?,
        rating=?, reviews=?, move_in=?, owner=?, updated_at=NOW()
       WHERE code=?`,
      [...values, code]
    );
    return { ok: true, id: existing[0].id, code, status, updated: true };
  }

  const placeholders = values.map(() => '?').join(',');
  const [result] = await pool.query(
    `INSERT INTO listings
      (title, deal_type, role, property_type, district, location, address, price, price_min, currency, category,
       bedrooms, bathrooms, area, land_area, floors, year_built, furnished, tenure, lease_years, available,
       geo_lat, geo_lng, geo_acc, amenities, images, \`desc\`, parties, status, ai, agent_name, is_verified,
       is_agent, is_top, is_urgent, legal, rating, reviews, move_in, owner, code, mine, \`user\`, created_at, updated_at)
     VALUES (${placeholders},?,1,1,NOW(),NOW())`,
    [...values, code]
  );
  return { ok: true, id: result.insertId, code, status, created: true };
}

function authOrAdmin(req, res, next) {
  if (!req.auth) return res.status(401).json({ ok: false, error: 'auth required' });
  next();
}

app.post('/api/listings', authOrAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    if (Array.isArray(body.items)) {
      const results = [];
      for (const item of body.items) {
        try {
          results.push(await upsertListing(item, req.auth));
        } catch (e) {
          results.push({ ok: false, error: String(e.message).slice(0, 160) });
        }
      }
      return res.json({ ok: true, batch: true, results });
    }
    res.json(await upsertListing(body, req.auth));
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

app.delete('/api/listings/:code', authOrAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, owner FROM listings WHERE code = ? LIMIT 1', [req.params.code]);
    if (!rows.length) return res.json({ ok: true, deleted: 0 });
    if (!req.auth.admin && rows[0].owner !== req.auth.account.profileId) {
      return res.status(403).json({ ok: false, error: 'not your listing' });
    }
    await pool.query('DELETE FROM listings WHERE code = ?', [req.params.code]);
    res.json({ ok: true, deleted: 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

// ============ PROFILES ============
function normalizeProfile(p) {
  return {
    id: p.id,
    num: p.num || 0,
    name: p.name,
    username: p.username || '',
    email: p.email || '',
    phone: p.phone || '',
    city: p.city || '',
    role: p.role || 'owner',
    bio: p.bio || '',
    public: !!p.public,
    avatar: p.avatar || '',
    createdAt: p.created_at,
  };
}

app.get('/api/profiles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM profiles ORDER BY created_at DESC LIMIT 300');
    res.json({ ok: true, items: rows.map(normalizeProfile), count: rows.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

app.get('/api/profiles/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM profiles WHERE id=? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ ok: false, error: 'not found' });
    res.json({ ok: true, profile: normalizeProfile(rows[0]) });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

app.post('/api/profiles', adminOnly, async (req, res) => {
  try {
    const b = req.body || {};
    if (Array.isArray(b.profiles)) {
      let saved = 0;
      for (const p of b.profiles) {
        if (!p || !p.id) continue;
        await upsertProfile(p);
        saved++;
      }
      return res.json({ ok: true, batch: true, saved });
    }
    const id = await upsertProfile(b);
    res.json({ ok: true, id });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

async function upsertProfile(b) {
  const id = String(b.id || '').trim() || 'u' + Date.now();
  const name = String(b.name || '').trim();
  if (!name) throw new Error('name required');
  await pool.query(
    `INSERT INTO profiles (id, name, username, email, phone, city, role, bio, public, avatar, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,NOW(),NOW())
     ON DUPLICATE KEY UPDATE
       name=VALUES(name), username=VALUES(username), email=VALUES(email), phone=VALUES(phone),
       city=VALUES(city), role=VALUES(role), bio=VALUES(bio), public=VALUES(public),
       avatar=VALUES(avatar), updated_at=NOW()`,
    [
      id,
      name,
      b.username || null,
      b.email || null,
      b.phone || null,
      b.city || null,
      b.role || 'owner',
      b.bio || null,
      b.public ? 1 : 0,
      b.avatar || null,
    ]
  );
  return id;
}

// ============ CONTRACTS ============
app.get('/api/contracts', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contracts ORDER BY created_at DESC LIMIT 300');
    const pid = req.auth.admin ? String(req.query.user || '') : req.auth.account.profileId;
    const items = rows.filter((c) => {
      if (!pid) return true;
      return jsonArr(c.parties).some((p) => (typeof p === 'string' ? p : p && p.pid) === pid);
    });
    res.json({
      ok: true,
      items: items.map((c) => ({
        id: c.id,
        parties: jsonArr(c.parties),
        projects: jsonArr(c.projects),
        status: c.status,
        createdAt: c.created_at,
      })),
      count: items.length,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

app.post('/api/contracts', requireAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const list = Array.isArray(body.items) ? body.items : [body];
    let saved = 0;
    for (const b of list) {
      if (!b || typeof b !== 'object') continue;
      const id = String(b.id || '').trim() || 'c' + Date.now() + Math.floor(Math.random() * 1000);
      const status = ['pending', 'active', 'finished'].includes(b.status) ? b.status : 'pending';
      const parties = jsonArr(b.parties);
      if (req.auth.account) {
        const pid = req.auth.account.profileId;
        const has = parties.some((p) => (typeof p === 'string' ? p : p && p.pid) === pid);
        if (!has) parties.push({ pid, name: req.auth.account.name || '', role: 'admin' });
      }
      await pool.query(
        `INSERT INTO contracts (id, parties, projects, status, created_at)
         VALUES (?,?,?,?,NOW())
         ON DUPLICATE KEY UPDATE parties=VALUES(parties), projects=VALUES(projects), status=VALUES(status)`,
        [id, JSON.stringify(parties), JSON.stringify(jsonArr(b.projects)), status]
      );
      saved++;
    }
    res.json({ ok: true, saved });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

// ============ FAVORITES ============
app.get('/api/favorites', requireAuth, async (req, res) => {
  try {
    const user = req.auth.admin ? String(req.query.user || '') : req.auth.account.profileId;
    if (!user) return res.json({ ok: true, items: [], count: 0 });
    const [rows] = await pool.query(
      'SELECT l.* FROM favorites f JOIN listings l ON l.id=f.listing_id WHERE f.user_id=? ORDER BY f.created_at DESC',
      [user]
    );
    res.json({ ok: true, items: rows.map(rowToListing), count: rows.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

app.post('/api/favorites', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const user = req.auth.admin ? String(b.userId || '') : req.auth.account.profileId;
    const listingId = int(b.listingId);
    if (!user || !listingId) return res.status(400).json({ ok: false, error: 'userId and listingId required' });
    if (String(b.action || 'add') === 'remove') {
      await pool.query('DELETE FROM favorites WHERE user_id=? AND listing_id=?', [user, listingId]);
    } else {
      await pool.query('INSERT IGNORE INTO favorites (user_id, listing_id) VALUES (?,?)', [user, listingId]);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

// ============ TEMPLATES ============
app.get('/api/templates', requireAuth, async (req, res) => {
  try {
    if (!req.auth.account) return res.json({ ok: true, items: [], count: 0 });
    const [rows] = await pool.query(
      'SELECT id, name, data, created_at FROM templates WHERE account_id=? ORDER BY created_at ASC LIMIT 50',
      [req.auth.account.id]
    );
    res.json({
      ok: true,
      items: rows.map((t) => ({
        id: t.id,
        name: t.name || '',
        data: (() => {
          try {
            const d = typeof t.data === 'string' ? JSON.parse(t.data || '{}') : t.data;
            return d && typeof d === 'object' && !Array.isArray(d) ? d : {};
          } catch (_) {
            return {};
          }
        })(),
      })),
      count: rows.length,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

app.post('/api/templates', requireAuth, async (req, res) => {
  try {
    if (!req.auth.account) return res.status(400).json({ ok: false, error: 'account required' });
    const items = Array.isArray((req.body || {}).items) ? req.body.items.slice(-20) : [];
    await pool.query('DELETE FROM templates WHERE account_id=?', [req.auth.account.id]);
    for (const t of items) {
      await pool.query('INSERT INTO templates (account_id, name, data) VALUES (?,?,?)', [
        req.auth.account.id,
        String((t && t.name) || '').slice(0, 120),
        JSON.stringify((t && t.data) || {}),
      ]);
    }
    res.json({ ok: true, saved: items.length });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e.message).slice(0, 200) });
  }
});

// ---------- Статика сайта ----------
const ROOT = __dirname;
const BLOCKED = new Set(['/server.js', '/package.json', '/package-lock.json', '/.env', '/.env.example']);
app.use((req, res, next) => {
  if (BLOCKED.has(req.path) || req.path.startsWith('/db/') || req.path.startsWith('/node_modules/')) {
    return res.status(404).send('Not found');
  }
  next();
});
app.use(
  express.static(ROOT, {
    index: 'index.html',
    dotfiles: 'deny',
    extensions: ['html'],
    setHeaders(res, filePath) {
      if (/[\\/](css|js)[\\/]/.test(filePath)) res.setHeader('Cache-Control', 'no-cache');
    },
  })
);
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(ROOT, 'index.html'));
});

// ---------- Запуск с проверкой БД ----------
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    console.log(`[DB] Подключено: ${process.env.MYSQL_USER}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT || 3306}/${DB_NAME}`);
  } catch (e) {
    console.error('\n[DB] Не удалось подключиться к MySQL: ' + e.message);
    console.error('[DB] Проверьте MYSQL_HOST / MYSQL_PORT / MYSQL_USER / MYSQL_PASSWORD / MYSQL_DATABASE');
    console.error('[DB] И разрешите внешние подключения для пользователя (GRANT ... TO user@\'%\').\n');
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RentHome Bali: http://localhost:${PORT}`);
    console.log(`Админ-токен: ${ADMIN_TOKEN ? '(задан)' : '(НЕ ЗАДАН)'}`);
  });
})();
