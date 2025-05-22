import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

class Settings:
    app_name: str = os.getenv("APP_NAME", "Vistascan API")
    app_version: str = os.getenv("APP_VERSION", "0.1.0")

    db_uri: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    db_name: str = os.getenv("MONGO_DB", "vistascan_dev")

    jwt_secret: str = os.getenv("JWT_SECRET")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expiration: int = int(os.getenv("JWT_EXPIRATION", 3600))

    minio_endpoint: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    minio_access_key: str = os.getenv("MINIO_ACCESS_KEY")
    minio_secret_key: str = os.getenv("MINIO_SECRET_KEY")
    minio_bucket: str = os.getenv("MINIO_BUCKET", "vistascan-studies")
    minio_secure: bool = os.getenv("MINIO_SECURE", "False").lower() == "true"

    model_service_url: str = os.getenv("MODEL_SERVICE_URL", "http://localhost:8001")

    cors_origins: list = os.getenv("CORS_ORIGINS", "*").split(",")


settings = Settings()