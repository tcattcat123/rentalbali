# -*- coding: utf-8 -*-
"""Контент демо-бота: точные тексты заказчика."""

import os

# ============ Пути к медиа ============
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WAYAN_PHOTO = os.path.join(BASE_DIR, "wayan.jpg")
WAYAN_DRIVER_PHOTO = os.path.join(BASE_DIR, "wayan_driver.jpg")
WAYAN_BIKE_PHOTO = os.path.join(BASE_DIR, "wayan_bike.jpg")
WAYAN_RYUKZAK_PHOTO = os.path.join(BASE_DIR, "wayan_s_rykzakom.jpg")
WAYAN_FLOWERS_PHOTO = os.path.join(BASE_DIR, "cveti_eda_massge_wayan.jpg")
WAYAN_BROOM_PHOTO = os.path.join(BASE_DIR, "grusniy_wayan.jpg")
WAYAN_CONCIERGE_PHOTO = os.path.join(BASE_DIR, "konserg.jpg")
TRANSFER_PHOTO = os.path.join(BASE_DIR, "mem.jpg")
OPLATA_PHOTO = os.path.join(BASE_DIR, "oplata.jpg")
TURN_PHOTO = os.path.join(BASE_DIR, "povorot.jpg")
ARROWS_PHOTO = os.path.join(BASE_DIR, "tochka.jpg")
KEYS_PHOTO = os.path.join(BASE_DIR, "vhod.jpg")
UBORKA_PHOTO = os.path.join(BASE_DIR, "uborka.jpg")
QR_PHOTO = os.path.join(BASE_DIR, "qr.jpg")
MENU_PHOTO = os.path.join(BASE_DIR, "menu.jpg")
PRESENTATION_PDF = os.path.join(BASE_DIR, "WK_Concierge_Service_4_slides_updated.pdf")

PRESENTATION_BUTTON = "📄 Получить презентацию"

# ============ Константы ============
WA_LINK = "https://wa.me/79266084747"
MANAGER_PHONE = "+6282112345678"
MANAGER_WHATSAPP = "https://wa.me/6282112345678"
VILLA_MAP = "https://maps.app.goo.gl/SP2Ut75xRrYs7F9GA"
TURN_MAP = "https://maps.app.goo.gl/yBEbUQwUVdwRuVqU9"

# ============ Приветствие / телефон-гейт ============
WKS_PHOTO = os.path.join(BASE_DIR, "wks.jpg")

GREETING_TEXT = (
    "<b>Демонстрационный Al Concierge Service компании WK:</b>\n"
    "• Повышает рейтинг объектов ⭐️\n"
    "• Делает допродажи услуг и бронирования 🚀\n"
    "• Оптимизирует рутинные процессы 📈\n"
    "• Увеличивает эффективность и прибыль 💵\n\n"
    "Для пользования демонстрационной версией\n"
    "<b>WK-Concierge Service</b>, Вам необходимо поделиться своим номером телефона"
)

PHONE_BUTTON = "📱 Поделиться номером"

# ============ Меню (7 кнопок) ============
MENU_BUTTONS = [
    "Трансфер/аренда",
    "Подобрать тур",
    "Консьерж сервис",
    "Цветы, еда, массаж",
    "Управлять бронированием",
    "Забронировать новую виллу",
    "Персональное пожелание",
]

# Кнопки услуг в сценарии Заселения (Сообщение 5) — по ТЗ
CHECKIN_OFFER_BUTTONS = [
    "Трансфер/аренда",
    "Подобрать тур",
    "Купить билеты на острова",
    "Цветы, еда, массаж",
    "Управлять бронированием",
    "Забронировать новую виллу",
    "Персональное пожелание",
]

MENU_TEXT = "Что могу сделать для тебя:"

# Ответы по кнопкам меню
MENU_REPLIES = {
    "Трансфер/аренда": None,  # запускает flow трансфера
    "Подобрать тур": (
        "Подскажи, куда хочешь поехать: водопады, рисовые террасы, "
        "острова или храмы? Подберу тур и куплю билеты."
    ),
    "Купить билеты на острова": "Перенаправление на менеджера или сервис покупки билетов",
    "Цветы, еда, массаж": (
        "Могу украсить виллу цветами, подготовить романтический вечер, "
        "позвать массажиста или заказать еду. Что тебе нужно?"
    ),
    "Управлять бронированием": (
        "Помогу управлять бронированием: продлить, изменить даты или отменить. Что нужно сделать?"
    ),
    "Забронировать новую виллу": None,  # запускает flow бронирования
    "Персональное пожелание": "Напиши, что ты хочешь, — я все устрою!",
}

# ============ Менеджер ============
MANAGER_PHONE = "+6282146043729"
MANAGER_WHATSAPP = "https://wa.me/6282146043729"
MANAGER_NAME = "Ketut"

