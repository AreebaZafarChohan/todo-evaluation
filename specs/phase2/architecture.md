# System Architecture
 
## Overview
The application follows a client-server architecture with a Next.js frontend, a FastAPI backend, and a Neon PostgreSQL database.
 
## Frontend (Next.js)
- Server Components for data fetching and rendering
- Client Components for interactivity
- Tailwind CSS for styling
 
## Backend (FastAPI)
- Provides RESTful API endpoints
- Handles business logic and data persistence
- Uses SQLModel for ORM
- Authenticated with JWT
 
## Database (Neon PostgreSQL)
- Stores user and task data
- Managed by SQLModel