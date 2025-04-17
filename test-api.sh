#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing API endpoints..."

# Test 1: Create a user
echo -e "\n${GREEN}Test 1: Creating a user${NC}"
response=$(curl -s -X POST http://demo.local/api/users \
  -H "Content-Type: application/json" \
  -d '{"dni": "12345678", "name": "John Doe"}')
echo "Response: $response"

# Extract the user ID from the response
user_id=$(echo $response | grep -o '"id":[0-9]*' | cut -d':' -f2)

# Test 2: Get all users
echo -e "\n${GREEN}Test 2: Getting all users${NC}"
curl -s http://demo.local/api/users | jq .

# Test 3: Get specific user
echo -e "\n${GREEN}Test 3: Getting user with ID $user_id${NC}"
curl -s http://demo.local/api/users/$user_id | jq .

# Test 4: Create another user
echo -e "\n${GREEN}Test 4: Creating another user${NC}"
curl -s -X POST http://demo.local/api/users \
  -H "Content-Type: application/json" \
  -d '{"dni": "87654321", "name": "Jane Smith"}'

# Test 5: Get all users again to verify both users exist
echo -e "\n${GREEN}Test 5: Verifying both users exist${NC}"
curl -s http://demo.local/api/users | jq .

# Test 6: Get non-existent user
echo -e "\n${GREEN}Test 6: Getting non-existent user (should return 404)${NC}"
echo -e "${RED}Expected: 404 Not Found${NC}"
curl -s -w "\nStatus Code: %{http_code}\n" http://demo.local/api/users/999999 | jq .

echo -e "\n${GREEN}All tests completed!${NC}" 