MANAGER_ASK = "Напиши свой вопрос, позову оперативно нужного менеджера."
MANAGER_REPLY = (
    "Вопрос отправил ссответвующему менеджеру, скоро он с тобой свяжется.\n"
    f"Вот его номер на всякий случай: {MANAGER_PHONE} и {MANAGER_WHATSAPP} {MANAGER_NAME}\n"
    "Могу еще что-то сделать для тебя?"
)

# ============ Сценарий: ЗАСЕЛЕНИЕ ============
CHECKIN_SCRIPT = [
    # 0: после бронирования в OTA
    {
        "text": (
            "Гость забронировал объект на площадке.\n\n"
            "Присылаем гостю автоматическое сообщение на email и в OTA:\n\n"
            "<b>Привет, спасибо за бронирование!\n"
            "Важно! Для завершения регистрации и получения информации по вашему "
            "бронированию и связи с менеджером- перейдите по ссылке:</b>\n\n"
            "https://wa.me/6282146043729 (Ссылка на бот)"
        ),
        "buttons": ["Далее"],
        "photo": None,
    },
    # 1: правила уведомлений (инфо для демо)
    {
        "text": (
            "1. До заезда более 7 дней:\n"
            "• Присылаем 1–2 письма на Email со ссылкой на бота;\n"
            "• Если гость не активировал ссылку, за 7 дней до заезда передаём "
            "менеджеру информацию по бронированию и показываем гостю, что "
            "менеджер должен связаться вручную.\n\n"
            "2. До заезда менее 7 дней:\n"
            "• Если ссылка не активирована в течение суток после бронирования, "
            "показываем, что менеджеру передано уведомление связаться с гостем "
            "вручную.\n\n"
            "3. До заезда менее 24 часов:\n"
            "• Если ссылка не активирована в течение часа, показываем, что "
            "менеджеру передано уведомление связаться с гостем вручную."
        ),
        "buttons": ["Далее"],
        "photo": None,
    },
    # 2: Wayan intro
    {
        "text": (
            "<b>Привет, я твой цифровой консьерж Wayan!\n"
            "Постараюсь сделать твое проживание комфортным!\n"
            "На связи 24/7.</b>"
        ),
        "buttons": ["Далее"],
        "photo": WAYAN_PHOTO,
    },
    # 3: Villa info
    {
        "text": (
            "<b>Ты будешь проживать на вилле Senja Villa\n"
            "Jl. Suweta 132-88,Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571\n"
            f"{VILLA_MAP}</b>\n\n"
            "Заезд в 2:00 pm\n"
            "Выезд в 12:00 pm\n\n"
            "Wi-FI:\n"
            "Senjavilla\n"
            "1234567\n\n"
            "Телефон менеджера:\n"
            "+628123456789 Ketut\n\n"
            "Код двери от виллы 7777"
        ),
        "buttons": ["Далее"],
        "photo": None,
    },
    # 4: Меню — текст + картинка menu.jpg + кнопка «Далее»
    {
        "text": (
            "<b>Что могу сделать для тебя:</b>\n\n"
            "• Встретить тебя в аэропорту или заказать трансфер 🚖\n"
            "• Забронировать авто, байк или личного водителя 🛵\n"
            "• Подобрать тур и купить билеты на острова 🌋\n"
            "• Украсить виллу цветами, подготовить романтический вечер 🥂\n"
            "• Позвать массажиста и забронировать SPA 🛁\n"
            "• Подобрать для тебя жилье со скидкой 10% в других районах Бали 🛖\n\n"
            "<b>Или напиши свое пожелание.</b>"
        ),
        "buttons": ["Далее"],
        "photo": MENU_PHOTO,
    },
    # 5: Ничего не нужно -> инфа + PDF
    {
        "text": (
            "<b>Если тебе ничего не требуется- все в порядке! 😊\n"
            "Получи информацию по заселению и правилам проживания.</b>\n\n"
            "Будет кнопка: <b>«Получить инфу»</b> — после чего бот присылает "
            "PDF-файл с гайдом по заселению."
        ),
        "buttons": ["Далее"],
        "photo": None,
    },
    # 6: Ранний заезд
    {
        "text": "<b>Нужен ли тебе ранний заезд?</b>",
        "buttons": ["Да", "Нет"],
        "photo": None,
    },
    # 7: Ранний заезд - Да
    {
        "text": (
            "Бот показывает, что проверяет бронирование и запрашивает подтверждение возможности "
            "раннего заезда у менеджера.\n\n"
            "После этого показывает гостю возможность раннего заезда.\n\n"
            "Дополнительно показывает, можно ли оставить багаж до стандартного "
            "времени заселения."
        ),
        "buttons": ["Далее"],
        "photo": None,
    },
    # 8: Помощь с заселением
    {
        "text": "<b>Тебе нужна помощь с заселением или ты готов самостоятельно заселиться?</b>",
        "buttons": ["Самостоятельно", "Нужна помощь"],
        "photo": None,
    },
    # 9: Самостоятельно - PDF гайд
    {
        "text": "Лови PDF-гайд по заселению, на случай если не будет интернета",
        "buttons": ["Далее"],
        "photo": None,
        "document": "guide.pdf",  # имитация
    },
    # 10: Самостоятельно - маршрут до поворота
    {
        "text": (
            "Проложи маршрут до поворота к вилле Senja Villa:\n"
            f"{TURN_MAP}"
        ),
        "buttons": ["Я на месте"],
        "photo": None,
    },
    # 11: На месте - фото точки и поворота
    {
        "text": "Далее тебе сюда",
        "buttons": ["Уже здесь"],
        "photo": None,
        "photos": [ARROWS_PHOTO, TURN_PHOTO],
    },
    # 12: Ключи
    {
        "text": "Ключи здесь:",
        "buttons": ["Я заселился"],
        "photo": KEYS_PHOTO,
    },
    # 13: Заселен
    {
        "text": (
            "guest_checked_in = true\n"
            "Время заселения сохранено.\n"
            "Менеджер получил уведомление о заселении"
        ),
        "buttons": ["Далее"],
        "photo": None,
        "jump": {"Далее": 17},
    },
    # 14: Нужна помощь - встреча
    {
        "text": (
            "<b>Хорошо, я предупрежу стафф, чтобы тебя встретили.\n"
            "Во сколько ты прибудешь?</b>"
        ),
        "buttons": None,  # свободный ввод времени
        "photo": None,
        "collect": "arrival_time",
    },
    # 15: Нужна помощь - чемоданы
    {
        "text": (
            "<b>Будут ли у тебя тяжелые чемоданы?\n"
            "Или напиши какая нужна помощь.</b>"
        ),
        "buttons": None,  # свободный ввод
        "photo": None,
        "collect": "luggage_help",
    },
    # 16: Нужна помощь - подтверждение
    {
        "text": (
            "<b>Хорошо, мы тебя встретим!\n"
            "Адрес: Senja Villa\n"
            "Jl. Suweta 132-88,Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571\n"
            f"{VILLA_MAP}</b>\n\n"
            "<b>Сообщи пожалуйста за 10-15 минут</b>"
        ),
        "buttons": ["Буду через 10 минут"],
        "photo": None,
        "end": True,
    },
]

