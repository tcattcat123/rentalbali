# RentHome Bali — minimal premium frontend

Чистый HTML + CSS + JS, без сборки. Готов к Vercel.

## Локально
```bash
cd renthome-bali
python -m http.server 8000
# http://localhost:8000
```

## Деплой на Vercel (2 минуты)
1. Залей папку `renthome-bali` в GitHub (корень репозитория = эта папка) или импортируй весь проект и выбери Root Directory = `renthome-bali`.
2. В Vercel: Add New → Project → Import → Framework Preset: **Other** → Build Command: пусто → Output: `.`
3. Deploy. `vercel.json` уже настроен (cleanUrls, кэш статики).

CLI:
```bash
npm i -g vercel
cd renthome-bali
vercel --prod
```

## Структура
- `index.html` — каталог / карта / избранное / профиль, hero, фильтры, подборки, хлебные крошки
- `css/style.css` — дизайн-система v3: Manrope, токены, тёмная тема, адаптив 3/2/1
- `js/app.js` — 20 объявлений (rent/sale × offer/request), фильтры + «Расширенный», сортировка, пагинация, карусель, избранное, Leaflet, RU/EN, IDR/USD
- `data/listings.json` — моки для будущего API
- `vercel.json` — конфиг деплоя

## UI-принципы v3
Солидный минимализм: Ink #0A1628, 1 акцент, стеклянная шапка, сегмент-контроль Арендовать/Купить/Карта, карточки 20px radius с градиентом на фото, тихая типографика, пилюли-подборки, тёмная тема.
