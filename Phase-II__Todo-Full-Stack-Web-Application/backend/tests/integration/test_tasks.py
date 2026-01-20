import pytest
import httpx
from httpx import AsyncClient
from fastapi import status, FastAPI
from jose import jwt
from unittest.mock import patch
from sqlmodel import Session, create_engine

# Set the test secret BEFORE importing app and middleware
TEST_SECRET_KEY = "super-secret-test-key"

# Patch settings before importing anything that uses it
import src.core.config
src.core.config.settings.BETTER_AUTH_SECRET = TEST_SECRET_KEY

from src.main import app
from src.core.config import settings
from src.core.database import get_session
from src.core.auth import get_current_user_id
from src.models.task import Task

TEST_USER_ID = "test-user-id-123"
ANOTHER_USER_ID = "another-user-id-456"

@pytest.fixture(name="client")
async def client_fixture(session: Session, engine: create_engine):
    def get_session_override():
        yield session  # Must be a generator like the original get_session

    def get_current_user_id_override():
        return TEST_USER_ID

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_current_user_id] = get_current_user_id_override

    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers():
    # This token is for TEST_USER_ID
    encoded_jwt = jwt.encode({"sub": TEST_USER_ID}, TEST_SECRET_KEY, algorithm="HS256")
    return {"Authorization": f"Bearer {encoded_jwt}"}

@pytest.fixture
def another_auth_headers():
    # This token is for ANOTHER_USER_ID
    encoded_jwt = jwt.encode({"sub": ANOTHER_USER_ID}, TEST_SECRET_KEY, algorithm="HS256")
    return {"Authorization": f"Bearer {encoded_jwt}"}


