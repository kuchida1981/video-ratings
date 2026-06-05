from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://video_ratings:video_ratings@localhost:5432/video_ratings"

    model_config = {"env_file": ".env"}


settings = Settings()
