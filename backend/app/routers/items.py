import os
import io
import csv
import json
import uuid
import shutil
from typing import Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Response
from fastapi.responses import StreamingResponse
from app.models import ItemResponse, ItemCreate, ItemBorrowRequest, UsageLogResponse
from app.database import db
from app.config import settings

router = APIRouter(prefix="/items", tags=["items"])

@router.get("", response_model=List[ItemResponse])
async def list_items(
    q: Optional[str] = Query(None, description="検索キーワード"),
    shelf_id: Optional[str] = Query(None, description="棚ID"),
    status: Optional[str] = Query(None, description="ステータス (available / in_use)"),
    category: Optional[str] = Query(None, description="カテゴリ"),
    user_id: Optional[str] = Query(None, description="使用者ID")
):
    """備品一覧を取得 (検索・フィルタ対応)"""
    return await db.get_items(
        query=q,
        shelf_id=shelf_id,
        status=status,
        category=category,
        user_id=user_id
    )

@router.post("", response_model=ItemResponse)
async def create_item(item_in: ItemCreate):
    """新しい備品を登録"""
    # Shelf validation
    shelf = await db.get_shelf(item_in.shelf_id)
    if not shelf:
        raise HTTPException(status_code=400, detail=f"棚 {item_in.shelf_id} が存在しません。")

    created = await db.create_item(item_in.dict())
    return created

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """備品画像のアップロード"""
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="許可されていない画像形式です。jpg/png/webp/gifをご使用ください。")

    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/static/uploads/{filename}"}

@router.get("/export/json")
async def export_json():
    """備品一覧をJSON形式でエクスポート"""
    items = await db.get_items()
    json_str = json.dumps(items, ensure_ascii=False, indent=2, default=str)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="imlab_items.json"'}
    )

@router.get("/export/csv")
async def export_csv():
    """備品一覧をCSV形式でエクスポート"""
    items = await db.get_items()
    output = io.StringIO()
    # Write UTF-8 BOM so Excel opens it correctly with Japanese characters
    output.write('\ufeff')
    writer = csv.writer(output)
    writer.writerow([
        "備品ID", "備品名", "保管棚", "ジャンル", "状態",
        "現在の使用者", "最後に使用した人", "最終使用日時", "詳細情報", "画像URL"
    ])
    for item in items:
        status_label = "使用中" if item.get("status") == "in_use" else "貸出可能"
        writer.writerow([
            item.get("id", ""),
            item.get("name", ""),
            item.get("shelf_id", ""),
            item.get("category", ""),
            status_label,
            item.get("current_user_name") or "",
            item.get("last_user_name") or "",
            item.get("last_used_at") or "",
            item.get("description", ""),
            item.get("image_url") or ""
        ])

    csv_data = output.getvalue().encode("utf-8-sig")
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="imlab_items.csv"'}
    )

@router.get("/{item_id}")
async def get_item_detail(item_id: str):
    """備品詳細と過去の利用履歴を取得"""
    item = await db.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    shelf = await db.get_shelf(item.get("shelf_id", ""))
    logs = await db.get_logs(item_id=item_id, limit=20)

    return {
        "item": item,
        "shelf": shelf,
        "logs": logs
    }

@router.post("/{item_id}/borrow", response_model=ItemResponse)
async def borrow_item(item_id: str, req: ItemBorrowRequest):
    """備品を使用中にする"""
    item = await db.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item.get("status") == "in_use":
        raise HTTPException(
            status_code=400,
            detail=f"この備品はすでに {item.get('current_user_name', '別のユーザー')} が使用中です。"
        )

    user = await db.get_user(req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません。")

    updated = await db.borrow_item(item_id, user_id=user["id"], user_name=user["name"])
    return updated

@router.post("/{item_id}/return", response_model=ItemResponse)
async def return_item(item_id: str, req: Optional[ItemBorrowRequest] = None):
    """備品を返却する"""
    item = await db.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    user_id = None
    user_name = None
    if req and req.user_id:
        user = await db.get_user(req.user_id)
        if user:
            user_id = user["id"]
            user_name = user["name"]

    updated = await db.return_item(item_id, user_id=user_id, user_name=user_name)
    return updated

