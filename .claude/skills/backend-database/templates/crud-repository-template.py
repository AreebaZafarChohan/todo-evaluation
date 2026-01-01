# Template: CRUD Repository Pattern
# Usage: Copy and customize for your model

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional, List
from datetime import datetime

class ResourceRepository:
    """Repository for Resource model CRUD operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # CREATE
    async def create(self, data: dict) -> Resource:
        """Create a new resource."""
        resource = Resource(**data)
        self.db.add(resource)
        await self.db.flush()
        await self.db.refresh(resource)
        return resource

    async def create_many(self, data_list: List[dict]) -> List[Resource]:
        """Bulk create resources (more efficient)."""
        resources = [Resource(**data) for data in data_list]
        self.db.add_all(resources)
        await self.db.flush()
        return resources

    # READ
    async def get_by_id(self, resource_id: int) -> Optional[Resource]:
        """Get resource by ID."""
        return await self.db.get(Resource, resource_id)

    async def get_by_uuid(self, uuid: str) -> Optional[Resource]:
        """Get resource by UUID (external ID)."""
        result = await self.db.execute(
            select(Resource).where(Resource.uuid == uuid)
        )
        return result.scalar_one_or_none()

    async def get_by_field(self, field_name: str, value: any) -> Optional[Resource]:
        """Get resource by any field."""
        result = await self.db.execute(
            select(Resource).where(getattr(Resource, field_name) == value)
        )
        return result.scalar_one_or_none()

    async def list_all(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[dict] = None,
        order_by: str = "-created_at"
    ) -> List[Resource]:
        """List resources with pagination and filtering."""
        query = select(Resource)

        # Apply filters
        if filters:
            filter_conditions = []
            for key, value in filters.items():
                if hasattr(Resource, key):
                    filter_conditions.append(
                        getattr(Resource, key) == value
                    )
            if filter_conditions:
                query = query.where(and_(*filter_conditions))

        # Apply soft delete filter
        if hasattr(Resource, 'is_deleted'):
            query = query.where(Resource.is_deleted == False)

        # Apply ordering
        if order_by.startswith('-'):
            # Descending
            field = order_by[1:]
            if hasattr(Resource, field):
                query = query.order_by(getattr(Resource, field).desc())
        else:
            # Ascending
            if hasattr(Resource, order_by):
                query = query.order_by(getattr(Resource, order_by))

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def count(self, filters: Optional[dict] = None) -> int:
        """Count resources with optional filters."""
        query = select(func.count(Resource.id))

        if filters:
            filter_conditions = []
            for key, value in filters.items():
                if hasattr(Resource, key):
                    filter_conditions.append(
                        getattr(Resource, key) == value
                    )
            if filter_conditions:
                query = query.where(and_(*filter_conditions))

        if hasattr(Resource, 'is_deleted'):
            query = query.where(Resource.is_deleted == False)

        result = await self.db.execute(query)
        return result.scalar()

    async def exists(self, field_name: str, value: any) -> bool:
        """Check if resource exists with given field value."""
        from sqlalchemy import exists as sql_exists

        query = select(
            sql_exists(
                select(Resource.id).where(
                    getattr(Resource, field_name) == value
                )
            )
        )
        result = await self.db.execute(query)
        return result.scalar()

    # UPDATE
    async def update(self, resource: Resource, updates: dict) -> Resource:
        """Update resource with dict of changes."""
        for key, value in updates.items():
            if hasattr(resource, key):
                setattr(resource, key, value)

        if hasattr(resource, 'updated_at'):
            resource.updated_at = datetime.utcnow()

        await self.db.flush()
        await self.db.refresh(resource)
        return resource

    async def update_by_id(self, resource_id: int, updates: dict) -> Optional[Resource]:
        """Find and update resource by ID."""
        resource = await self.get_by_id(resource_id)
        if not resource:
            return None
        return await self.update(resource, updates)

    # DELETE
    async def delete(self, resource: Resource) -> None:
        """Hard delete resource."""
        await self.db.delete(resource)
        await self.db.flush()

    async def delete_by_id(self, resource_id: int) -> bool:
        """Find and delete resource by ID."""
        resource = await self.get_by_id(resource_id)
        if not resource:
            return False
        await self.delete(resource)
        return True

    async def soft_delete(self, resource: Resource) -> Resource:
        """Soft delete resource (mark as deleted)."""
        resource.is_deleted = True
        resource.deleted_at = datetime.utcnow()
        await self.db.flush()
        await self.db.refresh(resource)
        return resource

    async def soft_delete_by_id(self, resource_id: int) -> Optional[Resource]:
        """Find and soft delete resource by ID."""
        resource = await self.get_by_id(resource_id)
        if not resource:
            return None
        return await self.soft_delete(resource)

    async def restore(self, resource: Resource) -> Resource:
        """Restore soft-deleted resource."""
        resource.is_deleted = False
        resource.deleted_at = None
        await self.db.flush()
        await self.db.refresh(resource)
        return resource

    # ADVANCED QUERIES
    async def search(self, search_term: str, search_fields: List[str]) -> List[Resource]:
        """Search across multiple fields."""
        search_conditions = []
        for field in search_fields:
            if hasattr(Resource, field):
                search_conditions.append(
                    getattr(Resource, field).ilike(f"%{search_term}%")
                )

        if not search_conditions:
            return []

        query = select(Resource).where(or_(*search_conditions))

        if hasattr(Resource, 'is_deleted'):
            query = query.where(Resource.is_deleted == False)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_with_relations(
        self,
        resource_id: int,
        relations: List[str]
    ) -> Optional[Resource]:
        """Get resource with eager-loaded relationships."""
        from sqlalchemy.orm import selectinload

        query = select(Resource).where(Resource.id == resource_id)

        for relation in relations:
            if hasattr(Resource, relation):
                query = query.options(
                    selectinload(getattr(Resource, relation))
                )

        result = await self.db.execute(query)
        return result.scalar_one_or_none()

# Usage Example:
"""
from fastapi import Depends

async def get_resource_repo(
    db: AsyncSession = Depends(get_db)
) -> ResourceRepository:
    return ResourceRepository(db)

@router.post("/resources")
async def create_resource(
    data: ResourceCreate,
    repo: ResourceRepository = Depends(get_resource_repo)
):
    resource = await repo.create(data.dict())
    return resource

@router.get("/resources/{resource_id}")
async def get_resource(
    resource_id: int,
    repo: ResourceRepository = Depends(get_resource_repo)
):
    resource = await repo.get_by_id(resource_id)
    if not resource:
        raise HTTPException(404, "Resource not found")
    return resource
"""
