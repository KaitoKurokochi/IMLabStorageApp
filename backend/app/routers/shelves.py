from fastapi import APIRouter, HTTPException
from typing import List
from app.models import ShelfResponse, ItemResponse
from app.database import db

router = APIRouter(prefix="/shelves", tags=["shelves"])

@router.get("", response_model=List[ShelfResponse])
async def list_shelves():
    """棚の一覧と各棚のアイテム数を取得"""
    return await db.get_shelves()

@router.get("/{shelf_id}")
async def get_shelf_detail(shelf_id: str):
    """特定の棚の詳細情報と、その棚に保管されているアイテム一覧を取得"""
    shelf = await db.get_shelf(shelf_id)
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
    
    items = await db.get_items(shelf_id=shelf_id)
    return {
        "shelf": shelf,
        "items": items
    }

