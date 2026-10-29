import os
from typing import List
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables from .env file
# Looks for backend/.env first, then root .env
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_env = os.path.join(current_dir, ".env")
root_env = os.path.join(os.path.dirname(current_dir), ".env")

if os.path.exists(backend_env):
    load_dotenv(backend_env)
elif os.path.exists(root_env):
    load_dotenv(root_env)
else:
    load_dotenv()

def parse_cors_origins(cors_str: str) -> List[str]:
    if not cors_str:
        return ["*"]
    if cors_str.strip() == "*":
        return ["*"]
    return [origin.strip() for origin in cors_str.split(",") if origin.strip()]

class Settings(BaseModel):
    PROJECT_NAME: str = "杉本研究室 備品管理アプリ"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "imlab_storage")

    # Uploads directory
    _raw_upload_dir: str = os.getenv("UPLOAD_DIR", "static/uploads")
    UPLOAD_DIR: str = os.path.abspath(os.path.join(current_dir, _raw_upload_dir)) if not os.path.isabs(_raw_upload_dir) else _raw_upload_dir

    # Security / Passphrase
    APP_PASSPHRASE: str = os.getenv("APP_PASSPHRASE", "imlab-sugimoto")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "imlab-secret-key-change-in-production")
    PASSPHRASE_TOKEN_EXPIRE_DAYS: int = int(os.getenv("PASSPHRASE_TOKEN_EXPIRE_DAYS", "365"))

    # CORS
    CORS_ORIGINS: List[str] = parse_cors_origins(
        os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,*")
    )

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
