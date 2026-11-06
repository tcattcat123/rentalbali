// Vercel API: избранное (favorites)
// GET  /api/favorites?user=X   — избранное пользователя
// POST /api/favorites          — добавить в избранное (только админ)

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

    if (req.method === 'GET') {
      const user = req.query.user;
      if (!user) return json(res, 400, { ok: false, error: 'user обязателен' });
      const [rows] = await pool.query(
        `SELECT l.* FROM favorites f JOIN listings l ON l.id=f.listing_id WHERE f.user_id=? ORDER BY f.created_at DESC`,
        [user]
      );
      return json(res, 200, { ok: true, items: rows, count: rows.length });
    }

    if (req.method === 'POST') {
      if (!requireAdmin(req, res)) return;
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { return json(res, 400, { ok: false, error: 'bad json' }); }
      }
      body = body || {};
      const userId = String(body.userId || '').trim();
      const listingId = parseInt(body.listingId, 10) || 0;
      if (!userId) return json(res, 400, { ok: false, error: 'userId обязателен' });
      if (!listingId) return json(res, 400, { ok: false, error: 'listingId обязателен' });

      await pool.query(
        'INSERT IGNORE INTO favorites (user_id, listing_id) VALUES (?,?)',
        [userId, listingId]
      );
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { ok: false, error: 'method not allowed' });
  } catch (e) {
    console.error('favorites error:', e);
    return json(res, 500, { ok: false, error: 'server error: ' + String(e.message).slice(0, 200) });
  }
};
