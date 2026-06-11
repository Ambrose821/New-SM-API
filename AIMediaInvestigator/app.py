
from dotenv import load_dotenv
# ---- ENV ----
load_dotenv()
from fastapi import FastAPI, Depends, APIRouter, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from api.routers import post_content
from exception_handlers.exception_handlers import *
from exception_handlers.exceptions import *
from auth.api_key import validate_key


# ---- Globals ----
app = FastAPI()
router = APIRouter()

# ---- Key Auth ---


@router.get("/")
async def healthz(): return {"ok": True, "API" : "Ai Media Investigator"}

@router.get("/healthz")
async def healthz(): 
    return {"ok": True}




# --- Routers ----
app.include_router(router=router)
app.include_router(
    router=post_content.router,
    dependencies=[Depends(validate_key)]
)


# --- Exception Handlers ----
app.add_exception_handler(UnexpectedError,unexpected_error_handler)
app.add_exception_handler(BadRequestError,bad_request_error_handler)
app.add_exception_handler(LlmRateLimitError,llm_limit_error_handler)
app.add_exception_handler(LlmContentError, llm_content_error)

@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.errors()},
    )

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=3001,
    )




