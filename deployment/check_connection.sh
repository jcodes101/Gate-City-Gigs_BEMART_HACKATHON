#!/bin/bash
# Quick diagnostic script to check EC2 connectivity and app status
# Run this on EC2: bash check_connection.sh

echo "=========================================="
echo "EC2 Connection Diagnostic"
echo "=========================================="
echo ""

echo "1. Checking PM2 Status..."
pm2 status
echo ""

echo "2. Checking PM2 Logs (last 20 lines)..."
pm2 logs be-smart-server --lines 20 --nostream
echo ""

echo "3. Checking if port 3000 is listening..."
sudo netstat -tlnp | grep 3000 || echo "Port 3000 not found in listening ports!"
echo ""

echo "4. Testing local connection..."
curl -v http://localhost:3000 2>&1 | head -20 || echo "Local connection failed!"
echo ""

echo "5. Checking public IP..."
PUBLIC_IP=$(curl -s ifconfig.me)
echo "Public IP: $PUBLIC_IP"
echo ""

echo "6. Checking firewall status..."
sudo ufw status || echo "ufw not installed or not active"
echo ""

echo "7. Checking application files..."
ls -la /home/ubuntu/be-smart-app/server.js 2>/dev/null && echo "✓ server.js exists" || echo "✗ server.js missing"
ls -la /home/ubuntu/be-smart/dist/index.html 2>/dev/null && echo "✓ React build exists" || echo "✗ React build missing"
echo ""

echo "8. Checking environment variables..."
if [ -f /home/ubuntu/be-smart-app/.env.production ]; then
    echo "✓ .env.production exists"
    grep -E "PORT|BASE_URL" /home/ubuntu/be-smart-app/.env.production | head -5
else
    echo "✗ .env.production missing!"
fi
echo ""

echo "=========================================="
echo "IMPORTANT: Check Security Group"
echo "=========================================="
echo "If port 3000 is listening but you can't access from outside:"
echo "1. Go to AWS Console → EC2 → Security Groups"
echo "2. Find your EC2 instance's security group"
echo "3. Edit Inbound Rules"
echo "4. Add: Type=Custom TCP, Port=3000, Source=0.0.0.0/0"
echo "5. Save rules"
echo ""
echo "Then try: http://$PUBLIC_IP:3000"
echo ""