# ============ Сценарий: ПРОЖИВАНИЕ ============
STAY_SCRIPT = [
    # 17: QR info
    {
        "text": (
            "На объекте размещается QR-код со ссылкой на бота.\n\n"
            "После заселения или активации бота запускается сценарий проживания.\n\n"
            "В меню добавляется кнопка:\n"
            "<b>«Консьерж сервис»</b>"
        ),
        "buttons": ["Далее"],
        "photo": QR_PHOTO,
    },
    # 18: Правила
    {
        "text": (
            "<b>Добро пожаловать, или как говорят на Бали:\n"
            "Selamat datang!</b>\n\n"
            "Напомню правила проживания:\n"
            "• Выезд у нас до 12:00.\n"
            "• Нельзя шуметь после 23:00.\n"
            "• Нельзя курить в постели.\n"
            "• Портить мебель\n"
            "• Устраивать пенные вечеринки 🎉"
        ),
        "buttons": ["Принял"],
        "photo": None,
    },
    # 19: Что можно
    {
        "text": (
            "<b>Зато можно:</b>\n"
            "• Наслаждаться атмосферой 💫\n"
            "• Заказать массаж, еду, напитки 🥂\n"
            "• Вызвать уборку или менеджер 🛎️\n"
            "• Забронировать столик в ресторане\n"
            "• Записаться на падл 🏓\n"
            "• Подобрать тур, заказать 🏕️\n"
            "• Трансфер или аренду авто и байка 🛵\n"
            "• Продлить бронирование 🏘️\n\n"
            "<b>Все это найдешь в \"Меню виллы\"\n\n"
            "Или напиши мне свое пожелание, я постараюсь его реализовать.</b>"
        ),
        "buttons": ["Далее", "Меню виллы"],
        "photo": None,
    },
    # 20: Проверки через час / утром
    {
        "text": (
            "Через час после заселения, но не позднее 22:00, бот спрашивает:\n"
            "<b>«Всё ли у тебя хорошо? Могу ли я улучшить что-то?»</b>\n\n"
            "Если после заселения уже позднее 22:00 — спросить в 9:00 следующего утра.\n\n"
            "Утром в 9:00 спросить:\n"
            "<b>«Как прошла твоя ночь?»</b>\n\n"
            "Если гость не прошёл регистрацию — просит пройти регистрацию."
        ),
        "buttons": ["Далее"],
        "photo": None,
    },
    # 21: Каждые 3 дня
    {
        "text": (
            "Во время длительного проживания бот спрашивает каждые 3 дня:\n"
            "<b>«Как проходит твое проживание? Могу ли я что-то улучшить?»</b>\n\n"
            "Если гость сообщает о проблеме, жалобе, неисправности или другой "
            "ситуации, требующей участия менеджера:\n\n"
            "1. Вежливо подтверждает, что понял проблему.\n"
            "2. Показывает, что информация передана менеджеру.\n"
            "3. Не заставлять гостя повторять информацию.\n"
            "4. Продолжает диалог в соответствии с ситуацией.\n\n"
            "Например:\n"
            "<b>«Понял тебя. Я передал информацию менеджеру, он займётся этим вопросом.»</b>"
        ),
        "buttons": ["Далее"],
        "photo": None,
    },
    # 22: Уборка каждый день 9:00
    {
        "text": (
            "Каждый день в 9:00 бот спрашивает:\n\n"
            "<b>«Сегодня у тебя уборка, во сколько прийти стаффу?»</b>\n\n"
            "Бот фиксирует время и передает уборщице и менеджеру."
        ),
        "buttons": ["Уборка сегодня не нужна"],
        "photo": UBORKA_PHOTO,
        "collect": "cleaning_time",
        "not_needed_photo": WAYAN_BROOM_PHOTO,
    },
    # 23: Проактивное предложение
    {
        "text": (
            "<b>Организовать для тебя что-нибудь?</b>\n\n"
            "Напомню, что могу:\n"
            "• Составить тебе маршрут\n"
            "• Заказать столик в ресторане\n"
            "• Cбегать за лавандовым рафом.\n\n"
            "Я на связи, напиши что нужно 😎"
        ),
        "buttons": ["Далее"],
        "photo": None,
        "end": True,
    },
]

