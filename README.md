# RentHome Bali — minimal premium frontend

Чистый HTML + CSS + JS, без сборки. Готов к Vercel.

## Локально
```bash
python -m http.server 8000
# http://localhost:8000
```

## Деплой на Vercel
Корень репозитория — чистая статика, деплоится без настроек: Framework Preset **Other**, Build Command пусто. `vercel.json` уже настроен. Root Directory должен быть пустым (`./`).

## Структура
- `index.html`, `css/`, `js/`, `data/` — сайт (деплой Vercel из корня)
- `vercel.json` — конфиг деплоя
- `bot/` — Telegram-бот Wayan (Python, в деплой не попадает)

## UI-принципы v3
Солидный минимализм: Ink #0A1628, 1 акцент, стеклянная шапка, сегмент-контроль Арендовать/Купить/Карта, карточки 20px radius с градиентом на фото, тихая типографика, пилюли-подборки, тёмная тема.
