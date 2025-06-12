import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api.rest.routes.auth import router as auth_router
from api.rest.routes.admin import router as admin_router
from api.rest.routes.consultation import router as consultation_router
from api.rest.routes.websocket import router as websocket_router
from .logger import LogLevels, configure_logging
from config import settings

configure_logging(LogLevels.error)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(consultation_router)
app.include_router(websocket_router)

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
