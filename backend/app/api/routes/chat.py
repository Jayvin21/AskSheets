from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import pandas as pd

from app.api.routes.workspaces import workspaces

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    filename: Optional[str] = None


def clean_records(df: pd.DataFrame):
    cleaned = df.copy()
    float_columns = cleaned.select_dtypes(include=["float"]).columns
    cleaned[float_columns] = cleaned[float_columns].round(2)
    return cleaned.fillna("").to_dict(orient="records")


def resolve_file(workspace: dict, filename: Optional[str]):
    files = workspace.get("files", [])

    if not files:
        raise HTTPException(
            status_code=400,
            detail="No files uploaded in this workspace"
        )

    if filename:
        for item in files:
            if item.get("filename") == filename:
                return item

        raise HTTPException(
            status_code=404,
            detail=f"File not found in workspace: {filename}"
        )

    return files[-1]


def make_grouped_insights(result: pd.DataFrame, group_column: str):
    if result.empty or "Total_Amount" not in result.columns:
        return []

    total = float(result["Total_Amount"].sum())
    top = result.iloc[0]
    bottom = result.iloc[-1]

    top_label = str(top[group_column])
    bottom_label = str(bottom[group_column])
    top_value = float(top["Total_Amount"])
    bottom_value = float(bottom["Total_Amount"])

    insights = [
        f"{top_label} leads with {round(top_value, 2):,} in total sales.",
        f"{bottom_label} is the lowest group with {round(bottom_value, 2):,} in total sales.",
    ]

    if total > 0:
        top_share = round((top_value / total) * 100, 1)
        insights.append(f"{top_label} contributes {top_share}% of total sales.")

    if len(result) >= 2:
        second = result.iloc[1]
        second_value = float(second["Total_Amount"])
        gap = round(top_value - second_value, 2)
        insights.append(f"The gap between the top two groups is {gap:,}.")

    return insights


def make_summary_insights(df: pd.DataFrame):
    insights = [f"The dataset has {len(df)} rows and {len(df.columns)} columns."]

    numeric_columns = df.select_dtypes(include=["number"]).columns

    if len(numeric_columns) > 0:
        insights.append(
            f"There are {len(numeric_columns)} numeric columns available for statistical analysis."
        )

    if "Total_Amount" in df.columns:
        total = round(float(df["Total_Amount"].sum()), 2)
        avg = round(float(df["Total_Amount"].mean()), 2)
        max_value = round(float(df["Total_Amount"].max()), 2)
        insights.append(f"Total sales across the file are {total:,}.")
        insights.append(f"Average transaction value is {avg:,}.")
        insights.append(f"The highest transaction value is {max_value:,}.")

    if "Quantity" in df.columns:
        avg_qty = round(float(df["Quantity"].mean()), 2)
        insights.append(f"Average quantity per row is {avg_qty}.")

    return insights


def default_followups():
    return [
        "Would you like to see sales by product category?",
        "Would you like a summary of the dataset?",
        "Would you like to compare payment methods?",
    ]


@router.post("/{workspace_id}/chat")
def chat_with_workspace(workspace_id: str, payload: ChatRequest):
    if workspace_id not in workspaces:
        raise HTTPException(status_code=404, detail="Workspace not found")

    workspace = workspaces[workspace_id]
    selected_file = resolve_file(workspace, payload.filename)
    file_path = selected_file["path"]

    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read CSV: {str(e)}"
        )

    question = payload.question.lower()

    if "columns" in question:
        return {
            "type": "columns",
            "answer": f"These are the columns in {selected_file['filename']}.",
            "columns": list(df.columns),
            "insights": [
                f"{selected_file['filename']} contains {len(df.columns)} columns.",
                "These columns define what analysis questions the system can answer reliably."
            ],
            "follow_ups": [
                "Would you like a numeric summary?",
                "Would you like to preview the first rows?",
                "Would you like to analyze sales by category?"
            ]
        }

    if "preview" in question or "sample" in question or "first rows" in question:
        return {
            "type": "preview",
            "answer": f"Here are the first 10 rows from {selected_file['filename']}.",
            "table": clean_records(df.head(10)),
            "insights": [
                "This preview helps verify that the CSV was parsed correctly.",
                f"The full dataset contains {len(df)} rows."
            ],
            "follow_ups": default_followups()
        }

    if "row" in question or "records" in question or "transactions" in question:
        return {
            "type": "row_count",
            "answer": f"{selected_file['filename']} has {len(df)} rows.",
            "row_count": len(df),
            "insights": [
                f"The selected file contains {len(df)} rows.",
                "Row count is useful for validating file size before deeper analysis."
            ],
            "follow_ups": [
                "Would you like to see a preview?",
                "Would you like a summary?",
                "Would you like sales grouped by region?"
            ]
        }

    group_column = None

    if "region" in question:
        group_column = "Region"
    elif "product category" in question or "category" in question:
        group_column = "Product_Category"
    elif "payment method" in question or "payment" in question:
        group_column = "Payment_Method"
    elif "customer segment" in question or "segment" in question:
        group_column = "Customer_Segment"
    elif "product name" in question or "product" in question:
        group_column = "Product_Name"

    if group_column and "Total_Amount" in df.columns:
        if group_column not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"Column not found: {group_column}"
            )

        result = (
            df.groupby(group_column)["Total_Amount"]
            .sum()
            .reset_index()
            .sort_values("Total_Amount", ascending=False)
        )

        top_row = result.iloc[0]
        top_label = top_row[group_column]
        top_value = round(float(top_row["Total_Amount"]), 2)

        return {
            "type": "grouped_sales",
            "answer": f"{top_label} has the highest total sales at {top_value}.",
            "table": clean_records(result),
            "chart": {
                "type": "bar",
                "x": group_column,
                "y": "Total_Amount",
                "title": f"Total sales by {group_column}"
            },
            "insights": make_grouped_insights(result, group_column),
            "follow_ups": [
                "Would you like to break this down by payment method?",
                "Would you like to see sales by product category?",
                "Would you like a full numeric summary?"
            ]
        }

    if "summary" in question or "describe" in question or "overview" in question:
        numeric_summary = df.describe().round(2).fillna("").to_dict()

        return {
            "type": "summary",
            "answer": f"Here is a basic numeric summary of {selected_file['filename']}.",
            "row_count": len(df),
            "columns": list(df.columns),
            "summary": numeric_summary,
            "insights": make_summary_insights(df),
            "follow_ups": [
                "Would you like to see total sales by region?",
                "Would you like to analyze product categories?",
                "Would you like to compare customer segments?"
            ]
        }

    return {
        "type": "fallback",
        "answer": "I can currently answer: columns, preview, row count, total sales by region, total sales by category, total sales by product, payment method, customer segment, or summary.",
        "supported_examples": [
            "Show me the columns",
            "Show preview rows",
            "How many rows are there?",
            "What is total sales by region?",
            "What is total sales by category?",
            "What is total sales by product?",
            "What is total sales by payment method?",
            "Give me a summary"
        ],
        "insights": [
            "The current rule-based analyst works best with structured sales-style CSV files.",
            "For broader natural-language support, the next step is adding an LLM query planner."
        ],
        "follow_ups": default_followups()
    }
