#!/bin/bash

# Test script to check direct service connectivity
echo "🧪 Testing Direct Service Connectivity"
echo "====================================="

# Service URLs from deployment
AUTH_URL="https://auth-service.mangorock-348e27b8.eastus2.azurecontainerapps.io"
EVENTS_URL="https://events-service.mangorock-348e27b8.eastus2.azurecontainerapps.io"
PROJECTS_URL="https://projects-service.mangorock-348e27b8.eastus2.azurecontainerapps.io"
PARTICIPANTS_URL="https://participants-service.mangorock-348e27b8.eastus2.azurecontainerapps.io"
NOTIFICATIONS_URL="https://notifications-service.mangorock-348e27b8.eastus2.azurecontainerapps.io"

echo "Testing Auth Service..."
echo "URL: $AUTH_URL/health"
curl -s -w "\\nStatus: %{http_code}\\n" "$AUTH_URL/health" | head -10
echo ""

echo "Testing Events Service..."
echo "URL: $EVENTS_URL/"
curl -s -w "\\nStatus: %{http_code}\\n" "$EVENTS_URL/" | head -10
echo ""

echo "Testing Projects Service..."
echo "URL: $PROJECTS_URL/"
curl -s -w "\\nStatus: %{http_code}\\n" "$PROJECTS_URL/" | head -10
echo ""

echo "Testing Participants Service..."
echo "URL: $PARTICIPANTS_URL/"
curl -s -w "\\nStatus: %{http_code}\\n" "$PARTICIPANTS_URL/" | head -10
echo ""

echo "Testing Notifications Service..."
echo "URL: $NOTIFICATIONS_URL/"
curl -s -w "\\nStatus: %{http_code}\\n" "$NOTIFICATIONS_URL/" | head -10
echo ""

echo "Testing with --insecure flag (ignoring SSL)..."
echo "Auth Service (insecure):"
curl -s -k -w "\\nStatus: %{http_code}\\n" "$AUTH_URL/health" | head -5
echo ""

echo "✅ Direct connectivity test completed!"

