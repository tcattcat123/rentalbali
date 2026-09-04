# -*- coding: utf-8 -*-
"""FSM-состояния бота."""

from aiogram.fsm.state import State, StatesGroup


class AuthSG(StatesGroup):
    wait_phone = State()
    post_auth = State()


class MainMenuSG(StatesGroup):
    menu = State()


class ManagerSG(StatesGroup):
    question = State()


class ScenarioSG(StatesGroup):
    choose = State()
    run = State()


class ServiceSG(StatesGroup):
    # Трансфер (новый flow)
    transfer_from = State()
    transfer_to = State()
    transfer_people = State()
    transfer_luggage = State()
    transfer_time = State()
    transfer_offer = State()
    transfer_pay = State()

    booking_area = State()
    booking_dates = State()
    booking_guests = State()
    booking_options = State()

    # Новый flow: Забронировать новую виллу
    booking_new_area = State()
    booking_new_dates = State()
    booking_new_guests = State()
    booking_new_variant = State()
    booking_new_paid = State()

    # Аренда авто/байка
    rental_type = State()
    rental_item = State()
    rental_dates = State()
    rental_delivery = State()
    rental_confirm = State()
    rental_paid = State()

    # Личный водитель
    driver_people = State()
    driver_days = State()
    driver_when = State()
    driver_confirm = State()
    driver_paid = State()

    # Экскурсии
    tours_cat = State()
    tours_list = State()
    tours_detail = State()
    tours_order = State()
    tours_paid = State()

    # Отдельные места
    places_cat = State()
    places_list = State()
    places_detail = State()
    places_order = State()
    places_paid = State()

    # Wellness (Цветы/Еда/Массаж/SPA)
    wellness_cat = State()
    wellness_detail = State()

    # Консьерж-сервис
    concierge_cat = State()
    concierge_cleaning_time = State()
    concierge_laundry_detail = State()
    concierge_run_detail = State()

    # Управление бронированием
    booking_manage_cat = State()
    booking_extend_days = State()
    booking_extend_pay = State()

    wish = State()


class CollectSG(StatesGroup):
    """Свободный ввод внутри сценария (возврат по return_to)."""
    wait = State()