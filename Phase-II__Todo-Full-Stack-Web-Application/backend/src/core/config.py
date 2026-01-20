import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    BETTER_AUTH_SECRET: str = os.getenv("BETTER_AUTH_SECRET")

settings = Settings()
