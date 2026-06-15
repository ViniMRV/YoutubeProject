import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]

video_collection = database.get_collection("videos")
preferences_collection = database.get_collection("preferencias_usuario")
playlists_collection = database.get_collection("playlists")
users_collection = database.get_collection("usuarios")