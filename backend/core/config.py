# core/config.py
# ─────────────────────────────────────────────────────
# This file reads ALL values from the .env file
# using Pydantic BaseSettings
#
# HOW PYDANTIC WORKS HERE:
# 1. We define variables with their types
# 2. Pydantic automatically finds them in .env
# 3. If a value is missing → Pydantic throws an error
# 4. If a value has wrong type → Pydantic throws an error
# ─────────────────────────────────────────────────────

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # ── Database ────────────────────────────────
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "brandforge"

    # ── Security ────────────────────────────────
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── AI ─────────didn't use it yet ─────────
    GEMINI_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""

    # ── App Info ────────────────────────────────
    APP_NAME: str = "BrandForge"
    APP_VERSION: str = "1.0.0"

    # Tell Pydantic where the .env file is
    model_config = {"env_file": ".env"}

    # ── Build the MySQL connection URL ──────────
    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


# Create ONE instance — import this everywhere
settings = Settings()