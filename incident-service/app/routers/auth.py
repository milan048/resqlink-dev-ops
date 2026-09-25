from fastapi import APIRouter, HTTPException, Request, status

from slowapi import Limiter
from slowapi.util import get_remote_address

from ..database import users_collection
from ..schemas import LoginRequest, RegisterRequest
from ..auth.password import hash_password, verify_password
from ..auth.jwt import create_access_token
from ..rate_limit import limiter


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
@limiter.limit("5/minute")
def register(
    request: Request,
    user: RegisterRequest
):
    existing_user = users_collection.find_one(
        {"username": user.username}
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    allowed_roles = {"ADMIN", "OPERATOR", "VIEWER"}

    if user.role.upper() not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    new_user = {
        "username": user.username,
        "password": hash_password(user.password),
        "role": user.role.upper()
    }

    users_collection.insert_one(new_user)

    return {
        "message": "User registered successfully",
        "username": user.username,
        "role": user.role.upper()
    }


@router.post("/login")
@limiter.limit("5/minute")
def login(
    request: Request,
    user: LoginRequest
):
    existing_user = users_collection.find_one(
        {"username": user.username}
    )

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not verify_password(
        user.password,
        existing_user["password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    access_token = create_access_token(
        data={
            "sub": existing_user["username"],
            "role": existing_user["role"]
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": existing_user["role"]
    }