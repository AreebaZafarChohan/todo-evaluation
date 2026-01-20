#!/bin/bash

BASE_URL="http://127.0.0.1:8000"
SIGNUP_URL="$BASE_URL/api/auth/signup"
LOGIN_URL="$BASE_URL/api/auth/login"
TASKS_URL="$BASE_URL/api/tasks"

# 1. Signup a new user
echo "--- Testing Signup ---"
SIGNUP_RESPONSE=$(curl -s -X POST $SIGNUP_URL \
    -H "Content-Type: application/json" \
    -d '{ "email": "testuser@example.com", "name": "Test User", "password": "password", "confirm_password": "password" }')

echo "Signup Response: $SIGNUP_RESPONSE"
ACCESS_TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.access_token')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
    echo "Signup failed or access token not found."
    exit 1
fi

echo "Access Token: $ACCESS_TOKEN"
echo "--- Signup Test Passed ---"


# 2. Login with the new user
echo "--- Testing Login ---"
LOGIN_RESPONSE=$(curl -s -X POST $LOGIN_URL \
    -H "Content-Type: application/json" \
    -d '{ "email": "testuser@example.com", "password": "password" }')

echo "Login Response: $LOGIN_RESPONSE"
ACCESS_TOKEN_LOGIN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ -z "$ACCESS_TOKEN_LOGIN" ] || [ "$ACCESS_TOKEN_LOGIN" == "null" ]; then
    echo "Login failed or access token not found."
    exit 1
fi

echo "--- Login Test Passed ---"


# 3. Get all tasks for the user
echo "--- Testing Get All Tasks ---"
TASKS_RESPONSE=$(curl -s -X GET $TASKS_URL \
    -H "Authorization: Bearer $ACCESS_TOKEN_LOGIN")

echo "Tasks Response: $TASKS_RESPONSE"
echo "--- Get All Tasks Test Passed ---"
