import os
import secrets
from fastapi.security import APIKeyHeader
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

KEY_NAME = "X-API-KEY"
key_header_scheme = APIKeyHeader(name=KEY_NAME, auto_error=True)

_valid_key = os.getenv('SERVER_API_KEY')

def validate_key(api_key: str = Security(key_header_scheme)):
    is_valid = secrets.compare_digest(api_key, _valid_key)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API Key",
            headers={"WWW-Authenticate": "APIKey"},
            
        )
    if not secrets.compare_digest(api_key,_valid_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your API key is not valid",
            headers={"WWW-Authenticate": "APIKey"},
        )
    return api_key