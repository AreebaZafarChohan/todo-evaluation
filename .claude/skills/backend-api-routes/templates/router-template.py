# Template: RESTful API Router
# Usage: Copy and customize for your resource

from fastapi import APIRouter, HTTPException, status, Query, Depends
from typing import List, Optional
from pydantic import BaseModel

# Define your router
router = APIRouter(
    prefix="/api/v1/resources",  # Change 'resources' to your resource name
    tags=["resources"],
    responses={404: {"description": "Not found"}},
)

# Request/Response models
class ResourceCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ResourceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: str
    updated_at: str

# List resources with pagination
@router.get("", response_model=List[ResourceResponse])
async def list_resources(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort: str = Query("-created_at", description="Sort field (prefix with - for desc)"),
    status: Optional[str] = Query(None, description="Filter by status"),
):
    """
    List all resources with pagination, filtering, and sorting.

    - **page**: Page number (starts at 1)
    - **page_size**: Number of items per page (max 100)
    - **sort**: Sort field (prefix with - for descending)
    - **status**: Filter by status (optional)
    """
    # TODO: Implement database query
    # resources = await db.list_resources(page, page_size, sort, status)

    return {
        "data": [],  # Your resources here
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": 0,
            "total_pages": 0
        },
        "links": {
            "self": f"/api/v1/resources?page={page}&page_size={page_size}",
            "first": f"/api/v1/resources?page=1&page_size={page_size}",
            "prev": f"/api/v1/resources?page={page-1}&page_size={page_size}" if page > 1 else None,
            "next": f"/api/v1/resources?page={page+1}&page_size={page_size}",
            "last": f"/api/v1/resources?page=10&page_size={page_size}"
        }
    }

# Get single resource
@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(resource_id: str):
    """
    Get a single resource by ID.

    - **resource_id**: Unique identifier for the resource
    """
    # TODO: Implement database query
    # resource = await db.get_resource(resource_id)
    # if not resource:
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail={
    #             "code": "RESOURCE_NOT_FOUND",
    #             "message": f"Resource {resource_id} not found"
    #         }
    #     )

    return {
        "id": resource_id,
        "name": "Example",
        "description": "Example description",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z",
        "links": {
            "self": f"/api/v1/resources/{resource_id}",
            "update": f"/api/v1/resources/{resource_id}",
            "delete": f"/api/v1/resources/{resource_id}"
        }
    }

# Create new resource
@router.post(
    "",
    response_model=ResourceResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_resource(resource: ResourceCreate):
    """
    Create a new resource.

    - **name**: Resource name (required)
    - **description**: Resource description (optional)
    """
    # TODO: Implement database creation
    # new_resource = await db.create_resource(resource)

    return {
        "id": "new-id",
        "name": resource.name,
        "description": resource.description,
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
    }

# Update resource (partial)
@router.patch("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: str,
    updates: ResourceUpdate
):
    """
    Partially update a resource.

    - **resource_id**: Unique identifier for the resource
    - Only provided fields will be updated
    """
    # TODO: Implement database update
    # updated_resource = await db.update_resource(resource_id, updates)

    return {
        "id": resource_id,
        "name": updates.name or "Existing name",
        "description": updates.description,
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T11:00:00Z"
    }

# Replace resource (full)
@router.put("/{resource_id}", response_model=ResourceResponse)
async def replace_resource(
    resource_id: str,
    resource: ResourceCreate
):
    """
    Replace entire resource.

    - **resource_id**: Unique identifier for the resource
    - All fields must be provided
    """
    # TODO: Implement database replacement
    # replaced_resource = await db.replace_resource(resource_id, resource)

    return {
        "id": resource_id,
        "name": resource.name,
        "description": resource.description,
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T11:00:00Z"
    }

# Delete resource
@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(resource_id: str):
    """
    Delete a resource.

    - **resource_id**: Unique identifier for the resource
    """
    # TODO: Implement database deletion
    # await db.delete_resource(resource_id)

    return None

# Nested resource example
@router.get("/{resource_id}/items", response_model=List[dict])
async def get_resource_items(
    resource_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """
    Get items belonging to a resource.

    - **resource_id**: Parent resource ID
    - **page**: Page number
    - **page_size**: Items per page
    """
    # TODO: Implement nested query
    return []

# Action endpoint (non-CRUD operation)
@router.post("/{resource_id}/activate", status_code=status.HTTP_200_OK)
async def activate_resource(resource_id: str):
    """
    Activate a resource (action endpoint).

    Use action endpoints when the operation doesn't fit standard CRUD.
    """
    # TODO: Implement activation logic
    return {"message": f"Resource {resource_id} activated"}
