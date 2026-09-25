from pydantic import BaseModel, Field
from typing import Optional


class ResourceCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    resource_type: str
    location: str
    capacity: int = Field(..., ge=1)
    skills: list[str] = []
    availability: str = "AVAILABLE"


class ResourceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    resource_type: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1)
    skills: Optional[list[str]] = None
    availability: Optional[str] = None


class ResourceResponse(BaseModel):
    id: str
    name: str
    resource_type: str
    location: str
    capacity: int
    skills: list[str]
    availability: str


class ResourceMatchRequest(BaseModel):
    incident_type: str
    severity: str
    location: str