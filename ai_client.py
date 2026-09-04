"""OpenRouter AI client.

Sends a system + user prompt to OpenRouter and returns the AI text.
If no API key is configured (or the request fails), returns ``None`` so the
caller can fall back to a static, knowledge-grounded message.
"""

from __future__ import annotations

import logging

import aiohttp

from config import (
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL,
    OPENROUTER_URL,
    OPENROUTER_TIMEOUT,
)

logger = logging.getLogger(__name__)

CONCIERGE_SYSTEM = (
    "You are the concierge bot of Bali Villa 7, a premium beachfront resort "
    "in Bali. You talk to guests in a warm, concise way. Always ground "
    "factual answers in the knowledge base facts provided. Never ask for "
    "passport, personal booking data or payment details."
)


async def ask_ai(user_text: str, system: str = CONCIERGE_SYSTEM) -> str | None:
    """Ask OpenRouter for a response. Returns None if AI is unavailable."""
    if not OPENROUTER_API_KEY:
        return None

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_text},
        ],
    }
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://BaliVilla7.local",
        "X-Title": "Bali Villa 7 Bot",
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                OPENROUTER_URL,
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=OPENROUTER_TIMEOUT),
            ) as resp:
                if resp.status != 200:
                    logger.warning("OpenRouter error %s: %s",
                                   resp.status, await resp.text())
                    return None
                result = await resp.json()
            return result["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.warning("OpenRouter request failed: %s", e)
        return None