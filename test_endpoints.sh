#!/bin/bash

# Test script for Bedrock and Gigs endpoints
# Make sure the server is running before executing this script

BASE_URL="${VITE_BASE_URL:-http://localhost:3000}"

echo "=========================================="
echo "Testing Bedrock and Gigs Endpoints"
echo "Base URL: $BASE_URL"
echo "=========================================="
echo ""

# Test 1: Bedrock search endpoint
echo "Test 1: Bedrock Search Endpoint"
echo "POST $BASE_URL/api/bedrock/search"
response=$(curl -s -X POST "$BASE_URL/api/bedrock/search" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, this is a test", "script": null}')
echo "Response: $response"
echo ""

# Test 2: Bedrock search with script
echo "Test 2: Bedrock Search with Script"
echo "POST $BASE_URL/api/bedrock/search"
response=$(curl -s -X POST "$BASE_URL/api/bedrock/search" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is this about?", "script": "This is a test script context"}')
echo "Response: $response"
echo ""

# Test 3: Get all gigs
echo "Test 3: Get All Gigs"
echo "GET $BASE_URL/api/gigs/get/all"
response=$(curl -s -X GET "$BASE_URL/api/gigs/get/all")
echo "Response: $response"
echo ""

# Test 4: Get gigs by tag
echo "Test 4: Get Gigs by Tag"
echo "GET $BASE_URL/api/gigs/by-tag?tag=REAL_ESTATE"
response=$(curl -s -X GET "$BASE_URL/api/gigs/by-tag?tag=REAL_ESTATE")
echo "Response: $response"
echo ""

echo "=========================================="
echo "Testing Complete"
echo "=========================================="

