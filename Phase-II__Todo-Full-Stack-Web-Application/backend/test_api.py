#!/usr/bin/env python3
"""
Simple API test script for the Todo application.
"""
import asyncio
import httpx
import json
from datetime import datetime

async def test_api():
    base_url = "http://127.0.0.1:8000"
    
    # Test the root endpoint
    print("Testing root endpoint...")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{base_url}/")
        print(f"Root endpoint: {response.status_code} - {response.json()}")
    
    # Test getting tasks for our seeded user
    print("\nTesting get tasks for user 'test-user-123'...")
    try:
        # We'll need to mock the JWT authentication for this test
        # Since the middleware checks for JWT, we'll need to create a valid token
        # or temporarily disable the middleware for testing
        headers = {
            "Authorization": "Bearer fake-token-for-testing",
            "Content-Type": "application/json"
        }
        
        response = await client.get(f"{base_url}/api/test-user-123/tasks", headers=headers)
        print(f"Get tasks: {response.status_code}")
        if response.status_code == 200:
            print(f"Tasks: {response.json()}")
        else:
            print(f"Error getting tasks: {response.text}")
    except Exception as e:
        print(f"Error testing get tasks: {e}")

if __name__ == "__main__":
    asyncio.run(test_api())