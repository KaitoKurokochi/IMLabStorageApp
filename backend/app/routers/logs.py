from fastapi import APIRouter
from typing import List, Optional
from app.models import UsageLogResponse
from app.database import db

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("", response_model=List[UsageLogResponse])
async def list_logs(limit: int = 50):
    """利用ログ一覧を取得"""
    return await db.get_logs(limit=limit)

