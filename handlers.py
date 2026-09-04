# -*- coding: utf-8 -*-
"""Хендлеры: телефон-гейт, меню, менеджер, 3 сценария, услуги с возвратом."""

import logging
import os

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.filters import StateFilter
from aiogram.types import CallbackQuery, FSInputFile, Message, ReplyKeyboardRemove

import content as C
import keyboards as kb
from states import (
    AuthSG,
    MainMenuSG,
    ManagerSG,
    ScenarioSG,
    ServiceSG,
)

router = Router()
logger = logging.getLogger(__name__)


@router.message(F.text == kb.BACK)
async def global_back(message: Message, state: FSMContext) -> None:
    """Глобальная кнопка «↩ Назад»: откат на предыдущий экран в любом состоянии."""
    screen = await nav_pop(state)
    if screen:
        await restore_screen(message, state, screen)
    else:
        data = await state.get_data()
        concierge = data.get("concierge", False)
        await state.set_state(MainMenuSG.menu)
        await message.answer("Меню:", reply_markup=kb.menu_kb(concierge))


SCENARIOS = {
    "🔑 Заселение": C.CHECKIN_SCRIPT,
    "🏠 Проживание": C.STAY_SCRIPT,
    "🧾 Выезд": C.CHECKOUT_SCRIPT,
}

MENU_BUTTONS = set(C.MENU_BUTTONS)


# ============ Утилиты ============


async def send_media_for_node(bot, chat_id: int, node: dict) -> None:
    """Отправляет все фото шага: photos (список) и photo (одно)."""
    for ph in (node.get("photos") or []):
        if ph and os.path.exists(ph):
            await bot.send_photo(chat_id=chat_id, photo=FSInputFile(ph))
    photo = node.get("photo")
    if photo and os.path.exists(photo):
        await bot.send_photo(chat_id=chat_id, photo=FSInputFile(photo))
    elif photo:
        await bot.send_message(chat_id=chat_id, text=f"[Фото: {os.path.basename(photo)}]")


async def send_checkin_node(bot, chat_id: int, node: dict) -> None:
    """Отправляет шаг чек-ин флоу: фото с подписью (или текст) + inline-кнопки."""
    photo = node.get("photo")
    photos = node.get("photos") or []
    buttons_kb = kb.scenario_inline_kb(node.get("buttons"))

    if photo and os.path.exists(photo):
        # одно фото — текст идёт подписью к фото
        await bot.send_photo(
            chat_id=chat_id,
            photo=FSInputFile(photo),
            caption=node["text"],
            reply_markup=buttons_kb,
            parse_mode="HTML",
        )
        # доп. фото из photos (без подписи)
        for ph in photos:
            if ph and os.path.exists(ph):
                await bot.send_photo(chat_id=chat_id, photo=FSInputFile(ph))
        return

    # несколько фото без главного
    for ph in photos:
        if ph and os.path.exists(ph):
            await bot.send_photo(chat_id=chat_id, photo=FSInputFile(ph))
    await bot.send_message(
        chat_id=chat_id,
        text=node["text"],
        reply_markup=buttons_kb,
        parse_mode="HTML",
    )


async def send_step(bot, chat_id: int, state: FSMContext, flow: str, idx: int) -> None:
    script = SCENARIOS[flow]
    idx = max(0, min(idx, len(script) - 1))
    await state.update_data(flow=flow, step=idx)
    node = script[idx]

    await send_media_for_node(bot, chat_id, node)

    buttons = node.get("buttons")
    concierge = bool((await state.get_data()).get("concierge"))
    if buttons:
        markup = kb.scenario_kb(buttons)
    else:
        markup = kb.collect_kb()
    await bot.send_message(chat_id=chat_id, text=node["text"], reply_markup=markup, parse_mode="HTML")


async def start_scenario(message: Message, state: FSMContext, name: str) -> None:
    data = await state.get_data()
    keep_phone = data.get("phone")
    concierge = name == "🏠 Проживание"
    await state.set_data({"phone": keep_phone, "concierge": concierge})
    await state.set_state(ScenarioSG.run)
    await send_step(message.bot, message.chat.id, state, name, 0)


