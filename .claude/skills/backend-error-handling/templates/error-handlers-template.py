# Template: FastAPI Global Error Handlers
# Usage: Add to your main FastAPI app

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import structlog
import uuid
from datetime import datetime

app = FastAPI()
logger = structlog.get_logger()

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    """Handle custom application errors."""
    if not exc.request_id:
        exc.request_id = f"req_{uuid.uuid4().hex[:12]}"

    logger.warning(
        "Application error",
        code=exc.code.value,
        message=exc.message,
        status_code=exc.status_code,
        path=str(request.url.path),
        method=request.method,
        request_id=exc.request_id
    )

    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers,
        content=exc.to_dict()
    )

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    request_id = f"req_{uuid.uuid4().hex[:12]}"

    field_errors = {}
    for error in exc.errors():
        loc = ".".join(str(l) for l in error["loc"])
        if loc not in field_errors:
            field_errors[loc] = []
        field_errors[loc].append(error["msg"])

    logger.warning(
        "Validation error",
        field_errors=field_errors,
        path=str(request.url.path),
        request_id=request_id
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": {"fields": field_errors},
                "request_id": request_id,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "path": str(request.url.path)
            }
        }
    )

@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    """Handle unexpected errors."""
    request_id = f"req_{uuid.uuid4().hex[:12]}"

    logger.error(
        "Unexpected error",
        error=str(exc),
        error_type=type(exc).__name__,
        path=str(request.url.path),
        method=request.method,
        request_id=request_id,
        exc_info=True
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": {},
                "request_id": request_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }
    )