# ============ Сценарий: ВЫЕЗД ============
CHECKOUT_SCRIPT = [
    # 24: Опрос за 20ч / утром
    {
        "text": (
            "При проживании более двух дней за 20 часов до выезда бот спросит гостя, "
            "как проходит его проживание.\n\n"
            "При проживании менее суток — спрашивает в 9:00 утра перед выездом.\n\n"
            "Если гость сообщает, что проживание проходит не очень:\n"
            "• собирает информацию;\n"
            "• показывает, что информация передана менеджеру для исправления ситуации."
        ),
        "buttons": ["Далее"],
        "photo": None,
    },
    # 25: Время выезда и помощь
    {
        "text": "Спрашивает время выезда и нужна ли помощь с выездом.",
        "buttons": ["Нужна помощь", "Помощь не нужна"],
        "photo": None,
        "collect": "checkout_time",
        "jump": {"Помощь не нужна": 27},
    },
    # 26: Помощь с выездом
    {
        "text": "<b>Напиши с чем помочь</b> — Бот собирает информацию и передает менеджеру и стаффу",
        "buttons": ["Далее"],
        "photo": None,
        "collect": "checkout_help",
    },
    # 27: После выезда + 3 дня
    {
        "text": (
            "После выезда в 12:30 и если гость не ответил, то через 3 дня бот отправляет сообщение:\n\n"
            "<b>Спасибо за проживание в Senja Vila!\n"
            "Поделись пожалуйста как прошло твое проживание?</b>\n\n"
            "⭐️⭐️⭐️⭐️⭐"
        ),
        "buttons": ["Далее"],
        "photo": None,
    },
    # 28: Оценка
    {
        "text": (
            "Если <b>3 звезды и меньше</b> — вопрос передается менеджеру для выяснения "
            "и изменения ситуации.\n\n"
            "Если <b>4+</b>:\n"
            "<b>Я рад, что тебе понравилось проживание! Оставь пожалуйста отзыв "
            "(ссылка на площадку)</b>"
        ),
        "buttons": ["Далее"],
        "photo": None,
    },
    # 29: Скидка 10%
    {
        "text": (
            "<b>Дарю тебе скидку 10% на следующее бронирование или на все наши "
            "виллы в Uluwatu, Canggu, Ubud, Sanur! Прислать тебе варианты?</b>"
        ),
        "buttons": ["Прислать варианты", "Меню"],
        "photo": None,
        "end": True,
    },
]

# ============ Утилиты ============
DEV_MESSAGE = "Раздел в разработке, выбери другой сценарий"


def _strip_end(script):
    """Копирует скрипт, убирая флаг end (кроме последнего шага)."""
    out = []
    for i, node in enumerate(script):
        n = dict(node)
        n.pop("end", None)
        out.append(n)
    out[-1]["end"] = True
    return out


# Единый линейный скрипт из 29 шагов: заселение -> проживание -> выезд
FULL_SCRIPT = (
    _strip_end(CHECKIN_SCRIPT)
    + _strip_end(STAY_SCRIPT)
    + _strip_end(CHECKOUT_SCRIPT)
)