async def finish_scenario(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    concierge = data.get("concierge", False)
    await state.set_state(MainMenuSG.menu)
    await message.answer(
        "Сценарий завершен. Могу еще что-то сделать для тебя?",
        reply_markup=kb.menu_kb(concierge),
    )


async def nav_clear(state: FSMContext) -> None:
    """Очищает стек навигации (при входе в новую ветку/услугу)."""
    await state.update_data(nav_stack=[])


async def nav_push(state: FSMContext, screen: dict) -> None:
    """Добавляет экран в стек навигации."""
    data = await state.get_data()
    stack = data.get("nav_stack") or []
    stack.append(screen)
    await state.update_data(nav_stack=stack)


async def nav_pop(state: FSMContext) -> dict | None:
    """Достаёт предыдущий экран из стека навигации."""
    data = await state.get_data()
    stack = data.get("nav_stack") or []
    if stack:
        screen = stack.pop()
        await state.update_data(nav_stack=stack)
        return screen
    return None


async def restore_screen(message: Message, state: FSMContext, screen: dict) -> None:
    """Восстанавливает экран по его описанию."""
    stype = screen.get("type")

    if stype == "checkin":
        await state.set_state(AuthSG.post_auth)
        s = screen.get("step", 0)
        await state.update_data(checkin_step=s)
        if s > 0:
            await send_checkin_node(message.bot, message.chat.id, C.FULL_SCRIPT[s - 1])
        return

    if stype == "flow":
        await state.set_state(ScenarioSG.run)
        await state.update_data(flow=screen["flow"], step=screen.get("step", 0))
        await send_step(message.bot, message.chat.id, state, screen["flow"], screen.get("step", 0))
        return

    if stype == "transport":
        await state.set_state(MainMenuSG.menu)
        await message.answer_photo(
            FSInputFile(C.TRANSFER_PHOTO) if os.path.exists(C.TRANSFER_PHOTO) else "",
            caption=C.TRANSPORT_INTRO,
            reply_markup=kb.transport_menu_kb(),
        )
        return

    if stype == "services":
        await state.set_state(MainMenuSG.menu)
        await message.answer(
            C.CHECKIN_SCRIPT[4]["text"],
            reply_markup=kb.scenario_inline_kb(C.CHECKIN_SCRIPT[4]["buttons"]),
            parse_mode="HTML",
        )
        return

    if stype == "tours_cat":
        await state.set_state(ServiceSG.tours_cat)
        await message.answer_photo(
            FSInputFile(C.WAYAN_RYUKZAK_PHOTO) if os.path.exists(C.WAYAN_RYUKZAK_PHOTO) else "",
            caption=C.TOURS_INTRO_1,
        )
        await message.answer(C.TOURS_INTRO_2, reply_markup=kb.tours_categories_kb())
        return

    if stype == "tours_list":
        await state.set_state(ServiceSG.tours_list)
        await message.answer("Туры:")
        for tour in C.TOURS_LIST:
            photo_path = os.path.join(C.BASE_DIR, tour["photo"])
            if os.path.exists(photo_path):
                await message.answer_photo(
                    FSInputFile(photo_path),
                    caption=tour["title"],
                    reply_markup=kb.tour_card_kb(tour["id"]),
                )
            else:
                await message.answer(
                    f"🏞 {tour['title']}\n[Фото тура]",
                    reply_markup=kb.tour_card_kb(tour["id"]),
                )
        return

    if stype == "places_cat":
        await state.set_state(ServiceSG.places_cat)
        await message.answer("Отдельные места:", reply_markup=kb.places_categories_kb())
        return

    if stype == "concierge":
        await state.set_state(ServiceSG.concierge_cat)
        await message.answer_photo(
            FSInputFile(C.UBORKA_PHOTO) if os.path.exists(C.UBORKA_PHOTO) else "",
            caption="Так, я готов оперативно тебе предложить:",
            reply_markup=kb.concierge_kb(),
        )
        return

    if stype == "wellness":
        await state.set_state(ServiceSG.wellness_cat)
        await message.answer_photo(
            FSInputFile(C.WAYAN_FLOWERS_PHOTO) if os.path.exists(C.WAYAN_FLOWERS_PHOTO) else "",
            caption=C.WELLNESS_INTRO,
            reply_markup=kb.wellness_kb(),
        )
        return

    if stype == "booking_manage":
        await state.set_state(ServiceSG.booking_manage_cat)
        await message.answer(C.BOOKING_MANAGE_INTRO, reply_markup=kb.booking_manage_kb())
        return

    if stype == "rental":
        await state.set_state(ServiceSG.rental_type)
        await message.answer_photo(
            FSInputFile(C.WAYAN_PHOTO) if os.path.exists(C.WAYAN_PHOTO) else "",
            caption=C.RENTAL_INTRO,
            reply_markup=kb.rental_type_kb(),
        )
        return

    if stype == "driver":
        await state.set_state(ServiceSG.driver_people)
        await message.answer_photo(
            FSInputFile(C.WAYAN_DRIVER_PHOTO) if os.path.exists(C.WAYAN_DRIVER_PHOTO) else "",
            caption=C.DRIVER_INTRO,
        )
        return

    if stype == "places_list":
        await state.set_state(ServiceSG.places_list)
        cat = screen.get("cat", "")
        items = next((its for c, its in C.PLACES_CATEGORIES if c == cat), [])
        await message.answer(f"{cat}:", reply_markup=kb.collect_kb())
        for item in items:
            text, photo = C.PLACES_DETAILS[item]
            photo_path = os.path.join(C.BASE_DIR, photo)
            if os.path.exists(photo_path):
                await message.answer_photo(
                    FSInputFile(photo_path),
                    caption=item,
                    parse_mode="HTML",
                    reply_markup=kb.places_items_kb([item]),
                )
            else:
                await message.answer(
                    f"🏞 {item}\n[Фото]",
                    parse_mode="HTML",
                    reply_markup=kb.places_items_kb([item]),
                )
        return

    if stype == "main_menu":
        await state.set_state(MainMenuSG.menu)
        await message.answer("Меню:", reply_markup=kb.menu_kb())
        await message.answer("Главное меню доступно ниже.", reply_markup=kb.main_menu_kb())
        return

    concierge = screen.get("concierge", False)
    await state.set_state(MainMenuSG.menu)
    await message.answer("Меню:", reply_markup=kb.menu_kb(concierge))


async def start_service(message: Message, state: FSMContext, label: str) -> None:
    """Ветка услуги; если мы в сценарии — запоминаем шаг возврата."""
    data = await state.get_data()
    if data.get("flow") is not None:
        await state.update_data(return_flow=data["flow"], return_step=data["step"])

    if label == "Трансфер/аренда":
        await message.answer_photo(
            FSInputFile(C.TRANSFER_PHOTO) if os.path.exists(C.TRANSFER_PHOTO) else "",
            caption=C.TRANSPORT_INTRO,
            reply_markup=kb.transport_menu_kb(),
        )
    elif label == "Подобрать тур":
        await state.set_state(ServiceSG.tours_cat)
        await message.answer_photo(
            FSInputFile(C.WAYAN_RYUKZAK_PHOTO) if os.path.exists(C.WAYAN_RYUKZAK_PHOTO) else "",
            caption=C.TOURS_INTRO_1,
        )
        await message.answer(C.TOURS_INTRO_2, reply_markup=kb.tours_categories_kb())
    elif label == "Забронировать новую виллу":
        await state.set_state(ServiceSG.booking_new_area)
        await message.answer_photo(
            FSInputFile(C.WAYAN_CONCIERGE_PHOTO) if os.path.exists(C.WAYAN_CONCIERGE_PHOTO) else "",
            caption=C.BOOKING_NEW_INTRO,
        )
        await message.answer("Выбери район:", reply_markup=kb.area_kb())
    elif label == "Аренда авто или байка":
        await state.set_state(ServiceSG.rental_type)
        await message.answer_photo(
            FSInputFile(C.WAYAN_PHOTO) if os.path.exists(C.WAYAN_PHOTO) else "",
            caption=C.RENTAL_INTRO,
            reply_markup=kb.rental_type_kb(),
        )
    elif label == "Личный водитель":
        await state.set_state(ServiceSG.driver_people)
        await message.answer_photo(
            FSInputFile(C.WAYAN_DRIVER_PHOTO) if os.path.exists(C.WAYAN_DRIVER_PHOTO) else "",
            caption=C.DRIVER_INTRO,
            reply_markup=kb.collect_kb(),
        )
    elif label == "Экскурсии и путешествия":
        await state.set_state(ServiceSG.tours_cat)
        await message.answer_photo(
            FSInputFile(C.WAYAN_RYUKZAK_PHOTO) if os.path.exists(C.WAYAN_RYUKZAK_PHOTO) else "",
            caption=C.TOURS_INTRO_1,
        )
        await message.answer(C.TOURS_INTRO_2, reply_markup=kb.tours_categories_kb())
    elif label == "Консьерж сервис":
        await state.set_state(ServiceSG.concierge_cat)
        await message.answer_photo(
            FSInputFile(C.UBORKA_PHOTO) if os.path.exists(C.UBORKA_PHOTO) else "",
            caption="Так, я готов оперативно тебе предложить:",
            reply_markup=kb.concierge_kb(),
        )
    elif label == "Цветы, еда, массаж":
        await state.set_state(ServiceSG.wellness_cat)
        await message.answer_photo(
            FSInputFile(C.WAYAN_FLOWERS_PHOTO) if os.path.exists(C.WAYAN_FLOWERS_PHOTO) else "",
            caption=C.WELLNESS_INTRO,
            reply_markup=kb.wellness_kb(),
        )
    elif label == "Управлять бронированием":
        await state.set_state(ServiceSG.booking_manage_cat)
        await message.answer(C.BOOKING_MANAGE_INTRO, reply_markup=kb.booking_manage_kb())
    elif label == "Персональное пожелание":
        await state.set_state(ServiceSG.wish)
        await message.answer(C.MENU_REPLIES[label], reply_markup=kb.collect_kb())
    else:
        reply = C.MENU_REPLIES.get(label, "Принято, передал менеджеру.")
        await message.answer(reply, reply_markup=kb.collect_kb())


# ============ ТРАНСПОРТ ============


@router.callback_query(F.data == "transport:transfer")
async def transport_transfer(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "transport"})
    await state.set_state(ServiceSG.transfer_from)
    await call.message.answer(
        "У нас есть отличные машины! Напиши название виллы или места, откуда тебя забрать."
    )
    await state.set_state(ServiceSG.transfer_from)


@router.callback_query(F.data == "transport:rental")
async def transport_rental(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "transport"})
    await call.message.answer_photo(
        FSInputFile(C.WAYAN_BIKE_PHOTO) if os.path.exists(C.WAYAN_BIKE_PHOTO) else "",
        caption=C.RENTAL_INTRO,
        reply_markup=kb.rental_type_kb(),
    )


@router.callback_query(F.data == "transport:driver")
async def transport_driver(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "transport"})
    await call.message.answer_photo(
        FSInputFile(C.WAYAN_DRIVER_PHOTO) if os.path.exists(C.WAYAN_DRIVER_PHOTO) else "",
        caption="Давай подберем водителя! Сколько будет человек?",
    )
    await state.set_state(ServiceSG.driver_people)


@router.callback_query(F.data == "transport:back")
async def transport_back(call: CallbackQuery, state: FSMContext) -> None:
    """Возврат к экрану услуг («Что могу сделать для тебя»)."""
    await call.message.answer(
        C.CHECKIN_SCRIPT[4]["text"],
        reply_markup=kb.scenario_inline_kb(C.CHECKIN_SCRIPT[4]["buttons"]),
        parse_mode="HTML",
    )
    await call.answer()


@router.message(F.text == "Трансфер")
async def transport_transfer_text(message: Message, state: FSMContext) -> None:
    await state.set_state(ServiceSG.transfer_from)
    await message.answer(
        "У нас есть отличные машины! Напиши название виллы или места, откуда тебя забрать."
    )


@router.message(F.text == "Аренда авто или мото")
async def transport_rental_text(message: Message, state: FSMContext) -> None:
    await message.answer_photo(
        FSInputFile(C.WAYAN_BIKE_PHOTO) if os.path.exists(C.WAYAN_BIKE_PHOTO) else "",
        caption=C.RENTAL_INTRO,
        reply_markup=kb.rental_type_kb(),
    )


@router.message(F.text == "Личный водитель")
async def transport_driver_text(message: Message, state: FSMContext) -> None:
    await message.answer_photo(
        FSInputFile(C.WAYAN_DRIVER_PHOTO) if os.path.exists(C.WAYAN_DRIVER_PHOTO) else "",
        caption="Давай подберем водителя! Сколько будет человек?",
    )
    await state.set_state(ServiceSG.driver_people)


# ---- Аренда: Авто / Байк -> каталог с фото -> детали -> оплата ----

@router.callback_query(F.data == "rental_type:car")
async def rental_type_car(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "rental"})
    await call.message.answer("Авто")
    for car in C.RENTAL_CARS:
        photo_path = os.path.join(C.BASE_DIR, car["photo"])
        if os.path.exists(photo_path):
            await call.message.answer_photo(
                FSInputFile(photo_path),
                caption=f"{car['name']}\n{car['price']}\n{car['seats']}",
                reply_markup=kb.rental_items_kb([car], "rental_car"),
            )
        else:
            await call.message.answer(
                f"🚗 {car['name']}\n{car['price']}\n{car['seats']}\n[Фото машины]",
                reply_markup=kb.rental_items_kb([car], "rental_car"),
            )


