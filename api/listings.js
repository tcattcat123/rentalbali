// Vercel API: объявления (listings)
// GET  /api/listings           — публичные опубликованные объекты
// POST /api/listings           — создать объект (только админ, много проверок)
// Env: ADMIN_SECRET (Bearer токен в заголовке Authorization)

const { getPool, requireAdmin } = require('./db');

const ALLOWED_TYPES = ['villa','house','apartment','room','invest','homestay','land','townhouse','boarding','commercial'];
const ALLOWED_DISTRICTS = ['Canggu','Berawa','BatuBolong','TumbakBayuh','Pererenan','Umalas','Kerobokan','Seseh','Buduk','Seminyak','BeachsideCenter','ResidentialSide','Oberoi','Legian','Petitenget','Kuta','TanahLot','Kedungu','Cemagi','Uluwatu','Bingin','Balangan','Jimbaran','NusaDua','Ungasan','Pecatu','Ubud','Mas','Payangan','Denpasar','Sanur','Gianyar','Sukawati','Tabanan','Mengwi','Lovina','Singaraja','Pemuteran','Amed','Candidasa','Sidemen','NusaPenida','NusaLembongan'];

function json(res, status, body) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(status).json(body);
  return;
}

function validateListing(b) {
  const errors = [];
  const trim = (s) => String(s || '').trim();

  const title = trim(b.title);
  if (!title) errors.push('title: заголовок обязателен');
  else if (title.length < 3) errors.push('title: минимум 3 символа');
  else if (title.length > 200) errors.push('title: максимум 200 символов');

  const dealType = b.dealType;
  if (!['rent', 'sale'].includes(dealType)) errors.push('dealType: rent или sale');

  const role = b.role;
  if (!['offer', 'request'].includes(role)) errors.push('role: offer или request');

  const propertyType = b.propertyType;
  if (!ALLOWED_TYPES.includes(propertyType)) errors.push('propertyType: недопустимый тип недвижимости');

  const district = trim(b.district || b.locationEn || '');
  if (!district) errors.push('district: укажите район');
  else if (!ALLOWED_DISTRICTS.includes(district)) errors.push('district: район не из допустимого списка');

  const location = trim(b.location || '');
  if (!location) errors.push('location: локация обязательна');

  const price = parseFloat(b.price);
  if (!isFinite(price) || price < 0) errors.push('price: цена должна быть числом >= 0');
  if (price > 1e12) errors.push('price: слишком большая цена');

  const priceMin = parseFloat(b.priceMin || 0);
  if (!isFinite(priceMin) || priceMin < 0) errors.push('priceMin: число >= 0');
  if (dealType === 'request' && priceMin > 0 && price > 0 && priceMin > price) errors.push('priceMin: не может быть больше цены');

  const bedrooms = parseInt(b.bedrooms, 10) || 0;
  if (bedrooms < 0 || bedrooms > 50) errors.push('bedrooms: 0–50');

  const bathrooms = parseInt(b.bathrooms, 10) || 0;
  if (bathrooms < 0 || bathrooms > 50) errors.push('bathrooms: 0–50');

  const area = parseFloat(b.area || 0);
  if (area < 0 || area > 100000) errors.push('area: 0–100000 м²');

  const landArea = parseFloat(b.landArea || 0);
  if (landArea < 0 || landArea > 1000000) errors.push('landArea: 0–1000000 м²');

  const floors = parseInt(b.floors, 10) || 0;
  if (floors < 0 || floors > 100) errors.push('floors: 0–100');

  const yearBuilt = parseInt(b.yearBuilt, 10) || 0;
  const now = new Date().getFullYear();
  if (yearBuilt < 1900 || yearBuilt > now + 5) errors.push(`yearBuilt: 1900–${now + 5}`);

  const leaseYears = parseInt(b.leaseYears, 10) || 0;
  if (dealType === 'sale' && b.tenure === 'leasehold' && (leaseYears < 1 || leaseYears > 99)) errors.push('leaseYears: 1–99 для leasehold');

  const images = Array.isArray(b.images) ? b.images : [];
  if (images.length > 6) errors.push('images: максимум 6 фото');
  for (const img of images) {
    if (typeof img !== 'string' || !/^https?:\/\/.+/.test(img)) errors.push('images: каждая ссылка должна быть корректным URL');
  }

  const amenities = Array.isArray(b.amenities) ? b.amenities : [];
  if (amenities.length > 30) errors.push('amenities: максимум 30');

  const desc = trim(b.desc || '');
  if (desc.length > 2000) errors.push('desc: максимум 2000 символов');

  const address = trim(b.address || '');
  if (address.length > 500) errors.push('address: максимум 500 символов');

  const phone = trim(b.phone || '');
  if (phone && !/^\+?[\d\s\-()]{6,30}$/.test(phone)) errors.push('phone: неверный формат телефона');

  const email = trim(b.email || '');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email: неверный формат почты');

  const code = trim(b.code || '');
  if (code && code.length > 40) errors.push('code: максимум 40 символов');

  const status = b.status || 'draft';
  if (!['draft', 'published'].includes(status)) errors.push('status: draft или published');

  return {
    errors,
    data: {
      title, dealType, role, propertyType, district, location, address: trim(b.address || ''),
      price: Math.round(price), priceMin: Math.round(priceMin),
      currency: b.currency || 'IDR',
      category: b.category || 'monthly',
      bedrooms, bathrooms, area, landArea, floors, yearBuilt,
      furnished: b.furnished !== false,
      tenure: b.tenure || 'freehold',
      leaseYears,
      available: b.available || null,
      geoLat: b.lat ? parseFloat(b.lat) : null,
      geoLng: b.lng ? parseFloat(b.lng) : null,
      geoAcc: ['exact','approx'].includes(b.geoAcc) ? b.geoAcc : 'exact',
      amenities,
      images,
      desc,
      parties: Array.isArray(b.parties) ? b.parties : [],
      status,
      code: code || ('OBJ' + Date.now()),
      owner: trim(b.owner || 'admin'),
      ai: b.ai === true ? 1 : 0,
      agentName: trim(b.agentName || ''),
      isVerified: b.isVerified === true ? 1 : 0,
      isAgent: b.isAgent === true ? 1 : 0,
      isTop: b.isTop === true ? 1 : 0,
      isUrgent: b.isUrgent === true ? 1 : 0,
      legal: b.legal === true ? 1 : 0,
      rating: parseFloat(b.rating || 0),
      reviews: parseInt(b.reviews, 10) || 0,
      moveIn: b.moveIn || null,
    }
  };
}

