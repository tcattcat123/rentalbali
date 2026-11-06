// Vercel API: профили (profiles)
// GET  /api/profiles           — все профили (публичные поля)
// GET  /api/profiles/:id       — один профиль
// POST /api/profiles           — создать/обновить профиль (только админ)

const { getPool, requireAdmin } = require('./db');

function json(res, status, body) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(status).json(body);
  return;
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  try {
    const pool = getPool();
    const id = req.query.id;

    if (req.method === 'GET' && id) {
      const [rows] = await pool.query('SELECT * FROM profiles WHERE id=? LIMIT 1', [id]);
      if (!rows.length) return json(res, 404, { ok: false, error: 'профиль не найден' });
      return json(res, 200, { ok: true, profile: rows[0] });
    }

    if (req.method === 'GET') {
      const [rows] = await pool.query('SELECT * FROM profiles ORDER BY created_at DESC LIMIT 200');
      return json(res, 200, { ok: true, items: rows, count: rows.length });
    }

    if (req.method === 'POST') {
      if (!requireAdmin(req, res)) return;
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { return json(res, 400, { ok: false, error: 'bad json' }); }
      }
      body = body || {};

      const errors = [];
      const id = String(body.id || '').trim() || ('u' + Date.now());
      const name = String(body.name || '').trim();
      if (!name) errors.push('name: имя обязательно');
      if (name.length > 120) errors.push('name: максимум 120 символов');

      const username = String(body.username || '').trim();
      if (username && username.length > 80) errors.push('username: максимум 80 символов');

      const email = String(body.email || '').trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email: неверный формат');

      const phone = String(body.phone || '').trim();
      if (phone && !/^\+?[\d\s\-()]{6,30}$/.test(phone)) errors.push('phone: неверный формат');

      const role = body.role || 'owner';
      if (!['owner','agent','notary','consultant','admin','buyer'].includes(role)) errors.push('role: недопустимая роль');

      const bio = String(body.bio || '').trim();
      if (bio.length > 2000) errors.push('bio: максимум 2000 символов');

      const city = String(body.city || '').trim();
      if (city.length > 120) errors.push('city: максимум 120 символов');

      const publicFlag = body.public === true ? 1 : 0;

      const avatar = String(body.avatar || '').trim();
      if (avatar && !/^https?:\/\/.+/.test(avatar)) errors.push('avatar: неверный URL');

      if (errors.length) return json(res, 400, { ok: false, error: 'validation failed', errors });

      await pool.query(
        `INSERT INTO profiles (id, name, username, email, phone, city, role, bio, public, avatar, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,NOW(),NOW())
         ON DUPLICATE KEY UPDATE
           name=VALUES(name), username=VALUES(username), email=VALUES(email), phone=VALUES(phone),
           city=VALUES(city), role=VALUES(role), bio=VALUES(bio), public=VALUES(public), avatar=VALUES(avatar), updated_at=NOW()`,
        [id, name, username || null, email || null, phone || null, city || null, role, bio || null, publicFlag, avatar || null]
      );

      return json(res, 200, { ok: true, id });
    }

    return json(res, 405, { ok: false, error: 'method not allowed' });
  } catch (e) {
    console.error('profiles error:', e);
    return json(res, 500, { ok: false, error: 'server error: ' + String(e.message).slice(0, 200) });
  }
};
