#!/bin/bash
# ==============================================================================
# JELAJAH (jelajah.tech) — Script Otomatisasi Setup Server AWS EC2 (Ubuntu 24.04/22.04)
# Menyiapkan Node.js 20 LTS, PM2, Nginx Reverse Proxy & Certbot SSL Let's Encrypt
# ==============================================================================

set -e

echo "🚀 [1/6] Memperbarui Repositori Sistem Ubuntu..."
sudo apt update && sudo apt upgrade -y

echo "📦 [2/6] Memasang Library Pendukung & Nginx..."
sudo apt install -y curl git ufw nginx certbot python3-certbot-nginx

echo "🟢 [3/6] Memasang Node.js 20 LTS & PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

echo "🛡️ [4/6] Mengatur Firewall UFW..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "⚙️ [5/6] Memasang Konfigurasi Nginx jelajah.tech..."
sudo cp deploy/nginx-jelajah.conf /etc/nginx/sites-available/jelajah
sudo ln -sf /etc/nginx/sites-available/jelajah /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "🚀 [6/6] Menjalankan Aplikasi JELAJAH dengan PM2..."
pm2 start server.js --name "jelajah"
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

echo ""
echo "=============================================================================="
echo "✅ SETUP SELESAI!"
echo "Aplikasi telah berjalan di background dengan PM2 dan dilayani oleh Nginx di port 80."
echo ""
echo "LANGKAH TERAKHIR (AKTIFKAN SSL HTTPS GRATIS):"
echo "Pastikan DNS domain jelajah.tech sudah diarahkan ke Public IP EC2 ini, lalu jalankan:"
echo "👉 sudo certbot --nginx -d jelajah.tech -d www.jelajah.tech"
echo "=============================================================================="
