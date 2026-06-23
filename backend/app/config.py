from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://video_ratings:video_ratings@localhost:5432/video_ratings"
    smb_username: str = ""
    smb_password: str = ""
    upload_dir: str = "uploads"
    frontend_dir: str = ""
    secret_key: str
    session_timeout_seconds: int = 7200
    debug: bool = False

    model_config = {"env_file": ".env"}


settings = Settings()