# Трансфер flow (people -> luggage -> time -> from -> to)
TRANSFER_STEPS = [
    ("people", "У нас есть отличные машины! Сколько человек поедет?"),
    ("luggage", "Сколько больших чемоданов?"),
    ("time", "Во сколько тебя забрать?"),
    ("pickup", "Напиши название виллы или места, откуда тебя забрать."),
    ("dest", "Куда поедешь?"),
]

# Бронирование flow (area -> dates -> guests -> options)
BOOKING_STEPS = [
    ("area", "Напиши район, где подобрать виллу. Например, Чангу, Нуану, Санур, Убуд."),
    ("dates", "На какие даты?"),
    ("guests", "Сколько человек будет проживать?"),
]

VILLAS = {
    "Чангу": ["Villa Palm Canggu", "Villa Surf Canggu", "Villa Oasis Canggu"],
    "Убуд": ["Senja Villa", "Villa Bintang", "Villa Sweet"],
    "Санур": ["Villa Sunrise Sanur"],
    "Улувату": ["Villa Uluwatu", "Villa Cliff"],
    "Кинтамани": ["Villa Kintamani", "Villa Volcano"],
    "Амед": ["Villa Amed", "Villa Reef"],
}

# Папки с фото вилл по районам
AREA_FOLDERS = {
    "Чангу": "canggu",
    "Санур": "sanur",
    "Убуд": "ubud",
    "Улувату": "uluwatu",
    "Кинтамани": "kintomani",
    "Амед": "amed",
}

# ============ Новый flow: ЗАБРОНИРОВАТЬ НОВУЮ ВИЛЛУ (по ТЗ) ============
BOOKING_NEW_INTRO = (
    "Дарю тебе скидку 10% на все наши виллы!\n"
    "Сейчас подберем для тебя лучшие варианты!\n"
    "Выбери район или напиши название района"
)

BOOKING_AREAS = ["Чангу", "Санур", "Убуд", "Улувату", "Кинтамани", "Амед"]

BOOKING_AREA_UNKNOWN = (
    "В этом районе не нашел свободных вариантов. "
    "Могу поискать на Booking.com (по риферальной ссылке)."
)

BOOKING_ASK_DATES = "Напиши дату заселения и на сколько дней?"
BOOKING_ASK_GUESTS = "Сколько человек будет проживать?"
BOOKING_VARIANTS_INTRO = "На эти даты доступны следующие варианты:"

# Фиксированная инфа под "Выбрать"
BOOKING_CONFIRM_TEXT = (
    'Ты бронируешь виллу "Best Choise".\n'
    "2 комнаты, туалет на улице, общий душ.\n"
    "Даты: {dates}\n"
    "Стоимость за 4 ночи: 7.000.0000 IDR"
)

BOOKING_PAYMENT_TEXT = "Твое бронирование оплачено!\nЗаказать тебе трансфер с нашей скидкой? Или могу прислать что есть интересное рядом с виллой."
BOOKING_POST_PAY_BUTTONS = ["Заказать трансфер", "Что рядом с виллой"]

BOOKING_NEARBY_TEXT = (
    "Гостю будут предложены варианты что посмотреть и посетить рядом с виллой, "
    "ближайшие достопримечательности и возможность записаться, "
    "забронировать посещение по реферальной скидке."
)

# ============ ТРАНСПОРТ: меню ============
TRANSPORT_INTRO = "Давай прокатимся с ветерком!\nВыбери, что нужно:"
TRANSPORT_BUTTONS = ["Трансфер", "Аренда авто или мото", "Личный водитель"]

# ============ ТРАНСФЕР (демо) ============
TRANSFER_ACCEPTED = (
    "Заявка на трансфер принята!\n"
    "Стоимость поездки: 500.000 IDR\n"
    "Водитель Made свяжется с вами: +628212345678"
)

# ============ АРЕНДА АВТО/БАЙКА ============
RENTAL_INTRO = (
    "У меня есть отличные варианты для тебя:"
)
RENTAL_CARS = [
    {"name": "Toyota Agya", "price": "350,000 IDR/день", "seats": "5 мест", "photo": "toyota_agya.jpg"},
    {"name": "Toyota Avanza", "price": "300,000 IDR/день", "seats": "7 мест", "photo": "car_avanza.jpg"},
    {"name": "Toyota Fortuner", "price": "400,000 IDR/день", "seats": "7 мест", "photo": "toyota_fortuner.jpg"},
]

RENTAL_BIKES = [
    {"name": "Honda Vario 150", "price": "80,000 IDR/день", "type": "Скутер", "photo": "bike_vario.jpg"},
    {"name": "Yamaha NMAX 155", "price": "120,000 IDR/день", "type": "Скутер", "photo": "nmax155.jpg"},
    {"name": "Yamaha XMAX 250", "price": "100,000 IDR/день", "type": "Скутер", "photo": "xmax250.jpg"},
]

