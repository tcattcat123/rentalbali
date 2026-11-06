// Vercel API: договоры (contracts)
// GET  /api/contracts          — все договора (или фильтр по участнику через ?user=)
// POST /api/contracts          — создать договор (только админ)

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
      let rows;
      if (user) {
        [rows] = await pool.query(
          `SELECT * FROM contracts WHERE JSON_CONTAINS(parties, JSON_QUOTE(?), '$[*]') ORDER BY created_at DESC LIMIT 200`,
          [user]
        );
      } else {
        [rows] = await pool.query('SELECT * FROM contracts ORDER BY created_at DESC LIMIT 200');
      }
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
      const id = String(body.id || '').trim() || ('c' + Date.now());
      if (!Array.isArray(body.parties) || body.parties.length < 2) errors.push('parties: минимум 2 участника');
      if (!Array.isArray(body.projects)) errors.push('projects: массив обязателен');
      const status = body.status || 'pending';
      if (!['pending','active','finished'].includes(status)) errors.push('status: pending/active/finished');

      if (errors.length) return json(res, 400, { ok: false, error: 'validation failed', errors });

      await pool.query(
        `INSERT INTO contracts (id, parties, projects, status, created_at)
         VALUES (?,?,?,?,NOW())
         ON DUPLICATE KEY UPDATE parties=VALUES(parties), projects=VALUES(projects), status=VALUES(status)`,
        [id, JSON.stringify(body.parties), JSON.stringify(body.projects), status]
      );

      return json(res, 200, { ok: true, id });
    }

    return json(res, 405, { ok: false, error: 'method not allowed' });
  } catch (e) {
    console.error('contracts error:', e);
    return json(res, 500, { ok: false, error: 'server error: ' + String(e.message).slice(0, 200) });
  }
};
