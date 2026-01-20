import pytest
import httpx
from httpx import AsyncClient
from fastapi import status
from sqlmodel import Session, create_engine
from sqlalchemy.pool import StaticPool

# Set the test secret BEFORE importing app
TEST_SECRET_KEY = "super-secret-test-key"
import src.core.config
src.core.config.settings.BETTER_AUTH_SECRET = TEST_SECRET_KEY

from src.main import app
from src.core.database import get_session
from src.models.task import User


@pytest.fixture(name="test_engine")
def test_engine_fixture():
    engine = create_engine(
        "sqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="test_session")
def test_session_fixture(test_engine):
    with Session(test_engine) as session:
        yield session


@pytest.fixture(name="client")
async def client_fixture(test_session: Session):
    def get_session_override():
        yield test_session

    app.dependency_overrides[get_session] = get_session_override

    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


class TestSignupEndpoint:
    @pytest.mark.asyncio
    async def test_signup_success(self, client: AsyncClient):
        response = await client.post(
            "/api/auth/signup",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "password123",
                "confirm_password": "password123"
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "user" in data
        assert data["user"]["username"] == "testuser"
        assert data["user"]["email"] == "test@example.com"
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_signup_password_mismatch(self, client: AsyncClient):
        response = await client.post(
            "/api/auth/signup",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "password123",
                "confirm_password": "differentpassword"
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Password and confirm_password do not match" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_signup_duplicate_username(self, client: AsyncClient, test_session: Session):
        # Create existing user
        from src.core.security import hash_password
        existing_user = User(
            username="existinguser",
            email="existing@example.com",
            hashed_password=hash_password("password123")
        )
        test_session.add(existing_user)
        test_session.commit()

        response = await client.post(
            "/api/auth/signup",
            json={
                "username": "existinguser",
                "email": "new@example.com",
                "password": "password123",
                "confirm_password": "password123"
            }
        )
        assert response.status_code == status.HTTP_409_CONFLICT
        assert "Username already exists" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_signup_duplicate_email(self, client: AsyncClient, test_session: Session):
        # Create existing user
        from src.core.security import hash_password
        existing_user = User(
            username="existinguser",
            email="existing@example.com",
            hashed_password=hash_password("password123")
        )
        test_session.add(existing_user)
        test_session.commit()

        response = await client.post(
            "/api/auth/signup",
            json={
                "username": "newuser",
                "email": "existing@example.com",
                "password": "password123",
                "confirm_password": "password123"
            }
        )
        assert response.status_code == status.HTTP_409_CONFLICT
        assert "Email already exists" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_signup_invalid_email(self, client: AsyncClient):
        response = await client.post(
            "/api/auth/signup",
            json={
                "username": "testuser",
                "email": "invalid-email",
                "password": "password123",
                "confirm_password": "password123"
            }
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestLoginEndpoint:
    @pytest.mark.asyncio
    async def test_login_with_username_success(self, client: AsyncClient, test_session: Session):
        # Create user first
        from src.core.security import hash_password
        user = User(
            username="loginuser",
            email="login@example.com",
            hashed_password=hash_password("password123")
        )
        test_session.add(user)
        test_session.commit()

        response = await client.post(
            "/api/auth/login",
            json={
                "username_or_email": "loginuser",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "user" in data
        assert data["user"]["username"] == "loginuser"
        assert "access_token" in data

    @pytest.mark.asyncio
    async def test_login_with_email_success(self, client: AsyncClient, test_session: Session):
        # Create user first
        from src.core.security import hash_password
        user = User(
            username="loginuser2",
            email="login2@example.com",
            hashed_password=hash_password("password123")
        )
        test_session.add(user)
        test_session.commit()

        response = await client.post(
            "/api/auth/login",
            json={
                "username_or_email": "login2@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["user"]["email"] == "login2@example.com"

    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self, client: AsyncClient):
        response = await client.post(
            "/api/auth/login",
            json={
                "username_or_email": "nonexistent",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Invalid credentials" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, test_session: Session):
        # Create user first
        from src.core.security import hash_password
        user = User(
            username="wrongpassuser",
            email="wrongpass@example.com",
            hashed_password=hash_password("correctpassword")
        )
        test_session.add(user)
        test_session.commit()

        response = await client.post(
            "/api/auth/login",
            json={
                "username_or_email": "wrongpassuser",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Invalid credentials" in response.json()["detail"]
