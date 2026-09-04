"""Guest-facing prompts shown when a scenario simulation starts.

Each active scenario has its own prompt (the message a real guest would see),
with the pre-filled booking inserted. The text demonstrates how the bot
approaches the guest differently depending on the timing.
"""

# {scenario_key}: {checkin} {checkout} {stay} {villa}
SCENARIO_INTRO = {
    "pre_arrival_more_7": (
        "🌴 Hey! Your booking at {villa} is confirmed.\n"
        "📅 Check-in: {checkin}\n"
        "📅 Check-out: {checkout}\n"
        "🏠 Stay: {stay} days\n"
        "\n"
        "Your arrival is more than a week away, so we can arrange "
        "everything in advance. Here's what we can offer you:"
    ),
    "pre_arrival_less_7": (
        "🌴 Hey! Your booking at {villa} is confirmed.\n"
        "📅 Check-in: {checkin}\n"
        "📅 Check-out: {checkout}\n"
        "🏠 Stay: {stay} days\n"
        "\n"
        "Since your check-in is soon, let's get you sorted right away. "
        "What can we arrange for you?"
    ),
    "accommodation_1_day": (
        "🌴 Hi! You're staying with us at {villa}.\n"
        "📅 Check-in: {checkin}\n"
        "📅 Check-out: {checkout}\n"
        "🏠 Stay: {stay} day\n"
        "\n"
        "With a short one-day stay, here are the quick services "
        "we can arrange for you right now:"
    ),
    "accommodation_3_days": (
        "🌴 Hi! Welcome to {villa}.\n"
        "📅 Check-in: {checkin}\n"
        "📅 Check-out: {checkout}\n"
        "🏠 Stay: {stay} days\n"
        "\n"
        "For your stay, we can arrange for you:"
    ),
}


def get_intro(scenario_key: str) -> str:
    return SCENARIO_INTRO.get(scenario_key, "")