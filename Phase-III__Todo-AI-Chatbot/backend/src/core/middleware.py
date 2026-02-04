from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from starlette.responses import JSONResponse
from fastapi import Request, Response, HTTPException
from jose import jwt, JWTError

from src.core.config import settings

class JWTVerificationMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, secret_key: str = settings.BETTER_AUTH_SECRET):
        super().__init__(app)
        self.secret_key = secret_key

    async def dispatch(self, request: Request, call_next):
        # Skip authentication for auth endpoints (signup/login)
        if request.url.path.startswith("/api/auth/"):
            response = await call_next(request)
            return response

        if request.url.path.startswith("/api/"):
            token = request.headers.get("Authorization")
            if not token:
                return JSONResponse(status_code=401, content={"detail": "Not authenticated"})

            try:
                scheme, credentials = token.split()
                if scheme.lower() != "bearer":
                    return JSONResponse(status_code=401, content={"detail": "Invalid authentication scheme"})

                payload = jwt.decode(credentials, self.secret_key, algorithms=["HS256"])
                request.state.user_id = payload.get("sub")
                if not request.state.user_id:
                    return JSONResponse(status_code=401, content={"detail": "Invalid token: user ID missing"})
            except JWTError:
                return JSONResponse(status_code=401, content={"detail": "Invalid token"})
            except ValueError:
                return JSONResponse(status_code=401, content={"detail": "Invalid Authorization header format"})

        response = await call_next(request)
        return response
