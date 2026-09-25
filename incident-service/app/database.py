import os

from dotenv import load_dotenv
from pymongo import MongoClient

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise ValueError("MONGODB_URL is not set in .env")

client = MongoClient(MONGODB_URL)

db = client["resqlink_incidents"]

incidents_collection = db["incidents"]

users_collection = db["users"]