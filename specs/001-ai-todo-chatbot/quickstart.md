# Quickstart Guide: AI-Powered Todo Chatbot Frontend

**Date**: 2026-01-29
**Feature**: AI-Powered Todo Chatbot Frontend
**Spec**: ./specs/001-ai-todo-chatbot/spec.md
**Plan**: ./specs/001-ai-todo-chatbot/plan.md

## Overview

This guide provides instructions to quickly set up and run the frontend development environment for the AI-Powered Todo Chatbot feature. This feature integrates into the existing Phase II Todo frontend application.

## Prerequisites

*   Node.js (LTS version, e.g., 18.x or 20.x)
*   npm or Yarn (package manager)
*   Access to the Phase II Todo Frontend repository (this project)
*   A running instance of the Phase II Todo Backend API (FastAPI) with the new `/api/{user_id}/chat` endpoint implemented.
*   Required environment variables (e.g., `NEXT_PUBLIC_API_BASE_URL` pointing to your backend).

## Setup Steps

1.  **Clone the Repository (if not already done):**
    ```bash
    git clone <repository_url>
    cd hackathon_2 # Or your project root directory
    ```

2.  **Checkout the Feature Branch:**
    ```bash
    git checkout 001-ai-todo-chatbot
    ```

3.  **Navigate to the Frontend Directory:**
    ```bash
    cd frontend
    ```

4.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

5.  **Configure Environment Variables:**
    Create a `.env.local` file in the `frontend/` directory if it doesn't exist, and add the necessary environment variables.
    ```dotenv
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 # Example: Adjust to your backend API URL
    ```

6.  **Start the Frontend Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

    The application should now be running, typically accessible at `http://localhost:3000`.

7.  **Access the Chatbot Feature:**
    Navigate to the dedicated chatbot page in your browser: `http://localhost:3000/chat` (after logging in via the existing authentication flow).

## Key Development Areas

*   `frontend/src/app/chat/`: Contains the dedicated page for the chatbot UI.
*   `frontend/src/components/`: Location for new React components related to the chat interface (e.g., ChatWindow, MessageBubble, InputField).
*   `frontend/src/lib/` or `frontend/src/api/`: Integration points for the API client to interact with the new `POST /api/{user_id}/chat` endpoint.

---
**End of Quickstart Guide**

