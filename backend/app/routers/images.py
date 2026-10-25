from fastapi import APIRouter, HTTPException, Response
from app.database import db

router = APIRouter(prefix="/images", tags=["images"])

@router.get("/{image_id}")
async def get_image_endpoint(image_id: str):
    """MongoDBに保存された画像を配信 (ブラウザキャッシュ対応)"""
    res = await db.get_image(image_id)
    if not res:
        raise HTTPException(status_code=404, detail="画像が見つかりません。")
    
    data, content_type = res
    return Response(
        content=data,
        media_type=content_type,
        headers={
            "Cache-Control": "public, max-age=31536000, immutable"
        }
    )
