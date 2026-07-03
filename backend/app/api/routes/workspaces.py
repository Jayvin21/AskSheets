from fastapi import APIRouter
from pydantic import BaseModel
from uuid import uuid4

router = APIRouter()

# Temporary in-memory storage
# Later we replace this with SQLite/Postgres
workspaces = {}


class WorkspaceCreate(BaseModel):
    name: str


@router.post("/")
def create_workspace(payload: WorkspaceCreate):
    workspace_id = str(uuid4())

    workspace = {
        "id": workspace_id,
        "name": payload.name,
        "files": []
    }

    workspaces[workspace_id] = workspace

    return workspace


@router.get("/")
def list_workspaces():
    return list(workspaces.values())


@router.get("/{workspace_id}")
def get_workspace(workspace_id: str):
    return workspaces.get(workspace_id, {
        "error": "Workspace not found"
    })