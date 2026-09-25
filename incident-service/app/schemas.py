from pydantic import BaseModel, Field
from typing import Optional


class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=5)
    incident_type: str
    severity: str
    location: str


class IncidentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=5)
    incident_type: Optional[str] = None
    severity: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class IncidentResponse(BaseModel):
    id: str
    title: str
    description: str
    incident_type: str
    severity: str
    location: str
    status: str
    created_by: str


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: str = "VIEWER"