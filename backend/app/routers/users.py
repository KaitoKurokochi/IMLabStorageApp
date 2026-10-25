from fastapi import APIRouter, HTTPException
from typing import List
from app.models import UserResponse, UserCreate, UserLoginRequest
from app.database import db

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=List[UserResponse])
async def list_users():
    """ユーザー一覧を取得"""
    return await db.get_users()

@router.post("", response_model=UserResponse)
async def create_user(user_in: UserCreate):
    """新規ユーザー登録"""
    existing = await db.find_user_by_name_grade(user_in.name.strip(), user_in.grade)
    if existing:
        return existing
    
    user = await db.create_user(user_in.name.strip(), user_in.grade)
    return user

@router.post("/login", response_model=UserResponse)
async def login_user(login_in: UserLoginRequest):
    """名前と学年でログイン"""
    user = await db.find_user_by_name_grade(login_in.name.strip(), login_in.grade)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="該当するユーザーが見つかりません。名前と学年を確認するか、新規登録してください。"
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
        "user": user,
        "borrowed_items": borrowed_items,
        "logs": logs
    }

