

from fastapi import Request, status
from fastapi.responses import JSONResponse

async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": f"An unexpected Error has occured: {str(exc)}"
        }
    )

async def bad_request_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail":str(exc)}
    )

async def llm_limit_error_handler(request: Request, exc:Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"detail":f"LLM Rate limiting error: {str(exc)}. Slow down"}
    )

async def llm_content_error(request: Request, exc:Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"details" : f"LLM Content Error {str(exc)}"}
    )

