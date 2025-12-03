#!/bin/bash
set -e

echo "=========================================="
echo "Installing Attendance Tracker - Setup Only"
echo "=========================================="

# Update system
echo "Updating system packages..."
yum update -y
yum install -y nodejs npm git

# Clone project
echo "Cloning repository..."
cd /home/ec2-user
git clone https://github.com/neocodingio/presence-io.git
cd presence-io

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

# Create .env.local
PUBLIC_IP=$(ec2-metadata --public-ipv4 | cut -d " " -f 2)
echo "Creating .env.local file..."
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=https://pvzqvjvzzsayefkljzjm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_wahF5s68WkGtl6OxMBiYSQ_tTx0Uu2O
VITE_APP_URL=http://${PUBLIC_IP}:8080
EOF

npm run dev