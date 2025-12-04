#!/bin/bash
# Test script for file upload endpoint

echo "=========================================="
echo "Testing File Upload Endpoint"
echo "=========================================="
echo ""

# Test file
TEST_FILE="test_upload.txt"
ENDPOINT="http://localhost:3000/api/files/upload"

echo "1. Checking if test file exists..."
if [ ! -f "$TEST_FILE" ]; then
    echo "   ✗ Test file not found: $TEST_FILE"
    exit 1
fi
echo "   ✓ Test file found: $TEST_FILE"
echo ""

echo "2. Testing file upload endpoint..."
echo "   Endpoint: POST $ENDPOINT"
echo "   File: $TEST_FILE"
echo "   Folder: test"
echo "   UserId: test-user-123"
echo ""

RESPONSE=$(curl -s -X POST "$ENDPOINT" \
    -F "file=@$TEST_FILE" \
    -F "folder=test" \
    -F "userId=test-user-123" \
    -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

echo "3. Response:"
echo "   HTTP Status Code: $HTTP_CODE"
echo ""
echo "   Response Body:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Upload successful!"
    
    # Extract fileId if present
    FILE_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('fileId', 'N/A'))" 2>/dev/null || echo "N/A")
    
    if [ "$FILE_ID" != "N/A" ] && [ "$FILE_ID" != "" ]; then
        echo ""
        echo "4. Testing file retrieval..."
        echo "   GET http://localhost:3000/api/files/$FILE_ID"
        echo ""
        
        RETRIEVE_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/files/$FILE_ID")
        echo "   Response:"
        echo "$RETRIEVE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RETRIEVE_RESPONSE"
    fi
else
    echo "✗ Upload failed or endpoint not found"
    echo ""
    echo "Note: If you see HTML instead of JSON, the server may need to be restarted"
    echo "      to load the new /api/files route."
fi

echo ""
echo "=========================================="

