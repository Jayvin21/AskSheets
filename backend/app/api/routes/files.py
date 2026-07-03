from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import pandas as pd
import shutil

from app.api.routes.workspaces import workspaces

router = APIRouter()

STORAGE_DIR = Path("storage")


def calculate_csv_health(df: pd.DataFrame):
    total_cells = max(1, df.shape[0] * df.shape[1])

    missing_cells = int(df.isna().sum().sum())
    missing_ratio = missing_cells / total_cells

    duplicate_rows = int(df.duplicated().sum())
    duplicate_ratio = duplicate_rows / max(1, len(df))

    empty_columns = int((df.isna().all()).sum())

    numeric_columns = df.select_dtypes(include=["number"]).columns.tolist()
    text_columns = df.select_dtypes(include=["object"]).columns.tolist()

    score = 100
    score -= missing_ratio * 40
    score -= duplicate_ratio * 30
    score -= empty_columns * 5

    score = max(0, min(100, round(score)))

    if score >= 90:
        status = "Excellent"
    elif score >= 75:
        status = "Good"
    elif score >= 60:
        status = "Needs review"
    else:
        status = "Poor"

    recommendations = []

    if missing_cells > 0:
        recommendations.append(f"Review {missing_cells} missing values before deeper analysis.")

    if duplicate_rows > 0:
        recommendations.append(f"Remove or verify {duplicate_rows} duplicate rows.")

    if empty_columns > 0:
        recommendations.append(f"Drop {empty_columns} fully empty columns.")

    if len(numeric_columns) == 0:
        recommendations.append("No numeric columns detected, so chart and summary options may be limited.")

    if not recommendations:
        recommendations.append("Dataset looks clean enough for analysis.")

    return {
        "score": score,
        "status": status,
        "missing_cells": missing_cells,
        "missing_ratio": round(missing_ratio * 100, 2),
        "duplicate_rows": duplicate_rows,
        "duplicate_ratio": round(duplicate_ratio * 100, 2),
        "empty_columns": empty_columns,
        "numeric_columns": len(numeric_columns),
        "text_columns": len(text_columns),
        "recommendations": recommendations
    }


@router.post("/{workspace_id}/files")
def upload_file(workspace_id: str, file: UploadFile = File(...)):
    if workspace_id not in workspaces:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported right now"
        )

    workspace_dir = STORAGE_DIR / workspace_id
    workspace_dir.mkdir(parents=True, exist_ok=True)

    file_path = workspace_dir / file.filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read CSV file: {str(e)}"
        )

    preview = df.head(10).fillna("").to_dict(orient="records")
    health = calculate_csv_health(df)

    file_info = {
        "filename": file.filename,
        "path": str(file_path),
        "columns": list(df.columns),
        "row_count": len(df),
        "health": health
    }

    existing_files = workspaces[workspace_id].get("files", [])
    existing_files = [
        item for item in existing_files
        if item.get("filename") != file.filename
    ]
    existing_files.append(file_info)
    workspaces[workspace_id]["files"] = existing_files

    return {
        "message": "File uploaded successfully",
        "workspace_id": workspace_id,
        "filename": file.filename,
        "columns": list(df.columns),
        "row_count": len(df),
        "preview": preview,
        "health": health
    }


@router.delete("/{workspace_id}/files/{filename}")
def delete_file(workspace_id: str, filename: str):
    if workspace_id not in workspaces:
        raise HTTPException(status_code=404, detail="Workspace not found")

    workspace = workspaces[workspace_id]
    files = workspace.get("files", [])

    target = None
    for item in files:
        if item.get("filename") == filename:
            target = item
            break

    if not target:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = Path(target["path"])

    if file_path.exists():
        file_path.unlink()

    workspace["files"] = [
        item for item in files
        if item.get("filename") != filename
    ]

    return {
        "message": "File deleted successfully",
        "filename": filename
    }
