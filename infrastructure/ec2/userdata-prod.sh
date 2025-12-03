#!/bin/bash
set -e

sudo yum update -y
sudo yum install -y nodejs npm git

cd /home/ec2-user
git clone https://github.com/neocodingio/presence-io.git
cd presence-io

chown -R ec2-user:ec2-user /home/ec2-user/presence-io

npm install

npm install -g http-server
npm install -g pm2

PUBLIC_IP=$(ec2-metadata --public-ipv4 | cut -d " " -f 2)
cat > .env.local << EOF
VITE_SUPABASE_URL=https://pvzqvjvzzsayefkljzjm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_wahF5s68WkGtl6OxMBiYSQ_tTx0Uu2O
VITE_APP_URL=http://${PUBLIC_IP}:8080
EOF

npm run build

sudo -u ec2-user bash << 'PMEOF'
cd /home/ec2-user/presence-io
pm2 start "http-server dist -p 8080" --name "presence"
pm2 save
PMEOF

sudo env PATH=$PATH:/usr/bin /usr/lib/nodejs18/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

sudo -u ec2-user pm2 save