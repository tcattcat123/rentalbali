# -*- coding: utf-8 -*-
"""Клавиатуры бота."""

from aiogram.types import KeyboardButton, ReplyKeyboardMarkup, ReplyKeyboardRemove

from content import (
    MENU_BUTTONS,
    PHONE_BUTTON,
    BOOKING_AREAS,
    RENTAL_CARS,
    RENTAL_BIKES,
    TOURS_LIST,
    PLACES_CATEGORIES,
    PLACES_DETAILS,
    WELLNESS_CATEGORIES,
    CONCIERGE_CATEGORIES,
    BOOKING_MANAGE_CATEGORIES,
    TRANSPORT_BUTTONS,
)

BACK = "↩ Назад"
CONCIERGE = "🛎 Консьерж сервис"

# Постоянные кнопки (всегда внизу)
# Ряд 1: две короткие кнопки
# Ряд 2: длинная кнопка презентации на всю ширину
# Ряд 3: кнопка «Назад» (откат на 1 шаг)
PERSISTENT_KEYS = [
    [KeyboardButton(text="📞 Связь с менеджером"), KeyboardButton(text="📋 Меню")],
    [KeyboardButton(text="📄 Получить презентацию")],
    [KeyboardButton(text="↩ Назад")],
]

# Минимальное меню (до прохождения сценария): только 2 кнопки
MINIMAL_KEYS = [
    [KeyboardButton(text="📞 Связь с менеджером"), KeyboardButton(text="📄 Получить презентацию")],
]


def phone_kb():
    """Запрос контакта."""
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text=PHONE_BUTTON, request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


def main_menu_kb():
    """Полное постоянное меню: Связь/Меню + презентация + Назад."""
    return ReplyKeyboardMarkup(
        keyboard=PERSISTENT_KEYS,
        resize_keyboard=True,
    )


def main_menu_minimal_kb():
    """Минимальное меню (до сценария): только Связь + Презентация."""
    return ReplyKeyboardMarkup(
        keyboard=MINIMAL_KEYS,
        resize_keyboard=True,
    )


def menu_kb(concierge: bool = False):
    """Инлайн меню: 7 кнопок услуг."""
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    rows = [[InlineKeyboardButton(text=b, callback_data=f"menu_service:{b}")] for b in MENU_BUTTONS]
    if concierge:
        rows.insert(0, [InlineKeyboardButton(text=CONCIERGE, callback_data="menu_service:Консьерж сервис")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def concierge_kb():
    """Инлайн кнопки для Консьерж-сервиса."""
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Уборка", callback_data="concierge:cleaning")],
            [InlineKeyboardButton(text="Стирка", callback_data="concierge:laundry")],
            [InlineKeyboardButton(text="Сбегать куда-нибудь", callback_data="concierge:run")],
        ]
    )


def next_kb():
    """Инлайн кнопка «Далее»."""
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="Далее", callback_data="next:checkin")]]
    )


def scenario_kb(buttons):
    """Контекстные кнопки шага сценария (Reply)."""
    rows = [[KeyboardButton(text=b)] for b in buttons]
    return ReplyKeyboardMarkup(keyboard=rows, resize_keyboard=True)


def scenario_inline_kb(buttons):
    """Инлайн кнопки шага сценария (Inline)."""
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    if not buttons:
        return InlineKeyboardMarkup(inline_keyboard=[])
    rows = [[InlineKeyboardButton(text=b, callback_data=f"checkin:{b}")] for b in buttons]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def collect_kb():
    """Свободный ввод: не изменять клавиатуру, оставить текущую."""
    return None


def area_kb():
    """Инлайн-клавиатура с 6 районами для бронирования."""
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    rows = [[InlineKeyboardButton(text=a, callback_data=f"booking_area:{a}")] for a in BOOKING_AREAS]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def variant_inline_kb(villa_name: str):
    """Inline-кнопка «Выбрать» под карточкой виллы."""
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="Выбрать", callback_data=f"select_villa:{villa_name}")]]
    )


