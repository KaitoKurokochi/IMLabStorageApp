from typing import Optional
from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel
import hmac

from app.config import settings
from app.auth import create_auth_token, verify_token_or_passphrase

router = APIRouter(prefix="/auth", tags=["auth"])

class PassphraseVerifyRequest(BaseModel):
    passphrase: str

class PassphraseVerifyResponse(BaseModel):
    valid: bool
    token: str
    expires_in_days: int

class AuthCheckResponse(BaseModel):
    authenticated: bool

@router.post("/verify", response_model=PassphraseVerifyResponse)
async def verify_passphrase(req: PassphraseVerifyRequest):
    """研究室の合言葉（パスワード）を検証し、長期トークンを発行"""
    if not hmac.compare_digest(req.passphrase.strip(), settings.APP_PASSPHRASE):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="合言葉が正しくありません。"
        )

    token = create_auth_token()
    return {
        "valid": True,
        "token": token,
        "expires_in_days": settings.PASSPHRASE_TOKEN_EXPIRE_DAYS
    }

@router.get("/check", response_model=AuthCheckResponse)
async def check_auth_status(
    authorization: Optional[str] = Header(None),
    x_passphrase: Optional[str] = Header(None)
):
    """保存されているトークンや合言葉が有効かをチェック"""
    token = None
    if x_passphrase:
        token = x_passphrase.strip()
    elif authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:].strip()
        else:
            token = authorization.strip()

    is_authenticated = verify_token_or_passphrase(token)
    return {"authenticated": is_authenticated}

