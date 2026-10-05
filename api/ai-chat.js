// Vercel serverless: on-site AI agent proxy. Key lives in env (AI_API_KEY),
// never in frontend code. Set AI_API_KEY (+optional AI_ENDPOINT, AI_MODEL)
// in Vercel dashboard -> Settings -> Environment Variables.
const ENDPOINT = (process.env.AI_ENDPOINT || "https://anymodel.org/v1").replace(/\/+$/, "");
const MODEL = process.env.AI_MODEL || "ag/gemini-2.5-flash-lite";
const DISTRICTS = "Canggu,Berawa,BatuBolong,TumbakBayuh,Pererenan,Umalas,Kerobokan,Seseh,Buduk,Seminyak,BeachsideCenter,ResidentialSide,Oberoi,Legian,Petitenget,Kuta,TanahLot,Kedungu,Cemagi,Uluwatu,Bingin,Balangan,Jimbaran,NusaDua,Ungasan,Pecatu,Ubud,Mas,Payangan,Denpasar,Sanur,Gianyar,Sukawati,Tabanan,Mengwi,Lovina,Singaraja,Pemuteran,Amed,Candidasa,Sidemen,NusaPenida,NusaLembongan";
const EXTRACT_SYSTEM = "Ты парсер объявлений недвижимости Бали. Ответь СТРОГО одним JSON-объектом без пояснений. Схема: {\"deal\":\"rent|sale\",\"role\":\"offer|request\",\"price\":число в IDR (B/miliar=1e9, млн=1e6; USD переведи по 16000; 0 если нет цены),\"category\":\"monthly|yearly (только для rent; иначе monthly)\",\"ptype\":\"villa|house|apartment|homestay|land|townhouse|boarding|commercial\",\"district\":\"ключ района строго из списка\",\"area\":площадь строения м² числом,\"land\":участок м² числом (сотка/are=100),\"bedrooms\":число,\"bathrooms\":число,\"tenure\":\"freehold|leasehold (только для sale)\",\"furnished\":true|false,\"amenities\":[строки из: Бассейн,Wi-Fi,Кондиционер,Кухня,Парковка,Сад,Холодильник,Телевизор,Стиральная машина,Плита,Завтраки,Общая кухня,Электричество,Вода],\"title\":краткий заголовок до 90 символов,\"desc\":сжатое описание до 600 символов}. Районы: " + DISTRICTS + ". Не выдумывай отсутствующие числа — ставь 0.";
const ASSISTANT_SYSTEM = "Ты помощник аренды недвижимости на Бали (RentHome Bali). Отвечай кратко по-русски, максимум 3-4 предложения. Помогаешь снять, сдать или купить: виллы, дома, квартиры, землю. Контакты: WhatsApp +62813-3734-1275, Telegram @renthomebali. Если просят разместить объявление — скажи нажать кнопку чата «Разместить объявление» и описать объект одним сообщением.";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function extractJson(s) {
  s = String(s || "");
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const m = (fenced ? fenced[1] : s).match(/\{[\s\S]*\}/);
  if (!m) throw new Error("no json in ai response");
  return JSON.parse(m[0]);
}

async function chatCompletions(key, body) {
  const url = ENDPOINT + "/chat/completions";
  const tries = [Object.assign({ response_format: { type: "json_object" } }, body), body];
  let lastErr = "unknown";
  for (let i = 0; i < tries.length; i++) {
    if (i === 1 && !body._wantJson) break;
    const payload = Object.assign({}, tries[i]);
    delete payload._wantJson;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key, "User-Agent": UA, "Accept": "application/json" },
      body: JSON.stringify(payload),
    });
    if (r.ok) return r.json();
    lastErr = "ai_http_" + r.status + " " + (await r.text().catch(() => "")).slice(0, 200);
    if (r.status !== 400) break;
  }
  throw new Error(lastErr);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  const key = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
  if (!key) return res.status(200).json({ ok: false, error: "no_server_key" });
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ ok: false, error: "bad json" }); } }
  body = body || {};
  try {
    if (body.text && !body.messages) {
      const j = await chatCompletions(key, {
        _wantJson: true, model: body.model || MODEL, temperature: 0.1,
        messages: [
          { role: "system", content: EXTRACT_SYSTEM },
          { role: "user", content: "Текст задания:\n" + String(body.text).slice(0, 4000) },
        ],
      });
      const content = j.choices[0].message.content;
      return res.status(200).json({ ok: true, listing: extractJson(content) });
    }
    const msgs = (body.messages || []).slice(-6).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 2000),
    }));
    const j = await chatCompletions(key, {
      model: body.model || MODEL, temperature: 0.4,
      messages: [{ role: "system", content: ASSISTANT_SYSTEM }, ...msgs],
    });
    return res.status(200).json({ ok: true, reply: String(j.choices[0].message.content || "").slice(0, 800) });
  } catch (e) {
    return res.status(502).json({ ok: false, error: "ai failed: " + String((e && e.message) || e).slice(0, 200) });
  }
};
