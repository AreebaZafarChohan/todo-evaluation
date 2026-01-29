#!/usr/bin/env python3
"""Test Gemini API key"""

import os
from openai import AsyncOpenAI

# Test the Gemini API key from .env
api_key = "AIzaSyB8TS-XZjlhq7m1-4x9zZJiSt5jF46-uoc"
base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"

async def test_gemini():
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=base_url,
    )

    try:
        response = await client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=10
        )
        print("Gemini API Test SUCCESS!")
        print(f"Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"Gemini API Test FAILED: {e}")
        print(f"Error type: {type(e)}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_gemini())