def payment_kb():
    """Инлайн-кнопка «К оплате» после выбора виллы."""
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="К оплате", callback_data="booking_to_pay")]]
    )


def payment_pay_kb():
    """Инлайн-кнопка «Оплатить» на фото оплаты."""
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="Оплатить", callback_data="booking_pay")]]
    )


def post_pay_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Заказать трансфер", callback_data="booking_post_transfer")],
            [InlineKeyboardButton(text="Что рядом с виллой", callback_data="booking_post_nearby")],
        ]
    )


# ============ Inline клавиатуры ============

def menu_inline_btn():
    """Inline-кнопка «Меню» для выхода из мастера."""
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="📋 Меню", callback_data="back:main_menu")]]
    )


def rental_type_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Авто", callback_data="rental_type:car")],
            [InlineKeyboardButton(text="Байк", callback_data="rental_type:bike")],
        ]
    )


def rental_items_kb(items: list, prefix: str):
    """Inline-кнопки «Выбрать» под карточками авто/байка."""
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    rows = [
        [InlineKeyboardButton(text="Выбрать", callback_data=f"{prefix}:{item['name']}")]
        for item in items
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def rental_confirm_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Забронировать", callback_data="rental_book")],
        ]
    )


def rental_pay_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Оплатить", callback_data="rental_pay")],
        ]
    )


def driver_confirm_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Подтвердить и оплатить", callback_data="driver_pay")],
        ]
    )


def driver_pay_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Оплатить", callback_data="driver_pay_done")],
        ]
    )


def tours_categories_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Туры", callback_data="tours_cat:tours")],
            [InlineKeyboardButton(text="Отдельные места", callback_data="tours_cat:places")],
            [InlineKeyboardButton(text="Самостоятельные путешествия", callback_data="tours_cat:independent")],
        ]
    )


def tours_list_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    rows = [
        [InlineKeyboardButton(text="Подробнее", callback_data=f"tour_detail:{tour['id']}")]
        for tour in TOURS_LIST
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def tour_card_kb(tour_id: str):
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="Подробнее", callback_data=f"tour_detail:{tour_id}"),
                InlineKeyboardButton(text="Заказать", callback_data=f"tour_order:{tour_id}"),
            ]
        ]
    )


def tour_order_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Заказать", callback_data="tour_order")],
        ]
    )


def tour_pay_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="Оплатить", callback_data="tour_pay")]]
    )


def places_categories_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    rows = [
        [InlineKeyboardButton(text=cat, callback_data=f"places_cat:{cat}")]
        for cat, _ in PLACES_CATEGORIES
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def places_items_kb(items: list):
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    item = items[0] if items else ""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="Подробнее", callback_data=f"place_detail:{item}"),
                InlineKeyboardButton(text="Оплатить", callback_data=f"place_pay:{item}"),
            ]
        ]
    )


def place_order_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Оплатить", callback_data="place_order")],
        ]
    )


def place_pay_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Оплатить", callback_data="place_pay_confirm")],
        ]
    )


def transport_menu_kb():
    """Транспортное меню: инлайн-кнопки."""
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Трансфер", callback_data="transport:transfer")],
            [InlineKeyboardButton(text="Аренда авто или мото", callback_data="transport:rental")],
            [InlineKeyboardButton(text="Личный водитель", callback_data="transport:driver")],
        ]
    )


def wellness_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    rows = [[InlineKeyboardButton(text=c, callback_data=f"wellness:{c}")] for c in WELLNESS_CATEGORIES]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def booking_manage_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    mapping = {
        "Продлить проживание": "booking_manage:extend",
        "Уехать раньше": "booking_manage:early",
    }
    rows = [
        [InlineKeyboardButton(text=c, callback_data=mapping[c])]
        for c in BOOKING_MANAGE_CATEGORIES
        if c in mapping
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def transfer_order_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Заказать", callback_data="transfer_order")],
        ]
    )


def transfer_pay_kb():
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Оплатить", callback_data="transfer_pay")],
        ]
    )