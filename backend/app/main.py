from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, workspaces, files, chat

app = FastAPI(title="AskSheets API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(workspaces.router, prefix="/workspaces", tags=["Workspaces"])
app.include_router(files.router, prefix="/workspaces", tags=["Files"])
app.include_router(chat.router, prefix="/workspaces", tags=["Chat"])