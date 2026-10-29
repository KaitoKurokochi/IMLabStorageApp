import asyncio
import time
from fastapi import HTTPException
from app.config import settings
from app.auth import create_auth_token, verify_token_or_passphrase, verify_auth
from app.routers.auth import verify_passphrase, check_auth_status, PassphraseVerifyRequest

async def test_auth_system():
    print("=== Testing Auth & Passphrase System ===")

    # 1. Direct passphrase validation
    assert verify_token_or_passphrase(settings.APP_PASSPHRASE), "APP_PASSPHRASE should be accepted"
    assert not verify_token_or_passphrase("wrong_pass"), "Wrong passphrase should be rejected"
    assert not verify_token_or_passphrase(""), "Empty string should be rejected"
    assert not verify_token_or_passphrase(None), "None should be rejected"
    print(" [1/5] Direct passphrase checks passed.")

    # 2. Token creation and signature validation
    token = create_auth_token()
    assert token and "." in token, "Token format should be timestamp.signature"
    assert verify_token_or_passphrase(token), "Generated token should be valid"
    assert not verify_token_or_passphrase(token + "x"), "Tampered signature should be rejected"
    
    parts = token.split(".")
    old_ts = int(parts[0]) - (settings.PASSPHRASE_TOKEN_EXPIRE_DAYS * 86400 + 100)
    import hmac, hashlib
    expired_sig = hmac.new(settings.SECRET_KEY.encode(), f"{old_ts}:{settings.APP_PASSPHRASE}".encode(), hashlib.sha256).hexdigest()
    expired_token = f"{old_ts}.{expired_sig}"
    assert not verify_token_or_passphrase(expired_token), "Expired token should be rejected"
    print(" [2/5] Token generation and expiration checks passed.")

    # 3. Router endpoints (/api/auth/verify, /api/auth/check)
    # verify_passphrase success
    req_ok = PassphraseVerifyRequest(passphrase=settings.APP_PASSPHRASE)
    res_ok = await verify_passphrase(req_ok)
    assert res_ok["valid"] is True
    assert res_ok["token"]
    assert verify_token_or_passphrase(res_ok["token"])

    # verify_passphrase failure
    req_bad = PassphraseVerifyRequest(passphrase="wrong-passphrase")
    try:
        await verify_passphrase(req_bad)
        assert False, "Should raise HTTPException for invalid passphrase"
    except HTTPException as e:
        assert e.status_code == 401

    # check_auth_status
    check_ok = await check_auth_status(authorization=f"Bearer {res_ok['token']}", x_passphrase=None)
    assert check_ok["authenticated"] is True

    check_bad = await check_auth_status(authorization="Bearer bad-token", x_passphrase=None)
    assert check_bad["authenticated"] is False
    print(" [3/5] Auth router endpoints passed.")

    # 4. Dependency verify_auth with Bearer token
    assert await verify_auth(authorization=f"Bearer {res_ok['token']}", x_passphrase=None) is True
    assert await verify_auth(authorization=None, x_passphrase=settings.APP_PASSPHRASE) is True

    try:
        await verify_auth(authorization=None, x_passphrase=None)
        assert False, "Should raise 401 when no credentials provided"
    except HTTPException as e:
        assert e.status_code == 401
    print(" [4/5] Dependency verify_auth passed.")

    # 5. Invalidating past tokens when passphrase changes
    original_pass = settings.APP_PASSPHRASE
    try:
        settings.APP_PASSPHRASE = "new-rotated-passphrase"
        assert not verify_token_or_passphrase(token), "Token signed with old passphrase must become invalid"
        assert verify_token_or_passphrase("new-rotated-passphrase")
    finally:
        settings.APP_PASSPHRASE = original_pass
    print(" [5/5] Passphrase rotation / invalidation check passed.")

    print(" ALL AUTH SYSTEM TESTS PASSED SUCCESSFULLY! ")

if __name__ == "__main__":
    asyncio.run(test_auth_system())

