import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-that-should-be-changed")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

settings = Settings()
