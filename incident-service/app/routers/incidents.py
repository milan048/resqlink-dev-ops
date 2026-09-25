import httpx
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status
)
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer
)

from ..database import incidents_collection
from ..schemas import IncidentCreate, IncidentUpdate, IncidentResponse
from ..auth.dependencies import require_role
from ..services.resource_client import find_matching_resources
from ..rate_limit import limiter


security = HTTPBearer()

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


def format_incident(document):
    return {
        "id": str(document["_id"]),
        "title": document["title"],
        "description": document["description"],
        "incident_type": document["incident_type"],
        "severity": document["severity"],
        "location": document["location"],
        "status": document["status"],
        "created_by": document["created_by"]
    }


@router.post(
    "/",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED
)
@limiter.limit("5/minute")
def create_incident(
    request: Request,
    incident: IncidentCreate,
    current_user: dict = Depends(
        require_role("ADMIN", "OPERATOR")
    )
):
    document = {
        "title": incident.title,
        "description": incident.description,
        "incident_type": incident.incident_type,
        "severity": incident.severity,
        "location": incident.location,
        "status": "OPEN",
        "created_by": current_user["username"],
        "created_at": datetime.now(timezone.utc)
    }

    result = incidents_collection.insert_one(document)

    document["_id"] = result.inserted_id

    return format_incident(document)


@router.get(
    "/",
    response_model=list[IncidentResponse]
)
@limiter.limit("60/minute")
def get_incidents(
    request: Request,
    current_user: dict = Depends(
        require_role("ADMIN", "OPERATOR", "VIEWER")
    )
):
    incidents = incidents_collection.find().sort(
        "created_at",
        -1
    )

    return [
        format_incident(incident)
        for incident in incidents
    ]


@router.get(
    "/{incident_id}",
    response_model=IncidentResponse
)
@limiter.limit("60/minute")
def get_incident(
    request: Request,
    incident_id: str,
    current_user: dict = Depends(
        require_role("ADMIN", "OPERATOR", "VIEWER")
    )
):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid incident ID"
        )

    incident = incidents_collection.find_one(
        {"_id": ObjectId(incident_id)}
    )

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    return format_incident(incident)


@router.put(
    "/{incident_id}",
    response_model=IncidentResponse
)
@limiter.limit("30/minute")
def update_incident(
    request: Request,
    incident_id: str,
    incident: IncidentUpdate,
    current_user: dict = Depends(
        require_role("ADMIN", "OPERATOR")
    )
):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid incident ID"
        )

    existing = incidents_collection.find_one(
        {"_id": ObjectId(incident_id)}
    )

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    update_data = incident.model_dump(
        exclude_none=True
    )

    if update_data:
        incidents_collection.update_one(
            {"_id": ObjectId(incident_id)},
            {"$set": update_data}
        )

    updated = incidents_collection.find_one(
        {"_id": ObjectId(incident_id)}
    )

    return format_incident(updated)


@router.delete(
    "/{incident_id}"
)
@limiter.limit("20/minute")
def delete_incident(
    request: Request,
    incident_id: str,
    current_user: dict = Depends(
        require_role("ADMIN")
    )
):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid incident ID"
        )

    result = incidents_collection.delete_one(
        {"_id": ObjectId(incident_id)}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    return {
        "message": "Incident deleted successfully"
    }


@router.post(
    "/{incident_id}/find-resources"
)
@limiter.limit("20/minute")
async def find_resources_for_incident(
    request: Request,
    incident_id: str,
    current_user: dict = Depends(
        require_role("ADMIN", "OPERATOR", "VIEWER")
    ),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid incident ID"
        )

    incident = incidents_collection.find_one(
        {"_id": ObjectId(incident_id)}
    )

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    try:
        result = await find_matching_resources(
            incident_type=incident["incident_type"],
            severity=incident["severity"],
            location=incident["location"],
            token=credentials.credentials
        )

    except httpx.HTTPStatusError as error:
        if error.response.status_code == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Resource Service rejected authentication"
            )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resource Service request failed"
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resource Service is unavailable"
        )

    return {
        "incident": format_incident(incident),
        "resource_service_response": result
    }