class TestTaskEndpoints:
    @pytest.mark.asyncio
    async def test_create_task_success(self, client: AsyncClient, auth_headers: dict):
        response = await client.post(
            f"/api/{TEST_USER_ID}/tasks",
            json={"title": "Test Task", "description": "Description", "completed": False},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Test Task"
        assert data["user_id"] == TEST_USER_ID

    @pytest.mark.asyncio
    async def test_create_task_unauthorized_user_id(self, client: AsyncClient, auth_headers: dict):
        response = await client.post(
            f"/api/{ANOTHER_USER_ID}/tasks",  # Trying to create for another user
            json={"title": "Test Task", "description": "Description", "completed": False},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_create_task_unauthenticated(self, client: AsyncClient):
        response = await client.post(
            f"/api/{TEST_USER_ID}/tasks",
            json={"title": "Test Task", "description": "Description", "completed": False}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_get_tasks_success(self, client: AsyncClient, session: Session, auth_headers: dict):
        # Create a task directly in the session
        task = Task(title="User Task 1", user_id=TEST_USER_ID)
        session.add(task)
        session.commit()
        session.refresh(task)

        response = await client.get(f"/api/{TEST_USER_ID}/tasks", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "User Task 1"
        assert data[0]["user_id"] == TEST_USER_ID

    @pytest.mark.asyncio
    async def test_get_tasks_pagination(self, client: AsyncClient, session: Session, auth_headers: dict):
        for i in range(15):
            task = Task(title=f"Task {i}", user_id=TEST_USER_ID)
            session.add(task)
        session.commit()

        response = await client.get(f"/api/{TEST_USER_ID}/tasks?limit=5&offset=5", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 5

    @pytest.mark.asyncio
    async def test_get_tasks_unauthorized(self, client: AsyncClient, auth_headers: dict):
        response = await client.get(f"/api/{ANOTHER_USER_ID}/tasks", headers=auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_get_task_by_id_success(self, client: AsyncClient, session: Session, auth_headers: dict):
        task = Task(title="Specific Task", user_id=TEST_USER_ID)
        session.add(task)
        session.commit()
        session.refresh(task)

        response = await client.get(f"/api/{TEST_USER_ID}/tasks/{task.id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Specific Task"

    @pytest.mark.asyncio
    async def test_get_task_by_id_not_found(self, client: AsyncClient, auth_headers: dict):
        response = await client.get(f"/api/{TEST_USER_ID}/tasks/99999", headers=auth_headers)  # Non-existent task ID
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_get_task_by_id_unauthorized_owner(self, client: AsyncClient, session: Session, another_auth_headers: dict):
        task = Task(title="Another User's Task", user_id=TEST_USER_ID)
        session.add(task)
        session.commit()
        session.refresh(task)

        response = await client.get(f"/api/{ANOTHER_USER_ID}/tasks/{task.id}", headers=another_auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_update_task_success(self, client: AsyncClient, session: Session, auth_headers: dict):
        task = Task(title="Original Task", description="Old description", user_id=TEST_USER_ID)
        session.add(task)
        session.commit()
        session.refresh(task)

        updated_data = {"title": "New Title", "description": "New Description", "completed": True}
        response = await client.put(f"/api/{TEST_USER_ID}/tasks/{task.id}", json=updated_data, headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "New Title"
        assert data["description"] == "New Description"
        assert data["completed"] is True

    @pytest.mark.asyncio
    async def test_update_task_not_found(self, client: AsyncClient, auth_headers: dict):
        updated_data = {"title": "New Title"}
        response = await client.put(f"/api/{TEST_USER_ID}/tasks/99999", json=updated_data, headers=auth_headers)  # Non-existent task ID
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_update_task_unauthorized_owner(self, client: AsyncClient, session: Session, another_auth_headers: dict):
        task = Task(title="Another User's Task", user_id=TEST_USER_ID)
        session.add(task)
        session.commit()
        session.refresh(task)

        updated_data = {"title": "Attempted update"}
        response = await client.put(f"/api/{ANOTHER_USER_ID}/tasks/{task.id}", json=updated_data, headers=another_auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_delete_task_success(self, client: AsyncClient, session: Session, auth_headers: dict):
        task = Task(title="Task to delete", user_id=TEST_USER_ID)
        session.add(task)
        session.commit()
        session.refresh(task)

        response = await client.delete(f"/api/{TEST_USER_ID}/tasks/{task.id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"message": "Task deleted successfully"}

        # Verify it's actually deleted
        response = await client.get(f"/api/{TEST_USER_ID}/tasks/{task.id}", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_delete_task_not_found(self, client: AsyncClient, auth_headers: dict):
        response = await client.delete(f"/api/{TEST_USER_ID}/tasks/99999", headers=auth_headers)  # Non-existent task ID
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_delete_task_unauthorized_owner(self, client: AsyncClient, session: Session, another_auth_headers: dict):
        task = Task(title="Another User's Task to delete", user_id=TEST_USER_ID)
        session.add(task)
        session.commit()
        session.refresh(task)

        response = await client.delete(f"/api/{ANOTHER_USER_ID}/tasks/{task.id}", headers=another_auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_complete_task_success(self, client: AsyncClient, session: Session, auth_headers: dict):
        task = Task(title="Task to complete", completed=False, user_id=TEST_USER_ID)
        session.add(task)
        session.commit()
        session.refresh(task)

        response = await client.patch(f"/api/{TEST_USER_ID}/tasks/{task.id}/complete", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["completed"] is True

    @pytest.mark.asyncio
    async def test_complete_task_not_found(self, client: AsyncClient, auth_headers: dict):
        response = await client.patch(f"/api/{TEST_USER_ID}/tasks/99999/complete", headers=auth_headers)  # Non-existent task ID
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_complete_task_unauthorized_owner(self, client: AsyncClient, session: Session, another_auth_headers: dict):
        task = Task(title="Another User's Task to complete", user_id=TEST_USER_ID)
        session.add(task)
        session.commit()
        session.refresh(task)

        response = await client.patch(f"/api/{ANOTHER_USER_ID}/tasks/{task.id}/complete", headers=another_auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN
