import pytest
from fastapi import HTTPException, Request
from jose import jwt
from unittest.mock import MagicMock, AsyncMock
from starlette.responses import Response

from src.core.auth import get_current_user_id
from src.core.middleware import JWTVerificationMiddleware
from src.core.config import settings


def create_mock_request(headers: dict = None, state: dict = None, path: str = "/"):
    scope = {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.1"},
        "http_version": "1.1",
        "method": "GET",
        "scheme": "http",
        "path": path,
        "raw_path": path.encode("ascii"),
        "root_path": "",
        "query_string": b"",
        "headers": [(k.lower().encode(), v.encode()) for k, v in (headers or {}).items()],
        "client": ["127.0.0.1", 8080],
        "server": ["testserver", 80],
        "state": state or {}
    }
    request = Request(scope=scope)
    return request

class TestAuthComponents:
    def test_get_current_user_id_success(self):
        from uuid import UUID
        test_uuid = "6cc2c52b-a651-4511-b1e6-fd58111dfaaf"
        mock_request = create_mock_request(state={"user_id": test_uuid})
        user_id = get_current_user_id(mock_request)
        assert user_id == UUID(test_uuid)

    def test_get_current_user_id_unauthorized(self):
        mock_request = create_mock_request()
        with pytest.raises(HTTPException) as exc_info:
            get_current_user_id(mock_request)
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Could not validate credentials"

    @pytest.mark.asyncio
    async def test_jwt_verification_middleware_valid_token(self, monkeypatch):
        monkeypatch.setattr(settings, "BETTER_AUTH_SECRET", "super-secret-test-key")
        # Create a valid token
        payload = {"sub": "test_user"}
        token = jwt.encode(payload, settings.BETTER_AUTH_SECRET, algorithm="HS256")
        headers = {"Authorization": f"Bearer {token}"}
        mock_request = create_mock_request(headers=headers, path="/api/test")
        mock_call_next = AsyncMock(return_value=Response())
        middleware = JWTVerificationMiddleware(MagicMock(), secret_key="super-secret-test-key") # secret_key is read from settings inside middleware
        await middleware.dispatch(mock_request, mock_call_next)

        assert mock_request.state._state.get("user_id") == "test_user"
        mock_call_next.assert_called_once_with(mock_request)

    @pytest.mark.asyncio
    async def test_jwt_verification_middleware_no_token(self, monkeypatch):
        monkeypatch.setattr(settings, "BETTER_AUTH_SECRET", "super-secret-test-key")
        mock_request = create_mock_request(path="/api/test")
        mock_call_next = AsyncMock()
        middleware = JWTVerificationMiddleware(MagicMock(), secret_key="super-secret-test-key")
        response = await middleware.dispatch(mock_request, mock_call_next)
        assert response.status_code == 401
        assert response.body == b'{"detail":"Not authenticated"}'
        mock_call_next.assert_not_called()

    @pytest.mark.asyncio
    async def test_jwt_verification_middleware_invalid_scheme(self, monkeypatch):
        monkeypatch.setattr(settings, "BETTER_AUTH_SECRET", "super-secret-test-key")
        headers = {"Authorization": "Basic some_token"}
        mock_request = create_mock_request(headers=headers, path="/api/test")
        mock_call_next = AsyncMock()
        middleware = JWTVerificationMiddleware(MagicMock(), secret_key="super-secret-test-key")
        response = await middleware.dispatch(mock_request, mock_call_next)
        assert response.status_code == 401
        assert response.body == b'{"detail":"Invalid authentication scheme"}'
        mock_call_next.assert_not_called()

    @pytest.mark.asyncio
    async def test_jwt_verification_middleware_invalid_token(self, monkeypatch):
        monkeypatch.setattr(settings, "BETTER_AUTH_SECRET", "super-secret-test-key")
        headers = {"Authorization": "Bearer invalid_token"}
        mock_request = create_mock_request(headers=headers, path="/api/test")
        mock_call_next = AsyncMock()

        middleware = JWTVerificationMiddleware(MagicMock(), secret_key="super-secret-test-key")
        response = await middleware.dispatch(mock_request, mock_call_next)
        assert response.status_code == 401
        assert response.body == b'{"detail":"Invalid token"}'
        mock_call_next.assert_not_called()

    @pytest.mark.asyncio
    async def test_jwt_verification_middleware_missing_user_id_in_token(self, monkeypatch):
        monkeypatch.setattr(settings, "BETTER_AUTH_SECRET", "super-secret-test-key")
        payload = {"foo": "bar"}  # Missing "sub"
        token = jwt.encode(payload, settings.BETTER_AUTH_SECRET, algorithm="HS256")
        headers = {"Authorization": f"Bearer {token}"}
        mock_request = create_mock_request(headers=headers, path="/api/test")
        mock_call_next = AsyncMock()

        middleware = JWTVerificationMiddleware(MagicMock(), secret_key="super-secret-test-key")
        response = await middleware.dispatch(mock_request, mock_call_next)
        assert response.status_code == 401
        assert response.body == b'{"detail":"Invalid token: user ID missing"}'
        mock_call_next.assert_not_called()

    @pytest.mark.asyncio
    async def test_jwt_verification_middleware_skips_auth_paths(self, monkeypatch):
        """Test that /api/auth/* paths are skipped by the middleware."""
        monkeypatch.setattr(settings, "BETTER_AUTH_SECRET", "super-secret-test-key")
        mock_request = create_mock_request(path="/api/auth/signup")
        mock_call_next = AsyncMock(return_value=Response())
        middleware = JWTVerificationMiddleware(MagicMock(), secret_key="super-secret-test-key")
        await middleware.dispatch(mock_request, mock_call_next)
        mock_call_next.assert_called_once_with(mock_request)


class TestSecurityFunctions:
    def test_hash_password(self):
        from src.core.security import hash_password
        password = "test_password123"
        hashed = hash_password(password)
        assert hashed != password
        assert hashed.startswith("$2b$")  # bcrypt hash prefix

    def test_verify_password_success(self):
        from src.core.security import hash_password, verify_password
        password = "test_password123"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_failure(self):
        from src.core.security import hash_password, verify_password
        password = "test_password123"
        hashed = hash_password(password)
        assert verify_password("wrong_password", hashed) is False

    def test_create_access_token(self, monkeypatch):
        from src.core.security import create_access_token
        from uuid import uuid4
        monkeypatch.setattr(settings, "BETTER_AUTH_SECRET", "super-secret-test-key")
        user_id = uuid4()
        token = create_access_token(user_id)
        assert token is not None
        # Decode and verify
        payload = jwt.decode(token, "super-secret-test-key", algorithms=["HS256"])
        assert payload["sub"] == str(user_id)
        assert "exp" in payload