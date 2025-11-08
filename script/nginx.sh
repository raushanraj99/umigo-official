#!/bin/bash
set -e

# === CONFIG ===
DOMAIN="umigo.in"
FRONTEND_DIR="/home/ubuntu/umigo-code/frontend/umigo-official/"
WEBROOT="/var/www/$DOMAIN"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

# === 1. Build the Vite app ===
echo "🔧 Building Vite app..."
cd "$FRONTEND_DIR"
npm ci
npm run build


# === 2. Copy build output ===
echo "📦 Deploying build to $WEBROOT..."
sudo mkdir -p "$WEBROOT"
sudo cp -r dist/* "$WEBROOT/"
sudo chown -R www-data:www-data "$WEBROOT"
sudo chmod -R 755 /var/www/"$DOMAIN"

# === 3. Create Nginx config ===
echo "📝 Setting up Nginx config for $DOMAIN..."
sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $WEBROOT;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    access_log /var/log/nginx/${DOMAIN}_access.log;
    error_log /var/log/nginx/${DOMAIN}_error.log;
}
EOF

# === 4. Enable site and reload Nginx ===
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# === 5. Install Certbot & enable HTTPS ===
if ! command -v certbot >/dev/null 2>&1; then
  echo "🔐 Installing Certbot..."
  sudo apt update && sudo apt install -y certbot python3-certbot-nginx
fi

echo "🔒 Obtaining SSL certificate for $DOMAIN..."
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN"

# === 6. Verify Nginx ===
sudo nginx -t
sudo systemctl reload nginx

# === 7. Auto-renew setup (systemd timer) ===
echo "♻️ Enabling auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "✅ Deployment complete!"
echo "🌐 Visit: https://$DOMAIN"