@router.callback_query(F.data == "rental_type:bike")
async def rental_type_bike(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "rental"})
    await call.message.answer("Байк")
    for bike in C.RENTAL_BIKES:
        photo_path = os.path.join(C.BASE_DIR, bike["photo"])
        if os.path.exists(photo_path):
            await call.message.answer_photo(
                FSInputFile(photo_path),
                caption=f"{bike['name']}\n{bike['price']}\n{bike['type']}",
                reply_markup=kb.rental_items_kb([bike], "rental_bike"),
            )
        else:
            await call.message.answer(
                f"🏍 {bike['name']}\n{bike['price']}\n{bike['type']}\n[Фото байка]",
                reply_markup=kb.rental_items_kb([bike], "rental_bike"),
            )


@router.callback_query(F.data.startswith("rental_car:"))
async def rental_select_car(call: CallbackQuery, state: FSMContext) -> None:
    name = call.data.split(":", 1)[1]
    await state.update_data(rental_item=name, rental_type="Авто")
    await state.set_state(ServiceSG.rental_dates)
    await call.message.edit_caption(caption=f"✅ Выбрано: {name}")
    await call.message.answer("Напиши когда нужен транспорт и на сколько дней.")


@router.callback_query(F.data.startswith("rental_bike:"))
async def rental_select_bike(call: CallbackQuery, state: FSMContext) -> None:
    name = call.data.split(":", 1)[1]
    await state.update_data(rental_item=name, rental_type="Байк")
    await state.set_state(ServiceSG.rental_dates)
    await call.message.edit_caption(caption=f"✅ Выбрано: {name}")
    await call.message.answer("Напиши когда нужен транспорт и на сколько дней.")


@router.message(ServiceSG.rental_dates)
async def rental_dates(message: Message, state: FSMContext) -> None:
    await state.update_data(rental_dates=message.text.strip())
    await state.set_state(ServiceSG.rental_delivery)
    await message.answer("Привезти тебе транспорт на виллу или заберешь сам?")


@router.message(ServiceSG.rental_delivery)
async def rental_delivery(message: Message, state: FSMContext) -> None:
    await state.update_data(rental_delivery=message.text.strip())
    await state.set_state(ServiceSG.rental_confirm)
    d = await state.get_data()
    await message.answer(
        f"Забронировать {d['rental_item']}?",
        reply_markup=kb.rental_confirm_kb(),
    )


