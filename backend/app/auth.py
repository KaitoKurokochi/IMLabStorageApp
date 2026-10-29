import time
import hmac
import hashlib
from typing import Optional
from fastapi import Header, HTTPException, status
from app.config import settings

def create_auth_token() -> str:
    """研究室の合言葉に基づく長期署名付きトークンを生成"""
    ts = int(time.time())
    sig = _compute_signature(ts)
    return f"{ts}.{sig}"

def _compute_signature(ts: int) -> str:
    data = f"{ts}:{settings.APP_PASSPHRASE}".encode("utf-8")
    key = settings.SECRET_KEY.encode("utf-8")
    return hmac.new(key, data, hashlib.sha256).hexdigest()

def verify_token_or_passphrase(value: Optional[str]) -> bool:
    """提供されたトークンまたは合言葉が有効かを検証"""
    if not value:
        return False

    value = value.strip()
    if not value:
        return False

    # 1. 合言葉の直接一致をチェック (CLIやcurl等の簡易実行用)
    if hmac.compare_digest(value, settings.APP_PASSPHRASE):
        return True

    # 2. 署名付きトークンのチェック (timestamp.signature)
    if "." in value:
        parts = value.split(".", 1)
        if len(parts) == 2:
            ts_str, sig = parts
            try:
                ts = int(ts_str)
                now = int(time.time())
                max_age_seconds = settings.PASSPHRASE_TOKEN_EXPIRE_DAYS * 86400

                # 期限切れ or 未来すぎるタイムスタンプ (時計のズレ考慮で5分許容)
                if (now - ts) > max_age_seconds or (ts - now) > 300:
                    return False

                expected_sig = _compute_signature(ts)
                return hmac.compare_digest(sig, expected_sig)
            except (ValueError, TypeError):
                return False

    return False

async def verify_auth(
    authorization: Optional[str] = Header(None),
    x_passphrase: Optional[str] = Header(None)
) -> bool:
    """DB変更を伴うAPI呼び出しの認可依存関係"""
    token = None
    if x_passphrase:
        token = x_passphrase.strip()
    elif authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:].strip()
        else:
            token = authorization.strip()

    if not verify_token_or_passphrase(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="研究室の合言葉による認可が必要です。",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return True

