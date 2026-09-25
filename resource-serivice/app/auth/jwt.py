import os

from dotenv import load_dotenv
from jose import JWTError, jwt

BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        ".."
    )
)

load_dotenv(os.path.join(BASE_DIR, ".env"))

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "change-this-secret-key"
)

ALGORITHM = "HS256"


def decode_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        return None