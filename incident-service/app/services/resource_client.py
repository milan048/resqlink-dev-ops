import os

import httpx
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        ".."
    )
)

load_dotenv(os.path.join(BASE_DIR, ".env"))

RESOURCE_SERVICE_URL = os.getenv(
    "RESOURCE_SERVICE_URL",
    "http://127.0.0.1:8001"
)


async def find_matching_resources(
    incident_type: str,
    severity: str,
    location: str,
    token: str
):
    url = f"{RESOURCE_SERVICE_URL}/resources/match"

    payload = {
        "incident_type": incident_type,
        "severity": severity,
        "location": location
    }

    headers = {
        "Authorization": f"Bearer {token}"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            url,
            json=payload,
            headers=headers
        )

    response.raise_for_status()

    return response.json()