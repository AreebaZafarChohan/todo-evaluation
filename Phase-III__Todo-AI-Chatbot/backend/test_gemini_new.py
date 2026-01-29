#!/usr/bin/env python3
"""Test new Gemini API key"""

import os
import asyncio
from openai import AsyncOpenAI

# Test the Gemini API key from updated .env
api_key = "AIzaSyCOdkenzSBelYNk1J0yi1ggjrDj03PLxco"
base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"

async def test_gemini():
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=base_url,
    )

    try:
        response = await client.chat.completions.create(
            model="gemini-2.0-flash",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=10
        )
        print("Gemini API Test SUCCESS!")
        print(f"Response: {response.choices[0].message.content}")
        return True
    except Exception as e:
        print(f"Gemini API Test FAILED: {e}")
        print(f"Error type: {type(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(test_gemini())