# ============ АРЕНДА (демо) ============
RENTAL_ACCEPTED = "Заявка на аренду принята! Менеджер свяжется с вами для подтверждения деталей."

# ============ ЛИЧНЫЙ ВОДИТЕЛЬ (демо) ============
DRIVER_ACCEPTED = "Заявка на личного водителя принята! Менеджер свяжется с вами для подтверждения деталей."

# ============ ЛИЧНЫЙ ВОДИТЕЛЬ ============
DRIVER_INTRO = "Давай подберем водителя! Сколько будет человек?"
DRIVER_ASK_DAYS = "Напиши на сколько дней тебе нужна машина?"
DRIVER_ASK_WHEN = "Когда выезжаем?"
DRIVER_CONFIRM = (
    "Договорился с водителем! Он будет рад покатать вас по острову!\n"
    "Подтверждаешь заказ?"
)
DRIVER_PAY_BUTTON = "Подтвердить и оплатить"
DRIVER_PAYMENT_PHOTO = "[Фото: Ввести платежные данные]"
DRIVER_PAID = "Оплата прошла успешно, водитель забронирован! (Заявка уходит в прокат)"

# ============ ЭКСКУРСИИ ============
TOURS_INTRO_1 = "Возьмешь меня с собой?"
TOURS_INTRO_2 = "Да ладно, я и так всегда с тобой!)\nДавай выберем куда поедем:"
TOURS_CATEGORIES = ["Туры в чате", "Отдельные места в чате", "Самостоятельные путешествия"]

TOURS_DEV = "Я пока самостоятельно исследую маршруты, как будет готово, возьму тебя с собой! Раздел находится в разработке"

TOURS_LIST = [
    {
        "id": "batur",
        "title": "🌋 Sunrise at Mount Batur",
        "details": (
            "<b>🌋 Sunrise at Mount Batur</b>\n\n"
            "🕐 <b>02:00 AM</b> — hotel pick-up\n"
            "🥾 <b>2–3 hours</b> — trek to the summit\n"
            "🌅 Sunrise & panoramic views\n"
            "🏠 <b>~12:00 PM</b> — return to hotel\n\n"
            "🎒 <b>Bring:</b> sneakers, warm jacket, headlamp, water & snack.\n"
            "☕ Hot tea & coffee available at the summit.\n\n"
            "💰 <b>1,000,000 IDR / pair</b>\n"
            "Local guide included."
        ),
        "photo": "tour_batur.jpg",
        "price": "1,000,000 IDR / pair",
    },
    {
        "id": "ijen",
        "title": "🌋 Ijen Volcano — 2-Day Tour",
        "details": (
            "<b>🌋 Ijen Volcano — 2-Day Tour</b>\n\n"
            "🗓 2 days / 1 night\n"
            "🌋 Blue Fire & Crater Lake\n"
            "🏠 1 night accommodation\n"
            "👨‍🏫 Local guide included\n"
            "🍽 Meals & drinks included\n\n"
            "🎒 Bring: warm clothes, trekking shoes, headlamp, water & personal essentials.\n"
            "😷 Gas mask / respirator — required for the sulfur area (provided by the tour operator).\n\n"
            "💰 <b>1,500,000 IDR / person</b>\n"
            "Hotel transfer available."
        ),
        "photo": "tour_ijen.jpg",
        "price": "1,500,000 IDR / person",
    },
    {
        "id": "sekumpul",
        "title": "🌿 Sekumpul Waterfall Tour",
        "details": (
            "<b>🌿 Sekumpul Waterfall Tour</b>\n\n"
            "🕐 Full-day tour\n"
            "🥾 Trek through tropical jungle to the waterfall\n"
            "💦 Swimming & refreshing in the natural pools\n"
            "👨‍🏫 Local guide included\n"
            "📸 Amazing photo spots\n\n"
            "🎒 Bring: comfortable shoes, swimwear, towel, water & sunscreen.\n"
            "🌧️ The trail can be slippery after rain.\n\n"
            "💰 <b>800,000 IDR / person</b>\n"
            "Hotel transfer available."
        ),
        "photo": "tour_sekumpul.jpg",
        "price": "800,000 IDR / person",
    },
    {
        "id": "jatiluwih",
        "title": "🌾 Jatiluwih Rice Terraces Tour",
        "details": (
            "<b>🌾 Jatiluwih Rice Terraces Tour</b>\n\n"
            "🕐 Full-day tour\n"
            "🌿 Explore Bali’s iconic rice terraces\n"
            "👨‍🏫 Local guide included\n"
            "📸 Scenic views & photo spots\n"
            "☕ Refreshments included\n\n"
            "🎒 Bring: comfortable shoes, hat, sunscreen, water & light clothes.\n"
            "🌦️ The weather can change quickly — bring a light rain jacket.\n\n"
            "💰 <b>800,000 IDR / person</b>\n"
            "Hotel transfer available."
        ),
        "photo": "tour_jatiluwih.jpg",
        "price": "800,000 IDR / person",
    },
    {
        "id": "besakih",
        "title": "🛕 Besakih Temple Tour",
        "details": (
            "<b>🛕 Besakih Temple Tour</b>\n\n"
            "🕐 Full-day tour — 8–10 hours\n"
            "🏛️ Bali’s largest and holiest temple complex\n"
            "🌋 Stunning views of Mount Agung\n"
            "👨‍🏫 Local guide included\n"
            "📸 Culture, history & photo spots\n\n"
            "🎒 Bring: comfortable clothes, walking shoes, sunscreen & water.\n"
            "🙏 Wear respectful clothing — shoulders and knees should be covered.\n\n"
            "💰 <b>700,000 IDR / person</b>\n"
            "Entrance fee & guide included.\n"
            "🚗 Hotel transfer available."
        ),
        "photo": "tour_besakih.jpg",
        "price": "700,000 IDR / person",
    },
    {
        "id": "manta",
        "title": "🌊 Manta Point — Nusa Penida",
        "details": (
            "<b>🌊 Manta Point — Nusa Penida</b>\n\n"
            "🕐 Full-day private boat tour\n"
            "🐠 Snorkeling with manta rays\n"
            "🚤 Private boat — up to 10 people\n"
            "🤿 Snorkeling gear included\n"
            "☕ Hot tea on the boat\n\n"
            "🎒 Bring: food/snacks, towel, swimwear & warm clothes.\n"
            "🌊 The sea can be cool and windy, so warm clothing is recommended.\n\n"
            "💰 <b>8,000,000 IDR / private boat</b>\n"
            "Up to 10 people."
        ),
        "photo": "tour_nusapenida.jpg",
        "price": "8,000,000 IDR / private boat",
    },
]

