"""Simulation helpers.

Build a pre-filled booking (Villa #7 with dates based on the scenario) and
compose the guest-facing opening message for each scenario.
"""

from __future__ import annotations

from datetime import datetime, timedelta

from config import SCENARIO_SIM, VILLA_NAME
from prompts import get_intro


def build_booking(scenario_key: str) -> dict:
    """Return a pre-filled booking dict for the scenario."""
    cfg = SCENARIO_SIM[scenario_key]
    checkin = datetime.now().date() + timedelta(days=cfg["days_until_checkin"])
    checkout = checkin + timedelta(days=cfg["stay_days"])
    return {
        "villa": VILLA_NAME,
        "checkin": checkin.strftime("%d.%m.%Y"),
        "checkout": checkout.strftime("%d.%m.%Y"),
        "stay": cfg["stay_days"],
        "offers": list(cfg["offers"]),
        "scenario_key": scenario_key,
    }


def guest_intro(booking: dict) -> str:
    """Compose the guest-facing message with the pre-filled booking."""
    return get_intro(booking["scenario_key"]).format(**booking)