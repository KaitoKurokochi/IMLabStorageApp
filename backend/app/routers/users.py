from fastapi import APIRouter, HTTPException
from app.models import UserResponse, UserCreate, UserLoginRequest, ItemResponse, UsageLogResponse
from app.database import db

router = APIRouter(prefix="/users", tags=["users"])

@router.post("", response_model=UserResponse)
async def create_user(user_in: UserCreate):
    """新規ユーザー登録"""
    return await db.create_user(user_in.first_name, user_in.last_name, user_in.grade)

@router.post("/login", response_model=UserResponse)
async def login_user(login_in: UserLoginRequest):
    """名前でログイン"""
    user = await db.find_user_by_name(login_in.first_name, login_in.last_name)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="該当するユーザーが見つかりません。名前を確認するか、新規登録してください。"
        )
    return user

@router.get("/{user_id}")
async def get_user_detail(user_id: str):
    """ユーザー詳細、借りている備品一覧、および利用履歴を取得"""
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    borrowed_items = await db.get_items(user_id=user_id, status="in_use")
    logs = await db.get_logs(user_id=user_id, limit=30)

    return {
        "user": UserResponse.model_validate(user),
        "borrowed_items": [ItemResponse.model_validate(item) for item in borrowed_items],
        "logs": [UsageLogResponse.model_validate(log) for log in logs]
    }