PLACES_CATEGORIES = [
    ("Горы и вулканы", ["Батур", "Иджен"]),
    ("Водопады и рисовые поля", ["Секумпул", "Рисовые терассы"]),
    ("Храмы и церемонии", ["Бесаких"]),
    ("Острова", ["Нуса Пенида"]),
]

PLACES_DETAILS = {
    "Батур": (
        "<b>🌋 Sunrise at Mount Batur</b>\n\n"
        "🕐 <b>02:00 AM</b> — hotel pick-up\n"
        "🥾 <b>2–3 hours</b> — trek to the summit\n"
        "🌅 Sunrise & panoramic views\n"
        "🏠 <b>~12:00 PM</b> — return to hotel\n\n"
        "🎒 <b>Bring:</b> sneakers, warm jacket, headlamp, water & snack.\n"
        "☕ Hot tea & coffee available at the summit.\n\n"
        "💰 <b>1,000,000 IDR / pair</b>\n"
        "Local guide included.",
        "tour_batur.jpg",
    ),
    "Иджен": (
        "<b>🌋 Ijen Volcano — 2-Day Tour</b>\n\n"
        "🗓 2 days / 1 night\n"
        "🌋 Blue Fire & Crater Lake\n"
        "🏠 1 night accommodation\n"
        "👨‍🏫 Local guide included\n"
        "🍽 Meals & drinks included\n\n"
        "🎒 Bring: warm clothes, trekking shoes, headlamp, water & personal essentials.\n"
        "😷 Gas mask / respirator — required for the sulfur area (provided by the tour operator).\n\n"
        "💰 <b>1,500,000 IDR / person</b>\n"
        "Hotel transfer available.",
        "tour_ijen.jpg",
    ),
    "Секумпул": (
        "<b>🌿 Sekumpul Waterfall Tour</b>\n\n"
        "🕐 Full-day tour\n"
        "🥾 Trek through tropical jungle to the waterfall\n"
        "💦 Swimming & refreshing in the natural pools\n"
        "👨‍🏫 Local guide included\n"
        "📸 Amazing photo spots\n\n"
        "🎒 Bring: comfortable shoes, swimwear, towel, water & sunscreen.\n"
        "🌧️ The trail can be slippery after rain.\n\n"
        "💰 <b>800,000 IDR / person</b>\n"
        "Hotel transfer available.",
        "tour_sekumpul.jpg",
    ),
    "Рисовые терассы": (
        "<b>🌾 Jatiluwih Rice Terraces Tour</b>\n\n"
        "🕐 Full-day tour\n"
        "🌿 Explore Bali’s iconic rice terraces\n"
        "👨‍🏫 Local guide included\n"
        "📸 Scenic views & photo spots\n"
        "☕ Refreshments included\n\n"
        "🎒 Bring: comfortable shoes, hat, sunscreen, water & light clothes.\n"
        "🌦️ The weather can change quickly — bring a light rain jacket.\n\n"
        "💰 <b>800,000 IDR / person</b>\n"
        "Hotel transfer available.",
        "tour_jatiluwih.jpg",
    ),
    "Бесаких": (
        "<b>🛕 Besakih Temple Tour</b>\n\n"
        "🕐 Full-day tour — 8–10 hours\n"
        "🏛️ Bali’s largest and holiest temple complex\n"
        "🌋 Stunning views of Mount Agung\n"
        "👨‍🏫 Local guide included\n"
        "📸 Culture, history & photo spots\n\n"
        "🎒 Bring: comfortable clothes, walking shoes, sunscreen & water.\n"
        "🙏 Wear respectful clothing — shoulders and knees should be covered.\n\n"
        "💰 <b>700,000 IDR / person</b>\n"
        "Entrance fee & guide included.\n"
        "🚗 Hotel transfer available.",
        "tour_besakih.jpg",
    ),
    "Улувату": (
        "<b>🌅 Uluwatu Temple Tour</b>\n\n"
        "🕐 Full-day tour\n"
        "🏛️ Cliff-top temple with ocean views\n"
        "💃 Kecak fire dance at sunset\n"
        "👨‍🏫 Local guide included\n\n"
        "🎒 Bring: comfortable clothes, walking shoes, sunscreen & water.\n"
        "🙏 Wear respectful clothing — shoulders and knees should be covered.\n\n"
        "💰 <b>700,000 IDR / person</b>\n"
        "Entrance fee & guide included.\n"
        "🚗 Hotel transfer available.",
        "tour_besakih.jpg",
    ),
    "Нуса Пенида": (
        "<b>🌊 Manta Point — Nusa Penida</b>\n\n"
        "🕐 Full-day private boat tour\n"
        "🐠 Snorkeling with manta rays\n"
        "🚤 Private boat — up to 10 people\n"
        "🤿 Snorkeling gear included\n"
        "☕ Hot tea on the boat\n\n"
        "🎒 Bring: food/snacks, towel, swimwear & warm clothes.\n"
        "🌊 The sea can be cool and windy, so warm clothing is recommended.\n\n"
        "💰 <b>8,000,000 IDR / private boat</b>\n"
        "Up to 10 people.",
        "tour_nusapenida.jpg",
    ),
    }