@router.callback_query(F.data == "rental_book", ServiceSG.rental_confirm)
async def rental_book(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer_photo(
        FSInputFile(C.OPLATA_PHOTO) if os.path.exists(C.OPLATA_PHOTO) else "",
        caption="Введите платежные данные",
        reply_markup=kb.rental_pay_kb(),
    )
    await state.set_state(ServiceSG.rental_paid)


@router.callback_query(F.data == "rental_pay", ServiceSG.rental_paid)
async def rental_paid(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer(
        "Оплата прошла успешно, машину забронировал! (Заявка уходит в прокат)"
    )
    await after_service(call.message, state)


# ============ ЛИЧНЫЙ ВОДИТЕЛЬ ============


@router.message(ServiceSG.driver_people)
async def driver_people(message: Message, state: FSMContext) -> None:
    await state.update_data(driver_people=message.text.strip())
    await state.set_state(ServiceSG.driver_days)
    await message.answer("Напиши на сколько дней тебе нужна машина?")


@router.message(ServiceSG.driver_days)
async def driver_days(message: Message, state: FSMContext) -> None:
    await state.update_data(driver_days=message.text.strip())
    await state.set_state(ServiceSG.driver_when)
    await message.answer("Когда выезжаем?")


@router.message(ServiceSG.driver_when)
async def driver_when(message: Message, state: FSMContext) -> None:
    await state.update_data(driver_when=message.text.strip())
    await state.set_state(ServiceSG.driver_confirm)
    await message.answer(
        "Договорился с водителем! Он будет рад покатать вас по острову!\nПодтверждаешь заказ?",
        reply_markup=kb.driver_confirm_kb(),
    )


@router.callback_query(F.data == "driver_pay", ServiceSG.driver_confirm)
async def driver_pay(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer_photo(
        FSInputFile(C.OPLATA_PHOTO) if os.path.exists(C.OPLATA_PHOTO) else "",
        caption="Введите платежные данные",
        reply_markup=kb.driver_pay_kb(),
    )
    await state.set_state(ServiceSG.driver_paid)


@router.callback_query(F.data == "driver_pay_done", ServiceSG.driver_paid)
async def driver_paid(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer(
        "Оплата прошла успешно, водитель забронирован! (Заявка уходит в прокат)"
    )
    await after_service(call.message, state)


# ============ ТРАНСФЕР: полный флоу ============


@router.message(ServiceSG.transfer_from)
async def transfer_from(message: Message, state: FSMContext) -> None:
    await state.update_data(transfer_from=message.text.strip())
    await state.set_state(ServiceSG.transfer_to)
    await message.answer("Напиши название места, куда поедешь.")


@router.message(ServiceSG.transfer_to)
async def transfer_to(message: Message, state: FSMContext) -> None:
    await state.update_data(transfer_to=message.text.strip())
    await state.set_state(ServiceSG.transfer_people)
    await message.answer("Сколько человек поедет?")


@router.message(ServiceSG.transfer_people)
async def transfer_people(message: Message, state: FSMContext) -> None:
    await state.update_data(transfer_people=message.text.strip())
    await state.set_state(ServiceSG.transfer_luggage)
    await message.answer("Сколько больших чемоданов?")


@router.message(ServiceSG.transfer_luggage)
async def transfer_luggage(message: Message, state: FSMContext) -> None:
    await state.update_data(transfer_luggage=message.text.strip())
    await state.set_state(ServiceSG.transfer_time)
    await message.answer("Во сколько тебя забрать?")


@router.message(ServiceSG.transfer_time)
async def transfer_time(message: Message, state: FSMContext) -> None:
    await state.update_data(transfer_time=message.text.strip())
    await state.set_state(ServiceSG.transfer_offer)
    d = await state.get_data()
    await message.answer(
        "Есть у нас отличная машина! Стоимость поездки будет 500.000 IDR",
        reply_markup=kb.transfer_order_kb(),
    )


@router.callback_query(F.data == "transfer_order", ServiceSG.transfer_offer)
async def transfer_order(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer_photo(
        FSInputFile(C.OPLATA_PHOTO) if os.path.exists(C.OPLATA_PHOTO) else "",
        caption="Введите платежные данные",
        reply_markup=kb.transfer_pay_kb(),
    )
    await state.set_state(ServiceSG.transfer_pay)


@router.callback_query(F.data == "transfer_pay", ServiceSG.transfer_pay)
async def transfer_pay(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer(
        "Машину заказал, телефон водителя: +628212345678 Made"
    )
    await after_service(call.message, state)


def route_wish(text: str) -> str | None:
    t = (text or "").lower()
    if any(k in t for k in ("трансфер", "аэропорт", "машин", "байк", "водител")):
        return "Трансфер/аренда"
    if any(k in t for k in ("аренд", "авто", "байк", "мото", "скутер")):
        return "Аренда авто или байка"
    if any(k in t for k in ("водитель", "driver")):
        return "Личный водитель"
    if any(k in t for k in ("тур", "экскурси", "путешев")):
        return "Экскурсии и путешествия"
    if "билет" in t:
        return "Купить билеты на острова"
    if any(k in t for k in ("массаж", "spa", "цвет", "еду", "ужин")):
        return "Цветы, еда, массаж"
    if any(k in t for k in ("продлит", "бронир")):
        return "Управлять бронированием"
    if any(k in t for k in ("вилл", "жилье")):
        return "Забронировать новую виллу"
    return None


async def after_service(message: Message, state: FSMContext) -> None:
    """Возврат из услуги в сценарий или в меню."""
    data = await state.get_data()
    rflow = data.pop("return_flow", None)
    rstep = data.pop("return_step", None)
    rcheckin = data.pop("return_checkin_step", None)
    await state.update_data(return_flow=None, return_step=None, return_checkin_step=None)

    if rcheckin is not None:
        # возврат в чек-ин флоу (после авторизации) — кнопка «Далее»
        await state.set_state(AuthSG.post_auth)
        await state.update_data(checkin_step=rcheckin)
        await message.answer(
            "Продолжим сценарий заселения?",
            reply_markup=kb.next_kb(),
        )
        return

    if rflow is not None and rflow in SCENARIOS:
        await state.set_state(ScenarioSG.run)
        await send_step(message.bot, message.chat.id, state, rflow, rstep or 0)
    else:
        concierge = data.get("concierge", False)
        await state.set_state(MainMenuSG.menu)
        await message.answer(
            "Могу еще что-то сделать для тебя?", reply_markup=kb.menu_kb(concierge)
        )


# ============ Телефон-гейт ============


@router.message(F.text == "/start", StateFilter("*"))
async def cmd_start(message: Message, state: FSMContext) -> None:
    await state.clear()
    await state.set_state(AuthSG.wait_phone)
    await message.answer_photo(
        FSInputFile(C.WKS_PHOTO) if os.path.exists(C.WKS_PHOTO) else "",
        caption=C.GREETING_TEXT,
        reply_markup=kb.phone_kb(),
        parse_mode="HTML",
    )


@router.message(AuthSG.wait_phone, F.contact)
async def auth_contact(message: Message, state: FSMContext) -> None:
    phone = message.contact.phone_number
    logger.info("Авторизация: %s (%s)", phone, message.from_user.full_name)
    await state.set_data({"phone": phone})
    await state.set_state(AuthSG.post_auth)
    await message.answer(
        f"Номер {phone} принят!",
        reply_markup=kb.main_menu_minimal_kb(),
    )
    await message.answer(
        "Бот демонстрационный, с ограниченным функционалом.\n"
        "Al не подключен.\n"
        "Задача бета версии- показать основные сценарии бота.",
        reply_markup=kb.next_kb(),
    )


@router.message(AuthSG.wait_phone)
async def auth_denied(message: Message) -> None:
    await message.answer(
        "Без номера телефона я не могу пустить тебя в бот. "
        "Нажми кнопку «📱 Поделиться номером».",
        reply_markup=kb.phone_kb(),
    )


# ============ Post-auth checkin flow ============


@router.message(AuthSG.post_auth)
async def checkin_free_text(message: Message, state: FSMContext) -> None:
    """Обработка свободного ввода на collect-шагах чек-ин флоу."""
    data = await state.get_data()
    step = data.get("checkin_step", 0)
    script = C.FULL_SCRIPT

    text = (message.text or "").strip()

    # Глобальные кнопки должны работать в любом состоянии
    if text == "↩ Назад":
        screen = await nav_pop(state)
        if screen:
            await restore_screen(message, state, screen)
        return
    if text == "📋 Меню":
        d2 = await state.get_data()
        if d2.get("checkin_step") is not None:
            await nav_push(state, {"type": "checkin", "step": d2["checkin_step"]})
        await state.set_state(MainMenuSG.menu)
        await message.answer("Меню:", reply_markup=kb.menu_kb())
        return
    if text == "📞 Связь с менеджером":
        await state.update_data(return_flow=None, return_step=None)
        await state.set_state(ManagerSG.question)
        await message.answer(C.MANAGER_ASK, reply_markup=kb.collect_kb())
        return
    if text == "📄 Получить презентацию":
        if os.path.exists(C.PRESENTATION_PDF):
            await message.answer_document(FSInputFile(C.PRESENTATION_PDF))
        else:
            await message.answer(
                "[PDF презентации не найден] — положите файл WK_Concierge_Service_4_slides_updated.pdf в папку проекта."
            )
        return

    if step <= 0 or step > len(script):
        return
    node = script[step - 1]
    field = node.get("collect")
    if field:
        # свободный ввод -> фиксируем и идём дальше
        await state.update_data(checkin_step=step + 1)
        nxt = step
        if nxt < len(script):
            await send_checkin_node(message.bot, message.chat.id, script[nxt])
        else:
            await message.answer("Меню:", reply_markup=kb.main_menu_kb())


@router.callback_query(F.data == "next:checkin", AuthSG.post_auth)
async def checkin_next(call: CallbackQuery, state: FSMContext) -> None:
    data = await state.get_data()
    step = data.get("checkin_step", 0)
    script = C.FULL_SCRIPT
    
    if step >= len(script):
        await state.set_state(MainMenuSG.menu)
        await call.message.answer("Меню:", reply_markup=kb.main_menu_kb())
        return
    
    # пушим текущий шаг в стек для возврата по «Назад»
    await nav_push(state, {"type": "checkin", "step": step})
    
    node = script[step]
    await state.update_data(checkin_step=step + 1)

    await send_checkin_node(call.message.bot, call.message.chat.id, node)

    # после последнего шага (29) — показать жёсткую кнопку меню
    if step == len(script) - 1:
        await call.message.answer(
            "Сценарий пройден! Главное меню доступно ниже.",
            reply_markup=kb.main_menu_kb(),
        )


@router.callback_query(F.data.startswith("checkin:"), AuthSG.post_auth)
async def checkin_button(call: CallbackQuery, state: FSMContext) -> None:
    """Handle checkin flow buttons like 'Получить инфу', 'Да', 'Нет', etc."""
    button = call.data.split(":", 1)[1]
    data = await state.get_data()
    step = data.get("checkin_step", 0)
    script = C.FULL_SCRIPT

    if button == "Получить инфу":
        await call.message.answer("[PDF-гайд по заселению] — имитация отправки файла.")
        node = script[step - 1]
        await call.message.answer(node["text"], reply_markup=kb.scenario_inline_kb(node["buttons"]), parse_mode="HTML")
        return

    # If button is a service from the offer menu -> start that service branch
    if button in C.CHECKIN_OFFER_BUTTONS:
        await nav_clear(state)
        await nav_push(state, {"type": "main_menu"})
        await state.update_data(return_checkin_step=step)
        await start_service(call.message, state, button)
        await call.answer()
        return

    # jump map from current node
    node_cur = script[step - 1]
    jump = node_cur.get("jump", {})

    if button == "Прислать варианты":
        await state.set_state(MainMenuSG.menu)
        await start_service(call.message, state, "Забронировать новую виллу")
        await call.answer()
        return
    elif button == "Меню":
        await state.set_state(MainMenuSG.menu)
        await call.message.answer("Меню:", reply_markup=kb.menu_kb())
        await call.message.answer("Главное меню доступно ниже.", reply_markup=kb.main_menu_kb())
        await call.answer()
        return
    elif button == "Уборка сегодня не нужна":
        not_photo = node_cur.get("not_needed_photo")
        if not_photo and os.path.exists(not_photo):
            await call.message.answer_photo(FSInputFile(not_photo), caption="Понял, отменяю уборку.")
        target = step  # advance to next step
    elif button in jump:
        target = jump[button]
    elif button == "Да" and "ранний заезд" in node_cur["text"]:
        target = step  # show step 7 (early checkin info)
    elif button == "Нет" and "ранний заезд" in node_cur["text"]:
        target = step + 1  # skip to step 8 (help question)
    elif button == "Самостоятельно":
        target = step + 1  # go to step 9 (PDF guide)
    elif button == "Нужна помощь" and "заселением" in node_cur["text"]:
        # заселение: «Нужна помощь» -> шаг «Во сколько ты прибудешь»
        target = next((i for i, s in enumerate(script) if "Во сколько ты прибудешь" in s["text"]), step + 1)
    elif button == "Нужна помощь" and "выездом" in node_cur["text"]:
        # выезд: «Нужна помощь» -> следующий шаг (Напиши с чем помочь)
        target = step
    else:
        target = step  # advance to next step

    await state.update_data(checkin_step=target)
    await checkin_next(call, state)


# ============ Глобальные кнопки (до остальных) ============


@router.callback_query(F.data == "back:main_menu")
async def back_main_menu_cb(call: CallbackQuery, state: FSMContext) -> None:
    await state.update_data(return_flow=None, return_step=None, return_checkin_step=None)
    data = await state.get_data()
    concierge = data.get("concierge", False)
    await state.set_state(MainMenuSG.menu)
    await call.message.answer("Меню:", reply_markup=kb.menu_kb(concierge))
    await call.message.answer("Главное меню доступно ниже.", reply_markup=kb.main_menu_kb())
    await call.answer()


@router.message(F.text == "📋 Меню")
async def open_menu(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    concierge = data.get("concierge", False)
    # сохраняем текущий экран в стек для возврата по «Назад»
    if data.get("checkin_step") is not None:
        await nav_push(state, {"type": "checkin", "step": data["checkin_step"]})
    elif data.get("flow"):
        await nav_push(state, {"type": "flow", "flow": data["flow"], "step": data.get("step", 0)})
    await state.set_state(MainMenuSG.menu)
    await message.answer("Меню:", reply_markup=kb.menu_kb(concierge), parse_mode="HTML")


@router.callback_query(F.data.startswith("menu_service:"))
async def menu_service(call: CallbackQuery, state: FSMContext) -> None:
    label = call.data.split(":", 1)[1]
    # новая ветка услуги: очистить стек, базовый экран — главное меню
    await nav_clear(state)
    await nav_push(state, {"type": "main_menu"})
    await start_service(call.message, state, label)
    await call.answer()


@router.callback_query(F.data == "menu_back")
async def menu_back(call: CallbackQuery, state: FSMContext) -> None:
    """Возврат к сценарию, если открыли меню из него."""
    data = await state.get_data()
    rcheckin = data.pop("menu_from_checkin", None)
    rcheckin_step = data.pop("menu_from_checkin_step", None)
    rflow = data.pop("menu_from_flow", None)
    rstep = data.pop("menu_from_step", None)
    await state.update_data(
        menu_from_checkin=None, menu_from_checkin_step=None,
        menu_from_flow=None, menu_from_step=None,
    )

    if rcheckin and rcheckin_step is not None:
        await state.set_state(AuthSG.post_auth)
        await state.update_data(checkin_step=rcheckin_step)
        # показываем шаг, где юзер остановился, а следующий «Далее» идёт дальше
        current = rcheckin_step - 1
        if 0 <= current < len(C.FULL_SCRIPT):
            await send_checkin_node(call.message.bot, call.message.chat.id, C.FULL_SCRIPT[current])
        await call.answer()
        return
    if rflow and rflow in SCENARIOS:
        await state.set_state(ScenarioSG.run)
        await send_step(call.message.bot, call.message.chat.id, state, rflow, rstep or 0)
        await call.answer()
        return

    concierge = data.get("concierge", False)
    await call.message.answer("Меню:", reply_markup=kb.menu_kb(concierge))
    await call.answer()


@router.message(F.text == C.PRESENTATION_BUTTON)
async def get_presentation(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    concierge = data.get("concierge", False)
    if os.path.exists(C.PRESENTATION_PDF):
        await message.answer_document(FSInputFile(C.PRESENTATION_PDF))
    else:
        await message.answer(
            "[PDF с презентацией] — положите файл presentation.pdf в папку проекта.",
        )
    await state.set_state(MainMenuSG.menu)
    await message.answer(
        "Могу еще что-то сделать для тебя?", reply_markup=kb.main_menu_kb()
    )


@router.message(F.text == kb.CONCIERGE)
async def concierge_btn(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    await state.set_state(MainMenuSG.menu)
    await message.answer(
        "Я на связи 24/7, напиши что нужно — организую.\n"
        "Или выбери услугу из меню:",
        reply_markup=kb.menu_kb(data.get("concierge", True)),
    )


# ============ Менеджер ============


@router.message(F.text == "📞 Связь с менеджером")
async def call_manager(message: Message, state: FSMContext) -> None:
    await state.update_data(return_flow=None, return_step=None)
    await state.set_state(ManagerSG.question)
    await message.answer(C.MANAGER_ASK, reply_markup=kb.collect_kb())


@router.message(F.text == "📄 Получить презентацию")
async def get_presentation(message: Message, state: FSMContext) -> None:
    if os.path.exists(C.PRESENTATION_PDF):
        await message.answer("⏳ Загружаю презентацию, подождите секунду...")
        await message.answer_document(FSInputFile(C.PRESENTATION_PDF))
    else:
        await message.answer(
            "[PDF презентации не найден] — положите файл WK_Concierge_Service_4_slides_updated.pdf в папку проекта."
        )


@router.message(ManagerSG.question)
async def manager_question(message: Message, state: FSMContext) -> None:
    q = (message.text or "").strip()
    logger.info("Вопрос менеджеру: %s", q)
    data = await state.get_data()
    concierge = data.get("concierge", False)
    await state.set_state(MainMenuSG.menu)
    await message.answer(C.MANAGER_REPLY, reply_markup=kb.menu_kb(concierge))


# ============ Сценарии: вход ============


@router.message(F.text.in_(set(SCENARIOS.keys())))
async def scenario_button(message: Message, state: FSMContext) -> None:
    await start_scenario(message, state, message.text.strip())


# ============ Сценарий: шаги ============


@router.message(ScenarioSG.run)
async def scenario_run(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    flow, idx = data["flow"], data["step"]
    script = SCENARIOS[flow]
    node = script[idx]
    text = (message.text or "").strip()

    # --- свободный ввод (collect-шаг) ---
    if not node.get("buttons"):
        field = node.get("collect")
        if field == "cleaning_time":
            await message.answer("Время зафиксировал, передал уборщице и менеджеру.")
        elif field == "arrival_time":
            await message.answer("Записал время, передал стаффу.")
        elif field == "checkout_help":
            await message.answer("Информация передана менеджеру и стаффу.")
        nxt = idx + 1
        if nxt < len(script):
            await send_step(message.bot, message.chat.id, state, flow, nxt)
        else:
            await finish_scenario(message, state)
        return

    # --- нажатие контекстной кнопки ---
    if text in node["buttons"]:
        if text == "Прислать варианты":
            await start_service(message, state, "Забронировать новую виллу")
            return
        if text == "Меню":
            await state.set_state(MainMenuSG.menu)
            await message.answer("Меню:", reply_markup=kb.menu_kb())
            await message.answer("Главное меню доступно ниже.", reply_markup=kb.main_menu_kb())
            return
        jump = node.get("jump", {})
        if text in jump:
            target = jump[text]
            if target >= len(script):
                await finish_scenario(message, state)
            else:
                await send_step(message.bot, message.chat.id, state, flow, target)
            return

        if text == "Уборка сегодня не нужна":
            not_photo = node.get("not_needed_photo")
            if not_photo and os.path.exists(not_photo):
                await message.answer_photo(FSInputFile(not_photo), caption="Понял, отменяю уборку.")
            photo = node.get("photo")
            if photo and os.path.exists(photo):
                await message.answer_photo(FSInputFile(photo), caption="Картинка уборщика.")
            nxt = idx + 1
            if nxt < len(script):
                await send_step(message.bot, message.chat.id, state, flow, nxt)
            else:
                await finish_scenario(message, state)
            return

        if text == "Получить инфу":
            guide = os.path.join(C.BASE_DIR, "guide.pdf")
            if os.path.exists(guide):
                await message.answer_document(FSInputFile(guide))
            else:
                await message.answer("[PDF-гайд по заселению] — имитация отправки файла.")
            return

        if node.get("end"):
            await finish_scenario(message, state)
            return

        if text == "Далее":
            nxt = idx + 1
            if nxt < len(script):
                await send_step(message.bot, message.chat.id, state, flow, nxt)
            else:
                await finish_scenario(message, state)
            return

        if text == "Да" and "ранний заезд" in node["text"]:
            await send_step(message.bot, message.chat.id, state, flow, idx + 1)
            return
        if text == "Нет" and "ранний заезд" in node["text"]:
            await send_step(message.bot, message.chat.id, state, flow, idx + 2)
            return
        if text == "Самостоятельно":
            target = next(i for i, s in enumerate(script) if "PDF-гайд" in s["text"])
            await send_step(message.bot, message.chat.id, state, flow, target)
            return
        if text == "Нужна помощь" and "заселением" in node["text"]:
            target = next(
                i for i, s in enumerate(script) if "Во сколько ты прибудешь" in s["text"]
            )
            await send_step(message.bot, message.chat.id, state, flow, target)
            return

        if text == "Меню виллы":
            await state.set_state(MainMenuSG.menu)
            await message.answer("Меню:", reply_markup=kb.menu_kb(True))
            return

        if text in MENU_BUTTONS:
            await start_service(message, state, text)
            return

        nxt = idx + 1
        if nxt < len(script):
            await send_step(message.bot, message.chat.id, state, flow, nxt)
        else:
            await finish_scenario(message, state)
        return

    # --- свободный ввод на кнопочном шаге с collect (например, время уборки) ---
    if node.get("collect"):
        field = node.get("collect")
        if field == "cleaning_time":
            await message.answer("Время зафиксировал, передал уборщице и менеджеру.")
        elif field == "arrival_time":
            await message.answer("Записал время, передал стаффу.")
        elif field == "checkout_time":
            await message.answer("Записал время выезда.")
        elif field == "checkout_help":
            await message.answer("Информация передана менеджеру и стаффу.")
        nxt = idx + 1
        if nxt < len(script):
            await send_step(message.bot, message.chat.id, state, flow, nxt)
        else:
            await finish_scenario(message, state)
        return

    # --- свободный текст на кнопочном шаге ---
    service = route_wish(text)
    if service:
        await start_service(message, state, service)
        return

    await message.answer(
        "Понял тебя. Я передал информацию менеджеру, он займётся этим вопросом."
    )


# ============ Меню: 7 услуг ============


@router.message(MainMenuSG.menu, F.text.in_(MENU_BUTTONS))
async def menu_service(message: Message, state: FSMContext) -> None:
    await start_service(message, state, message.text.strip())


# ============ ТРАНСФЕР (новый flow) ============


@router.message(ServiceSG.transfer_from)
async def transfer_from(message: Message, state: FSMContext) -> None:
    await state.update_data(transfer_from=message.text.strip())
    await state.set_state(ServiceSG.transfer_to)
    await message.answer(C.TRANSFER_ASK_TO, reply_markup=kb.collect_kb())


@router.message(ServiceSG.transfer_to)
async def transfer_to(message: Message, state: FSMContext) -> None:
    await state.update_data(transfer_to=message.text.strip())
    await state.set_state(ServiceSG.transfer_people)
    await message.answer(C.TRANSFER_ASK_PEOPLE, reply_markup=kb.collect_kb())


@router.message(ServiceSG.transfer_people)
async def transfer_people(message: Message, state: FSMContext) -> None:
    await state.update_data(transfer_people=message.text.strip())
    await state.set_state(ServiceSG.transfer_luggage)
    await message.answer(C.TRANSFER_ASK_LUGGAGE, reply_markup=kb.collect_kb())


@router.message(ServiceSG.transfer_luggage)
async def transfer_luggage(message: Message, state: FSMContext) -> None:
    await state.update_data(transfer_luggage=message.text.strip())
    await state.set_state(ServiceSG.transfer_time)
    await message.answer(C.TRANSFER_ASK_TIME, reply_markup=kb.collect_kb())


@router.message(ServiceSG.transfer_time)
async def transfer_time(message: Message, state: FSMContext) -> None:
    await state.update_data(transfer_time=message.text.strip())
    await state.set_state(ServiceSG.transfer_offer)
    d = await state.get_data()
    await message.answer(
        "Есть у нас отличная машина! Стоимость поездки будет 500.000 IDR",
        reply_markup=kb.transfer_order_kb(),
    )


def route_wish(text: str) -> str | None:
    t = (text or "").lower()
    if any(k in t for k in ("трансфер", "аэропорт", "машин", "байк", "водител")):
        return "Трансфер/аренда"
    if any(k in t for k in ("аренд", "авто", "байк", "мото", "скутер")):
        return "Аренда авто или байка"
    if any(k in t for k in ("водитель", "driver")):
        return "Личный водитель"
    if any(k in t for k in ("тур", "экскурси", "путешев")):
        return "Экскурсии и путешествия"
    if "билет" in t:
        return "Купить билеты на острова"
    if any(k in t for k in ("массаж", "spa", "цвет", "еду", "ужин")):
        return "Цветы, еда, массаж"
    if any(k in t for k in ("продлит", "бронир")):
        return "Управлять бронированием"
    if any(k in t for k in ("вилл", "жилье")):
        return "Забронировать новую виллу"
    return None


@router.message(ServiceSG.booking_area)
async def booking_area(message: Message, state: FSMContext) -> None:
    await state.update_data(b_area=message.text.strip())
    await state.set_state(ServiceSG.booking_dates)
    await message.answer(C.BOOKING_STEPS[1][1], reply_markup=kb.collect_kb())


@router.message(ServiceSG.booking_dates)
async def booking_dates(message: Message, state: FSMContext) -> None:
    await state.update_data(b_dates=message.text.strip())
    await state.set_state(ServiceSG.booking_guests)
    await message.answer(C.BOOKING_STEPS[2][1], reply_markup=kb.collect_kb())


@router.message(ServiceSG.booking_guests)
async def booking_guests(message: Message, state: FSMContext) -> None:
    d = await state.get_data()
    area = d.get("b_area", "")
    options = C.VILLAS.get(area, C.VILLAS.get(area.title(), ["Senja Villa", "Villa Bintang"]))
    lines = "\n".join(f"• {o}" for o in options)
    await state.set_state(ServiceSG.booking_options)
    await message.answer(
        f"На эти даты могу предложить следующие варианты:\n\n{lines}\n\n"
        "Напиши, какой вариант подходит.",
        reply_markup=kb.collect_kb(),
    )


@router.message(ServiceSG.booking_options)
async def booking_options(message: Message, state: FSMContext) -> None:
    logger.info("Выбрана вилла: %s", message.text.strip())
    await message.answer(
        "Отлично! Заявку передал менеджеру, скоро он свяжется.\nОплата уточняется у менеджера."
    )
    await after_service(message, state)


# ============ Новый flow: Забронировать новую виллу ============


@router.callback_query(F.data.startswith("booking_area:"))
async def booking_new_area_cb(call: CallbackQuery, state: FSMContext) -> None:
    area = call.data.split(":", 1)[1]
    await state.update_data(bn_area=area)
    await state.set_state(ServiceSG.booking_new_dates)
    await call.message.answer(C.BOOKING_ASK_DATES, reply_markup=kb.collect_kb())
    await call.answer()


@router.message(ServiceSG.booking_new_area)
async def booking_new_area(message: Message, state: FSMContext) -> None:
    area = message.text.strip()
    if area not in C.BOOKING_AREAS:
        await message.answer(C.BOOKING_AREA_UNKNOWN, reply_markup=kb.area_kb())
        return
    await state.update_data(bn_area=area)
    await state.set_state(ServiceSG.booking_new_dates)
    await message.answer(C.BOOKING_ASK_DATES, reply_markup=kb.collect_kb())


@router.message(ServiceSG.booking_new_dates)
async def booking_new_dates(message: Message, state: FSMContext) -> None:
    await state.update_data(bn_dates=message.text.strip())
    await state.set_state(ServiceSG.booking_new_guests)
    await message.answer(C.BOOKING_ASK_GUESTS, reply_markup=kb.collect_kb())


@router.message(ServiceSG.booking_new_guests)
async def booking_new_guests(message: Message, state: FSMContext) -> None:
    await state.update_data(bn_guests=message.text.strip())
    d = await state.get_data()
    area = d.get("bn_area", "")
    options = C.VILLAS.get(area, C.VILLAS.get(area.title(), ["Senja Villa", "Villa Bintang"]))
    await state.set_state(ServiceSG.booking_new_variant)
    await message.answer(C.BOOKING_VARIANTS_INTRO)
    folder = C.AREA_FOLDERS.get(area, "")
    folder_path = os.path.join(C.BASE_DIR, folder) if folder else ""
    photos = sorted(
        [os.path.join(folder_path, f) for f in os.listdir(folder_path)
         if f.lower().endswith((".jpg", ".jpeg", ".png"))]
    ) if folder_path and os.path.isdir(folder_path) else []

    # Показываем столько вилл, сколько фото в папке района (без дублей)
    if photos:
        options = options[:len(photos)]

    for i, villa in enumerate(options):
        photo_path = photos[i] if i < len(photos) else None
        if photo_path and os.path.exists(photo_path):
            await message.answer_photo(
                FSInputFile(photo_path),
                reply_markup=kb.variant_inline_kb(villa),
            )
        else:
            await message.answer(
                f"🏠 [Фото виллы]",
                reply_markup=kb.variant_inline_kb(villa),
            )


@router.callback_query(F.data.startswith("select_villa:"))
async def select_villa_callback(call: CallbackQuery, state: FSMContext) -> None:
    villa = call.data.split(":", 1)[1]
    if hasattr(call.message, "caption") and call.message.caption:
        await call.message.edit_caption(caption=f"✅ Выбрана: {villa}")
    d = await state.get_data()
    dates = d.get("bn_dates", "—")
    text = C.BOOKING_CONFIRM_TEXT.format(dates=dates)
    await call.message.answer(text, reply_markup=kb.payment_kb())
    await state.update_data(selected_villa=villa)
    await call.answer()


@router.callback_query(F.data == "booking_to_pay")
async def booking_to_pay(call: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(ServiceSG.booking_new_paid)
    await call.message.answer_photo(
        FSInputFile(C.OPLATA_PHOTO) if os.path.exists(C.OPLATA_PHOTO) else "",
        caption="Введите платежные данные",
        reply_markup=kb.payment_pay_kb(),
    )
    await call.answer()


@router.callback_query(F.data == "booking_pay")
async def booking_pay(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer(
        C.BOOKING_PAYMENT_TEXT,
        reply_markup=kb.post_pay_kb(),
    )
    await call.answer()


@router.callback_query(F.data == "booking_post_transfer")
async def booking_post_transfer(call: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(ServiceSG.transfer_people)
    await call.message.answer(C.TRANSFER_STEPS[0][1], reply_markup=kb.collect_kb())
    await call.answer()


@router.callback_query(F.data == "booking_post_nearby")
async def booking_post_nearby(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer(C.BOOKING_NEARBY_TEXT, reply_markup=kb.main_menu_kb())
    await call.answer()


# ============ Персональное пожелание ============


@router.message(ServiceSG.wish)
async def wish_text(message: Message, state: FSMContext) -> None:
    wish = (message.text or "").strip()
    # 1. Определить, относится ли к существующей услуге
    service = route_wish(wish)
    if service:
        await start_service(message, state, service)
        return

    # 2. Проверить, понятна ли задача
    known_keywords = ["купить", "заказать", "найти", "сбегать", "помочь", "нужен", "нужна",
                      "принести", "сделать", "подготовить", "организовать", "хочу", "хотел"]
    is_clear = any(k in wish.lower() for k in known_keywords)

    if is_clear:
        # Задача понятна: собрать данные и передать менеджеру
        await state.update_data(wish_text=wish)
        await message.answer(
            "Понял, постараюсь реализовать!\n"
            "Готово, я передал информацию менеджеру. Он подтвердит детали.",
            reply_markup=kb.collect_kb(),
        )
        await after_service(message, state)
    else:
        # Задача непонятна — предложить позвать менеджера
        from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
        await message.answer(
            "Слушай, извини, я не совсем понял, что именно тебе нужно.\n"
            "Давай я позову менеджера, чтобы он уточнил детали.\n"
            "Позвать тебе менеджера?",
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="Да, позвать менеджера", callback_data="wish_call_manager")],
                    [InlineKeyboardButton(text="Нет", callback_data="wish_no")],
                ]
            ),
        )


# ============ Фото ============


@router.message(F.photo)
async def on_photo(message: Message) -> None:
    await message.answer("Фото получил, передал менеджеру.")


@router.callback_query(F.data == "wish_call_manager")
async def wish_call_manager(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer(
        "Конечно. Я передал информацию менеджеру, скоро он свяжется с тобой.",
        reply_markup=kb.main_menu_kb(),
    )
    await after_service(call.message, state)
    await call.answer()


@router.callback_query(F.data == "wish_no")
async def wish_no(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer(
        "Хорошо. Если что-то понадобится — напиши мне, помогу.",
        reply_markup=kb.main_menu_kb(),
    )
    await after_service(call.message, state)
    await call.answer()


# ============ АРЕНДА АВТО/БАЙКА ============


@router.callback_query(F.data == "rental_type:car")
async def rental_type_car(call: CallbackQuery, state: FSMContext) -> None:
    await state.update_data(rental_type="Авто")
    await state.set_state(ServiceSG.rental_item)
    await call.message.edit_caption(caption="Выбрано: Авто")
    for car in C.RENTAL_CARS:
        photo_path = os.path.join(C.BASE_DIR, car["photo"])
        if os.path.exists(photo_path):
            await call.message.answer_photo(
                FSInputFile(photo_path),
                caption=f"{car['name']}\n{car['price']}\n{car['seats']}",
                reply_markup=kb.rental_items_kb([car], "rental_car"),
            )
        else:
            await call.message.answer(
                f"🚗 {car['name']}\n{car['price']}\n{car['seats']}\n[Фото машины]",
                reply_markup=kb.rental_items_kb([car], "rental_car"),
            )


@router.callback_query(F.data == "rental_type:bike")
async def rental_type_bike(call: CallbackQuery, state: FSMContext) -> None:
    await state.update_data(rental_type="Байк")
    await state.set_state(ServiceSG.rental_item)
    await call.message.edit_caption(caption="Выбрано: Байк")
    for bike in C.RENTAL_BIKES:
        photo_path = os.path.join(C.BASE_DIR, bike["photo"])
        if os.path.exists(photo_path):
            await call.message.answer_photo(
                FSInputFile(photo_path),
                caption=f"{bike['name']}\n{bike['price']}\n{bike['type']}",
                reply_markup=kb.rental_items_kb([bike], "rental_bike"),
            )
        else:
            await call.message.answer(
                f"🏍 {bike['name']}\n{bike['price']}\n{bike['type']}\n[Фото байка]",
                reply_markup=kb.rental_items_kb([bike], "rental_bike"),
            )


@router.callback_query(F.data.startswith("rental_car:"))
async def rental_select_car(call: CallbackQuery, state: FSMContext) -> None:
    name = call.data.split(":", 1)[1]
    await state.update_data(rental_item=name)
    await state.set_state(ServiceSG.rental_dates)
    await call.message.edit_caption(caption=f"✅ Выбрано: {name}")
    await call.message.answer(C.RENTAL_ASK_DATES, reply_markup=kb.collect_kb())


@router.callback_query(F.data.startswith("rental_bike:"))
async def rental_select_bike(call: CallbackQuery, state: FSMContext) -> None:
    name = call.data.split(":", 1)[1]
    await state.update_data(rental_item=name)
    await state.set_state(ServiceSG.rental_dates)
    await call.message.edit_caption(caption=f"✅ Выбрано: {name}")
    await call.message.answer(C.RENTAL_ASK_DATES, reply_markup=kb.collect_kb())


@router.message(ServiceSG.rental_dates)
async def rental_dates(message: Message, state: FSMContext) -> None:
    await state.update_data(rental_dates=message.text.strip())
    await state.set_state(ServiceSG.rental_delivery)
    await message.answer(C.RENTAL_ASK_DELIVERY, reply_markup=kb.collect_kb())


@router.message(ServiceSG.rental_delivery)
async def rental_delivery(message: Message, state: FSMContext) -> None:
    await state.update_data(rental_delivery=message.text.strip())
    await state.set_state(ServiceSG.rental_pay)
    await message.answer_photo(
        FSInputFile(C.OPLATA_PHOTO) if os.path.exists(C.OPLATA_PHOTO) else "",
        caption="Введите платежные данные",
        reply_markup=kb.rental_confirm_kb(),
    )


@router.callback_query(F.data == "rental_pay")
async def rental_pay(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer(
        "Оплата прошла успешно, машину забронировал! (Заявка уходит в прокат)"
    )
    await after_service(call.message, state)


# ============ ЛИЧНЫЙ ВОДИТЕЛЬ ============


@router.message(ServiceSG.driver_people)
async def driver_people(message: Message, state: FSMContext) -> None:
    await state.update_data(driver_people=message.text.strip())
    await state.set_state(ServiceSG.driver_days)
    await message.answer(C.DRIVER_ASK_DAYS, reply_markup=kb.collect_kb())


@router.message(ServiceSG.driver_days)
async def driver_days(message: Message, state: FSMContext) -> None:
    await state.update_data(driver_days=message.text.strip())
    await state.set_state(ServiceSG.driver_when)
    await message.answer(C.DRIVER_ASK_WHEN, reply_markup=kb.collect_kb())


@router.message(ServiceSG.driver_when)
async def driver_when(message: Message, state: FSMContext) -> None:
    await state.update_data(driver_when=message.text.strip())
    await state.set_state(ServiceSG.driver_confirm)
    await message.answer(C.DRIVER_CONFIRM, reply_markup=kb.driver_confirm_kb())


@router.callback_query(F.data == "driver_pay", ServiceSG.driver_confirm)
async def driver_pay(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.edit_caption(caption="Оплата...")
    await call.message.answer(C.DRIVER_PAYMENT_PHOTO)
    await state.set_state(ServiceSG.driver_paid)
    await call.message.answer(
        C.DRIVER_PAID,
        reply_markup=kb.main_menu_kb(),
    )
    await after_service(call.message, state)


@router.message(ServiceSG.tours_cat)
async def tours_cat_entry(message: Message, state: FSMContext) -> None:
    # 1. Фото Ваяна с рюкзаком + "Возьмешь меня с собой?"
    await message.answer_photo(
        FSInputFile(C.WAYAN_RYUKZAK_PHOTO) if os.path.exists(C.WAYAN_RYUKZAK_PHOTO) else "",
        caption=C.TOURS_INTRO_1,
    )
    # 2. "Да ладно, я и так всегда с тобой!) Давай выберем куда поедем:" + кнопки
    await message.answer(
        C.TOURS_INTRO_2,
        reply_markup=kb.tours_categories_kb(),
    )


@router.callback_query(F.data == "tours_cat:tours")
async def tours_cat_tours(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "tours_cat"})
    await state.set_state(ServiceSG.tours_list)
    await call.message.answer("Туры:")
    for tour in C.TOURS_LIST:
        photo_path = os.path.join(C.BASE_DIR, tour["photo"])
        if os.path.exists(photo_path):
            await call.message.answer_photo(
                FSInputFile(photo_path),
                caption=tour["title"],
                reply_markup=kb.tour_card_kb(tour["id"]),
            )
        else:
            await call.message.answer(
                f"🏞 {tour['title']}\n[Фото тура]",
                reply_markup=kb.tour_card_kb(tour["id"]),
            )


@router.callback_query(F.data == "tours_cat:places", ServiceSG.tours_cat)
async def tours_cat_places(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "tours_cat"})
    await state.set_state(ServiceSG.places_cat)
    await call.message.answer("Отдельные места:", reply_markup=kb.places_categories_kb())


@router.callback_query(F.data == "tours_cat:independent", ServiceSG.tours_cat)
async def tours_cat_independent(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "tours_cat"})
    await call.message.answer(C.TOURS_DEV)


@router.callback_query(F.data.startswith("tour_detail:"))
async def tour_detail(call: CallbackQuery, state: FSMContext) -> None:
    tour_id = call.data.split(":", 1)[1]
    tour = next(t for t in C.TOURS_LIST if t["id"] == tour_id)
    await nav_push(state, {"type": "tours_list"})
    await state.update_data(selected_tour=tour)
    await state.set_state(ServiceSG.tours_detail)
    await call.message.edit_caption(
        caption=tour["details"],
        parse_mode="HTML",
        reply_markup=kb.tour_order_kb(),
    )


@router.callback_query(F.data.startswith("tour_order:"))
async def tour_order_from_card(call: CallbackQuery, state: FSMContext) -> None:
    tour_id = call.data.split(":", 1)[1]
    tour = next(t for t in C.TOURS_LIST if t["id"] == tour_id)
    await state.update_data(selected_tour=tour)
    await state.set_state(ServiceSG.tours_order)
    await call.message.answer_photo(
        FSInputFile(C.OPLATA_PHOTO) if os.path.exists(C.OPLATA_PHOTO) else "",
        caption="Введите платежные данные",
        reply_markup=kb.tour_pay_kb(),
    )


@router.callback_query(F.data == "tour_order", ServiceSG.tours_detail)
async def tour_order(call: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(ServiceSG.tours_order)
    await call.message.answer_photo(
        FSInputFile(C.OPLATA_PHOTO) if os.path.exists(C.OPLATA_PHOTO) else "",
        caption="Введите платежные данные",
        reply_markup=kb.tour_pay_kb(),
    )


@router.callback_query(F.data == "tour_pay", ServiceSG.tours_order)
async def tour_pay(call: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(ServiceSG.tours_paid)
    await call.message.answer(C.TOUR_PAID)
    await call.message.answer("Могу ли я что-то сделать для тебя?")
    await call.answer()


@router.message(ServiceSG.tours_paid)
async def tours_paid_reply(message: Message, state: FSMContext) -> None:
    text = (message.text or "").strip()
    service = route_wish(text)
    if service:
        await start_service(message, state, service)
        return
    await message.answer(
        "Хорошо! Если что-то понадобится — я на связи 24/7.",
        reply_markup=kb.main_menu_kb(),
    )
    await after_service(message, state)


@router.callback_query(F.data.startswith("places_cat:"), ServiceSG.places_cat)
async def places_cat(call: CallbackQuery, state: FSMContext) -> None:
    cat = call.data.split(":", 1)[1]
    items = next(items for c, items in C.PLACES_CATEGORIES if c == cat)
    await nav_push(state, {"type": "places_cat"})
    await state.set_state(ServiceSG.places_list)
    await state.update_data(places_cat=cat)
    await call.message.answer(f"{cat}:", reply_markup=kb.collect_kb())
    for item in items:
        text, photo = C.PLACES_DETAILS[item]
        photo_path = os.path.join(C.BASE_DIR, photo)
        if os.path.exists(photo_path):
            await call.message.answer_photo(
                FSInputFile(photo_path),
                caption=item,
                parse_mode="HTML",
                reply_markup=kb.places_items_kb([item]),
            )
        else:
            await call.message.answer(
                f"🏞 {item}\n[Фото]",
                parse_mode="HTML",
                reply_markup=kb.places_items_kb([item]),
            )


@router.callback_query(F.data.startswith("place_detail:"), ServiceSG.places_list)
async def place_detail(call: CallbackQuery, state: FSMContext) -> None:
    item = call.data.split(":", 1)[1]
    d = await state.get_data()
    await nav_push(state, {"type": "places_list", "cat": d.get("places_cat", "")})
    await state.update_data(selected_place=item)
    await state.set_state(ServiceSG.places_detail)
    text, photo = C.PLACES_DETAILS[item]
    await call.message.edit_caption(
        caption=text,
        parse_mode="HTML",
        reply_markup=kb.place_order_kb(),
    )
    await call.answer()


@router.callback_query(F.data == "place_order", ServiceSG.places_detail)
async def place_order(call: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(ServiceSG.places_paid)
    await call.message.answer_photo(
        FSInputFile(C.OPLATA_PHOTO) if os.path.exists(C.OPLATA_PHOTO) else "",
        caption="Введите платежные данные",
        reply_markup=kb.place_pay_kb(),
    )
    await call.answer()


@router.callback_query(F.data.startswith("place_pay:"))
async def place_pay(call: CallbackQuery, state: FSMContext) -> None:
    item = call.data.split(":", 1)[1]
    await state.update_data(selected_place=item)
    await state.set_state(ServiceSG.places_paid)
    await call.message.answer_photo(
        FSInputFile(C.OPLATA_PHOTO) if os.path.exists(C.OPLATA_PHOTO) else "",
        caption="Введите платежные данные",
        reply_markup=kb.place_pay_kb(),
    )
    await call.answer()


@router.callback_query(F.data == "place_pay_confirm", ServiceSG.places_paid)
async def place_pay_confirm(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer(C.TOUR_PAID)
    await call.message.answer("Могу ли я что-то сделать для тебя?")
    await call.answer()


@router.message(ServiceSG.places_paid)
async def places_paid_reply(message: Message, state: FSMContext) -> None:
    text = (message.text or "").strip()
    service = route_wish(text)
    if service:
        await start_service(message, state, service)
        return
    await message.answer(
        "Хорошо! Если что-то понадобится — я на связи 24/7.",
        reply_markup=kb.main_menu_kb(),
    )
    await after_service(message, state)


# ============ WELLNESS (Цветы/Еда/Массаж/SPA) ============


@router.callback_query(F.data.startswith("wellness:"))
async def wellness_cat(call: CallbackQuery, state: FSMContext) -> None:
    cat = call.data.split(":", 1)[1]
    await nav_push(state, {"type": "wellness"})
    await state.update_data(wellness_cat=cat)
    await state.set_state(ServiceSG.wellness_detail)
    question = C.WELLNESS_QUESTIONS.get(cat, "Уточни детали заказа:")
    await call.message.answer(
        f"<b>{cat}</b>\n\n{question}",
        parse_mode="HTML",
        reply_markup=kb.collect_kb(),
    )


@router.message(ServiceSG.wellness_detail)
async def wellness_detail(message: Message, state: FSMContext) -> None:
    await state.set_state(ServiceSG.wish)
    await message.answer("Отправил заявку менеджеру. Разделы в разработке!")
    await after_service(message, state)


# ============ КОНСЬЕРЖ-СЕРВИС ============


@router.callback_query(F.data == "concierge:cleaning")
async def concierge_cleaning(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "concierge"})
    await state.set_state(ServiceSG.concierge_cleaning_time)
    await call.message.answer("Во сколько прийти стаффу?")


@router.message(ServiceSG.concierge_cleaning_time)
async def concierge_cleaning_time(message: Message, state: FSMContext) -> None:
    await message.answer("Хорошо, я передал запрос стаффу.")
    await after_service(message, state)


@router.callback_query(F.data == "concierge:laundry")
async def concierge_laundry(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "concierge"})
    await state.set_state(ServiceSG.concierge_laundry_detail)
    await call.message.answer("Стирка\n\nУточни детали (что стирать, когда забрать):")


@router.message(ServiceSG.concierge_laundry_detail)
async def concierge_laundry_detail(message: Message, state: FSMContext) -> None:
    await message.answer("Хорошо, я передал запрос стаффу.")
    await after_service(message, state)


@router.callback_query(F.data == "concierge:run")
async def concierge_run(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "concierge"})
    await state.set_state(ServiceSG.concierge_run_detail)
    await call.message.answer("Конечно. Что тебе нужно купить или забрать?")


@router.message(ServiceSG.concierge_run_detail)
async def concierge_run_detail(message: Message, state: FSMContext) -> None:
    await message.answer("Уже бегу!")
    await after_service(message, state)


# ============ УПРАВЛЯТЬ БРОНИРОВАНИЕМ ============


@router.callback_query(F.data == "booking_manage:extend")
async def booking_extend(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "booking_manage"})
    await state.set_state(ServiceSG.booking_extend_days)
    await call.message.answer("Продлить проживание\n\nНа какой срок хочешь продлить проживание?")


@router.message(ServiceSG.booking_extend_days)
async def booking_extend_days(message: Message, state: FSMContext) -> None:
    await state.update_data(extend_days=message.text.strip())
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    await message.answer("Да, ты можешь продлить бронирование, стоимость 1.800.000 IDR.")
    await message.answer(
        "Гостю будет отправлена информация по продлению и кнопка оплаты.",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[[InlineKeyboardButton(text="Забронировать и оплатить", callback_data="extend_pay")]]
        ),
    )


@router.callback_query(F.data == "extend_pay")
async def extend_pay(call: CallbackQuery, state: FSMContext) -> None:
    await call.message.answer("Готово, бронирование продлено! Информация передана менеджеру.")
    await after_service(call.message, state)
    await call.answer()


@router.callback_query(F.data == "booking_manage:early")
async def booking_early(call: CallbackQuery, state: FSMContext) -> None:
    await nav_push(state, {"type": "booking_manage"})
    await call.message.answer("Уехать раньше\n\nЗапрос передал в службу бронирования, скоро с тобой свяжется менеджер!")
    await after_service(call.message, state)


# ============ Fallback (всегда последний) ============


@router.message()
async def fallback(message: Message, state: FSMContext) -> None:
    service = route_wish(message.text or "")
    if service:
        await start_service(message, state, service)
        return
    data = await state.get_data()
    concierge = data.get("concierge", False)
    await message.answer("Используй кнопки меню.", reply_markup=kb.menu_kb(concierge))