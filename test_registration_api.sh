#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="https://123test-new.launchpulse.ai"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="TestPass123!"
TEST_NAME="Test User"

echo -e "${YELLOW}Testing User Registration Flow${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}1. Testing Health Check...${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/api/health")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HEALTH_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "$HEALTH_BODY" | jq '.'
else
    echo -e "${RED}✗ Health check failed with status $HEALTH_CODE${NC}"
    echo "$HEALTH_BODY"
fi
echo ""

# Test 2: User Registration
echo -e "${YELLOW}2. Testing User Registration...${NC}"
REG_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"name\":\"${TEST_NAME}\"}")

REG_CODE=$(echo "$REG_RESPONSE" | tail -n 1)
REG_BODY=$(echo "$REG_RESPONSE" | sed '$d')

if [ "$REG_CODE" = "201" ]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    TOKEN=$(echo "$REG_BODY" | jq -r '.token')
    USER_ID=$(echo "$REG_BODY" | jq -r '.user.id')
    echo "User ID: $USER_ID"
    echo "Email: $TEST_EMAIL"
    echo ""
    
    # Test 3: Auth Verification
    echo -e "${YELLOW}3. Testing Auth Verification...${NC}"
    VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/api/auth/verify" \
      -H "Authorization: Bearer ${TOKEN}")
    
    VERIFY_CODE=$(echo "$VERIFY_RESPONSE" | tail -n 1)
    VERIFY_BODY=$(echo "$VERIFY_RESPONSE" | sed '$d')
    
    if [ "$VERIFY_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Auth verification passed${NC}"
        echo "$VERIFY_BODY" | jq '.'
    else
        echo -e "${RED}✗ Auth verification failed with status $VERIFY_CODE${NC}"
        echo "$VERIFY_BODY"
    fi
    echo ""
    
    # Test 4: Login
    echo -e "${YELLOW}4. Testing Login...${NC}"
    LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")
    
    LOGIN_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
    LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')
    
    if [ "$LOGIN_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Login successful${NC}"
        echo "$LOGIN_BODY" | jq '.'
    else
        echo -e "${RED}✗ Login failed with status $LOGIN_CODE${NC}"
        echo "$LOGIN_BODY"
    fi
    
else
    echo -e "${RED}✗ Registration failed with status $REG_CODE${NC}"
    echo "$REG_BODY" | jq '.'
fi

echo ""
echo -e "${YELLOW}Testing Complete${NC}"