TOUR_PAYMENT_PHOTO = "[Фото: Ввести платежные данные]"
TOUR_PAID = "Тур забронировал! Скоро с тобой свяжется менеджер!"

# ============ WELLNESS ============
WELLNESS_INTRO = "Давай сделаем по красоте!"
WELLNESS_CATEGORIES = [
    "Цветы",
    "Массаж",
    "Еда и напитки",
    "Романтический ужин",
    "Повар на виллу",
    "Йога и медитация",
    "Spa",
]

WELLNESS_DEV = "Отправил заявку менеджеру. Разделы в разработке!"

# Вопросы для уточнения параметров по каждой услуге
WELLNESS_QUESTIONS = {
    "Цветы": "Что украсить и на какой день? Есть ли предпочтения по цветам?",
    "Массаж": "Какой массаж и на сколько времени? Во сколько удобно?",
    "Еда и напитки": "Что хотелось бы заказать? На сколько человек и на какое время?",
    "Романтический ужин": "На какую дату и сколько человек? Есть ли особые пожелания по меню и декору?",
    "Повар на виллу": "На какой день нужен повар? На сколько человек и какая кухня интересна?",
    "Йога и медитация": "На какой день и время? Сколько человек и какой уровень подготовки?",
    "Spa": "Какие SPA-процедуры интересны? На какой день и время?",
}

# ============ КОНСЬЕРЖ-СЕРВИС ============
CONCIERGE_INTRO = "Так, я готов оперативно тебе предложить:"
CONCIERGE_CATEGORIES = [
    "Уборка",
    "Стирка",
    "Сбегать куда-нибудь",
]

CONCIERGE_CLEANING_DONE = "Хорошо, я передал запрос стаффу."
CONCIERGE_LAUNDRY_DONE = "Хорошо, я передал запрос стаффу."
CONCIERGE_RUN_ASK = "Конечно. Что тебе нужно купить или забрать?"
CONCIERGE_RUN_DONE = "Уже бегу!"

# ============ УПРАВЛЯТЬ БРОНИРОВАНИЕМ ============
BOOKING_MANAGE_INTRO = "Так, так, что меняем?"
BOOKING_MANAGE_CATEGORIES = [
    "Продлить проживание",
    "Уехать раньше",
]

BOOKING_EXTEND_DONE = "Да, ты можешь продлить бронирование, стоимость 1.800.000 IDR."
BOOKING_EXTEND_PAY = "Гостю будет отправлена информация по продлению и кнопка оплаты."
BOOKING_EARLY_DONE = "Запрос передал в службу бронирования, скоро с тобой свяжется менеджер!"