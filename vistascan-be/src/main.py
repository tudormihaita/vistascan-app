import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api.rest.routes.auth import router as auth_router
from api.rest.routes.consultation import router as consultation_router
from .logger import LogLevels, configure_logging
from config import settings

configure_logging(LogLevels.error)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# TODO: add exception and event handlers
app.include_router(auth_router)
app.include_router(consultation_router)

@app.get("/healthcheck")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
