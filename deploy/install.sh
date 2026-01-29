#!/bin/bash

#============================================
# mekan360 - Otomatik Kurulum Scripti
# Ubuntu 22.04/24.04 için
#============================================

set -e

echo "=========================================="
echo "  mekan360 Kurulum Başlıyor..."
echo "=========================================="

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Domain ve dizin ayarları
DOMAIN="mekan360.com.tr"
APP_DIR="/var/www/mekan360"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo -e "${YELLOW}[1/8] Sistem güncelleniyor...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}[2/8] Gerekli paketler kuruluyor...${NC}"
apt install -y curl wget git nginx certbot python3-certbot-nginx \
    python3 python3-pip python3-venv nodejs npm ufw

# Node.js 18+ kurulumu
echo -e "${YELLOW}[3/8] Node.js 18 kuruluyor...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g yarn pm2

# MongoDB kurulumu
echo -e "${YELLOW}[4/8] MongoDB kuruluyor...${NC}"
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

echo -e "${YELLOW}[5/8] Uygulama dizinleri oluşturuluyor...${NC}"
mkdir -p $APP_DIR
mkdir -p $BACKEND_DIR
mkdir -p $FRONTEND_DIR

echo -e "${YELLOW}[6/8] Firewall ayarlanıyor...${NC}"
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo -e "${YELLOW}[7/8] Nginx yapılandırılıyor...${NC}"
cat > /etc/nginx/sites-available/mekan360 << 'NGINX'
server {
    listen 80;
    server_name mekan360.com.tr www.mekan360.com.tr;

    # Frontend
    location / {
        root /var/www/mekan360/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/mekan360 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo -e "${YELLOW}[8/8] Temel kurulum tamamlandı!${NC}"

echo ""
echo -e "${GREEN}=========================================="
echo "  KURULUM TAMAMLANDI!"
echo "==========================================${NC}"
echo ""
echo "Sonraki adımlar:"
echo "1. Uygulama dosyalarını /var/www/mekan360 dizinine yükle"
echo "2. Backend .env dosyasını düzenle"
echo "3. Frontend .env dosyasını düzenle"
echo "4. SSL sertifikası al: certbot --nginx -d mekan360.com.tr"
echo ""
echo -e "${YELLOW}Domain DNS ayarını yapmayı unutma!${NC}"
echo "A kaydı: mekan360.com.tr -> 38.19.198.52"
echo ""
