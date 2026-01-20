# Quickstart Guide: Frontend for Todo Full-Stack Web Application (Phase II)

This guide provides instructions to quickly set up and run the frontend application locally for development and testing purposes.

## Prerequisites

-   Node.js (LTS version recommended)
-   npm or Yarn (package manager)
-   Access to the FastAPI Backend (Phase II) instance, running and accessible via a known URL.

## Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>/frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install   # or yarn install
    ```

3.  **Configure Environment Variables**:
    Create a `.env.local` file in the `frontend/` directory (if it doesn't exist already) and add the backend API URL:
    ```
    NEXT_PUBLIC_BACKEND_API_URL=<Your-FastAPI-Backend-URL>
    ```
    Replace `<Your-FastAPI-Backend-URL>` with the actual URL of your running FastAPI backend (e.g., `http://localhost:8000`).

4.  **Run the Development Server**:
    ```bash
    npm run dev   # or yarn dev
    ```
    The application should now be running in development mode, typically accessible at `http://localhost:3000`.

5.  **Access the Application**:
    Open your web browser and navigate to `http://localhost:3000`. You should be presented with the signup/signin page.

## Key Features to Test

-   **User Authentication**:
    -   Sign up for a new account.
    -   Sign in with an existing account.
    -   Verify redirection to login page when accessing protected routes unauthenticated.
-   **Task Management**:
    -   View tasks for the logged-in user.
    -   Create new tasks.
    -   Update existing tasks.
    -   Delete tasks.
    -   Mark tasks as complete/incomplete.
