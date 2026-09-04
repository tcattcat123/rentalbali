"""Knowledge base for Bali Villa 7.

Facts are grouped by scenario key and by service. The AI (via OpenRouter)
grounds its guest-facing answers on these facts before responding.
"""

from __future__ import annotations

SCENARIO_KNOWLEDGE: dict[str, list[str]] = {
    "pre_arrival_more_7": [
        "Bookings made more than 7 days in advance get a 10% early-bird "
        "discount and free early check-in from 12:00.",
        "We recommend booking airport transfer and excursions in advance — "
        "the full tour catalogue is available.",
        "Romantic setup and driver-for-the-day can be arranged before arrival.",
    ],
    "pre_arrival_less_7": [
        "Bookings within 7 days are confirmed quickly; standard check-in "
        "is 15:00.",
        "Airport transfer can still be booked, availability depends on the "
        "schedule.",
        "SPA and massage slots are offered on a first-come, first-served basis.",
    ],
    "accommodation_1_day": [
        "One-day stays are charged for the full day; check-in from 15:00, "
        "check-out by 11:00.",
        "For a short stay we offer quick on-site services: scooter rental, "
        "restaurant reservations and express massage.",
    ],
    "accommodation_3_days": [
        "Stays of 3 days or more include a complimentary welcome drink and "
        "10% off spa and massage services.",
        "Multi-day guests can book a driver for the day, excursions and "
        "cleaning/laundry/grocery services.",
    ],
}

SERVICE_KNOWLEDGE: dict[str, list[str]] = {
    "🚗 Airport transfer": "Meet & greet at arrivals, 24/7, flat rate 35 USD.",
    "🚘 Car & bike rental": "Cars and scooters available at the villa, "
    "insurance included, daily rate from 20 USD.",
    "👨‍✈️ Personal driver": "English-speaking driver for the day, 8 hours, "
    "from 90 USD.",
    "🗺 Excursions & tours": "Private tours to waterfalls, temples and "
    "islands; pick-up from the villa.",
    "💆 Massage / SPA": "In-villa spa sessions by certified therapists, "
    "1 hour from 45 USD.",
    "🌸 Flowers, gifts, romantic setup": "Flowers, wine, candlelight "
    "decor for your villa, arranged on request.",
    "🧹 Cleaning, laundry, grocery delivery": "Daily cleaning, laundry "
    "service and grocery delivery within 2 hours.",
    "🛵 Scooter & bike rental": "Scooters from 15 USD/day, bikes from 5 USD/day.",
    "🍽 Restaurant reservation": "Reservations at the best local restaurants, "
    "private beach dinners available.",
    "💆 Express massage": "30-minute express massage at the villa, 30 USD.",
    "🚗 Taxi / transfer": "Taxi on demand 24/7, airport transfer from 35 USD.",
    "📋 Manage booking": "Change dates, extend the stay or request an "
    "invoice — we handle it.",
    "🏠 Find new accommodation": "We can help find another villa in Bali "
    "matching your needs.",
}

DEFAULT_KNOWLEDGE = (
    "Bali Villa 7 is a premium beachfront villa resort offering luxurious "
    "accommodations, concierge service, spa, and dining."
)


def snippet(key: str, query: str = "") -> str:
    """Return the best knowledge snippet for a scenario key or service."""
    facts = SCENARIO_KNOWLEDGE.get(key) or SERVICE_KNOWLEDGE.get(key)
    if not facts:
        return DEFAULT_KNOWLEDGE
    if not query:
        return " ".join(facts)
    q = query.lower()
    for fact in facts:
        if q in fact.lower():
            return fact
    return facts[0]