import os

TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_CHAT_ID = int(os.getenv("ADMIN_CHAT_ID", "0"))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.getenv("UPLOADS_DIR", os.path.join(BASE_DIR, "uploads"))

VILLA_NAME = "Villa #7"

# ---- Сценарии (кнопки) ----
SCENARIOS = [
    "До заезда — более 7 дней",        # 1  active
    "До заезда — менее 7 дней",        # 2  dev
    "До заезда — 24 часа и менее",     # 3  active
    "Заезд на виллу",                  # 4  active
    "Проживание — 1 сутки",            # 5  active
    "Проживание — 2 суток",            # 6  dev
    "Проживание — 3 суток и более",    # 7  active
    "Выезд",                           # 8  active
]
SCENARIOS_SET = set(SCENARIOS)

SCENARIO_DEVELOPMENT = {
    "До заезда — менее 7 дней",
    "Проживание — 2 суток",
}

SCENARIO_KEY = {
    "До заезда — более 7 дней": "pre_arrival_more_7",
    "До заезда — 24 часа и менее": "pre_arrival_24h",
    "Заезд на виллу": "villa_checkin",
    "Проживание — 1 сутки": "accommodation_1_day",
    "Проживание — 3 суток и более": "accommodation_3_days",
    "Выезд": "checkout",
}

# ---- Услуги (кнопки) ----
SERVICES = [
    "Трансфер",                                      # 1  active
    "Аренда машины и байка",                         # 2  active
    "Личный водитель",                               # 3  active
    "Экскурсии и туры",                              # 4  active
    "Самостоятельные путешествия",                   # 5  dev
    "Массаж / SPA",                                  # 6  active
    "Цветы, подарки, романтическое оформление",      # 7  dev
    "Уборка, прачечная, доставка продуктов",         # 8  active
    "Ужин на вилле",                                 # 9  dev
    "Управлять бронированием",                       # 10 dev
    "Найти новое жилье",                             # 11 active
]
SERVICES_SET = set(SERVICES)

SERVICE_DEVELOPMENT = {
    "Самостоятельные путешествия",
    "Цветы, подарки, романтическое оформление",
    "Ужин на вилле",
    "Управлять бронированием",
}

# ---- Контакты ----
WA_LINK = "https://wa.me/79266084747"
MANAGER_PHONE = "+6282112345678"
MANAGER_WHATSAPP = "https://wa.me/6282112345678"

# ---- Открытые ссылки ----
VILLA_MAPS = "https://maps.app.goo.gl/AVosN1u5zHzREKsbA"
VILLA_ADDRESS = "Jl. Raya Gelogor, Lodtunduh, Kecamatan Ubud, Bali, 80571"

# ---- OpenRouter AI ----
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
OPENROUTER_URL = os.getenv(
    "OPENROUTER_URL", "https://openrouter.ai/api/v1/chat/completions"
)
OPENROUTER_TIMEOUT = float(os.getenv("OPENROUTER_TIMEOUT", "20"))