module.exports = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT * FROM listings WHERE status='published' ORDER BY created_at DESC LIMIT 200`
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

      const pool = getPool();

      const insertOne = async (b) => {
        const v = validateListing(b);
        if (v.errors.length) throw new Error('validation: ' + v.errors.join('; '));
        const d = v.data;
        const [existing] = await pool.query('SELECT id FROM listings WHERE code=? LIMIT 1', [d.code]);
        if (existing.length) throw new Error('code_exists:' + d.code);
        await pool.query(
          `INSERT INTO listings
            (title, deal_type, role, property_type, district, location, address, price, price_min, currency, category,
             bedrooms, bathrooms, area, land_area, floors, year_built, furnished, tenure, lease_years, available,
             geo_lat, geo_lng, geo_acc, amenities, images, \`desc\`, parties, status, code, mine, \`user\`, owner,
             ai, agent_name, is_verified, is_agent, is_top, is_urgent, legal, rating, reviews, move_in, created_at, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
          [
            d.title, d.dealType, d.role, d.propertyType, d.district, d.location, d.address,
            d.price, d.priceMin, d.currency, d.category, d.bedrooms, d.bathrooms, d.area, d.landArea,
            d.floors, d.yearBuilt, d.furnished ? 1 : 0, d.tenure, d.leaseYears, d.available,
            d.geoLat, d.geoLng, d.geoAcc, JSON.stringify(d.amenities), JSON.stringify(d.images), d.desc,
            JSON.stringify(d.parties), d.status, d.code, 1, 1, d.owner,
            d.ai, d.agentName, d.isVerified, d.isAgent, d.isTop, d.isUrgent, d.legal, d.rating, d.reviews, d.moveIn
          ]
        );
        return { ok: true, code: d.code, status: d.status };
      };

      const results = [];
      if (Array.isArray(body.items)) {
        // batch mode: {items: [...]}
        for (const b of body.items) {
          try { results.push(await insertOne(b)); } catch (e) { results.push({ ok: false, error: String(e.message).slice(0, 120) }); }
        }
        return json(res, 200, { ok: true, batch: true, results });
      }

      // single mode
      try {
        const r = await insertOne(body);
        return json(res, 200, { ok: true, ...r });
      } catch (e) {
        return json(res, 400, { ok: false, error: String(e.message).slice(0, 200) });
      }
    }

    return json(res, 405, { ok: false, error: 'method not allowed' });
  } catch (e) {
    console.error('listings error:', e);
    return json(res, 500, { ok: false, error: 'server error: ' + String(e.message).slice(0, 200) });
  }
};
