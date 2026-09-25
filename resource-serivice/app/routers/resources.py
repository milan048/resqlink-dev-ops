from bson import ObjectId
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status
)

from ..database import resources_collection
from ..schemas import (
    ResourceCreate,
    ResourceUpdate,
    ResourceResponse,
    ResourceMatchRequest,
)
from ..auth.dependencies import require_role
from ..rate_limit import limiter


router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)


def format_resource(document):
    return {
        "id": str(document["_id"]),
        "name": document["name"],
        "resource_type": document["resource_type"],
        "location": document["location"],
        "capacity": document["capacity"],
        "skills": document["skills"],
        "availability": document["availability"],
    }


@router.post(
    "/",
    response_model=ResourceResponse,
    status_code=status.HTTP_201_CREATED
)
@limiter.limit("5/minute")
def create_resource(
    request: Request,
    resource: ResourceCreate,
    current_user: dict = Depends(
        require_role("ADMIN", "OPERATOR")
    )
):
    document = resource.model_dump()

    result = resources_collection.insert_one(document)

    document["_id"] = result.inserted_id

    return format_resource(document)


@router.get(
    "/",
    response_model=list[ResourceResponse]
)
@limiter.limit("5/minute")
def get_resources(
    request: Request,
    current_user: dict = Depends(
        require_role("ADMIN", "OPERATOR", "VIEWER")
    )
):
    resources = resources_collection.find()

    return [
        format_resource(resource)
        for resource in resources
    ]


@router.get(
    "/available",
    response_model=list[ResourceResponse]
)
@limiter.limit("5/minute")
def get_available_resources(
    request: Request,
    current_user: dict = Depends(
        require_role("ADMIN", "OPERATOR", "VIEWER")
    )
):
    resources = resources_collection.find(
        {"availability": "AVAILABLE"}
    )

    return [
        format_resource(resource)
        for resource in resources
    ]


@router.get(
    "/{resource_id}",
    response_model=ResourceResponse
)
@limiter.limit("5/minute")
def get_resource(
    request: Request,
    resource_id: str,
    current_user: dict = Depends(
        require_role("ADMIN", "OPERATOR", "VIEWER")
    )
):
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resource ID"
        )

    resource = resources_collection.find_one(
        {"_id": ObjectId(resource_id)}
    )

    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )

    return format_resource(resource)


@router.put(
    "/{resource_id}",
    response_model=ResourceResponse
)
@limiter.limit("5/minute")
def update_resource(
    request: Request,
    resource_id: str,
    resource: ResourceUpdate,
    current_user: dict = Depends(
        require_role("ADMIN", "OPERATOR")
    )
):
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resource ID"
        )

    existing = resources_collection.find_one(
        {"_id": ObjectId(resource_id)}
    )

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )

    update_data = resource.model_dump(
        exclude_none=True
    )

    if update_data:
        resources_collection.update_one(
            {"_id": ObjectId(resource_id)},
            {"$set": update_data}
        )

    updated = resources_collection.find_one(
        {"_id": ObjectId(resource_id)}
    )

    return format_resource(updated)


@router.delete(
    "/{resource_id}"
)
@limiter.limit("5/minute")
def delete_resource(
    request: Request,
    resource_id: str,
    current_user: dict = Depends(
        require_role("ADMIN")
    )
):
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resource ID"
        )

    result = resources_collection.delete_one(
        {"_id": ObjectId(resource_id)}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )

    return {
        "message": "Resource deleted successfully"
    }


@router.post(
    "/match"
)
@limiter.limit("5/minute")
def match_resources(
    request: Request,
    resource_request: ResourceMatchRequest,
    current_user: dict = Depends(
        require_role("ADMIN", "OPERATOR", "VIEWER")
    )
):
    query = {
        "location": resource_request.location,
        "availability": "AVAILABLE"
    }

    resources = resources_collection.find(query)

    matches = [
        format_resource(resource)
        for resource in resources
    ]

    return {
        "incident_type": resource_request.incident_type,
        "severity": resource_request.severity,
        "location": resource_request.location,
        "matches": matches
    }