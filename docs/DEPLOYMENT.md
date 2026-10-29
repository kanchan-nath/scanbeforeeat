# ScanBeforeEat — Production Deployment & Operations Guide

## 1. Prerequisites for Production

- **Node.js**: v20.x, v22.x, or v24.x LTS
- **Database**: Managed MySQL 8.0+ or compatible (AWS RDS, DigitalOcean Managed Database, PlanetScale, Cloud SQL)
- **HTTPS / TLS Certificate**: Valid SSL certificate (Let's Encrypt or Cloudflare) — mandatory for Browser Camera API (`navigator.mediaDevices`) and Service Worker registration.
- **NVIDIA NIM API Key**: Production key from [build.nvidia.com](https://build.nvidia.com/).

---

## 2. Environment Variables Checklist

Set the following environment variables in your production environment (via Docker, systemd, or platform dashboard):

| Variable | Recommended Production Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables secure cookies, removes debug traces |
| `PORT` | `3000` (or `8080`) | Server HTTP listening port |
| `APP_BASE_URL` | `https://scanbeforeeat.com` | Public canonical application URL |
| `DB_HOST` | `mysql-primary.internal` | Managed MySQL endpoint |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `scanbeforeeat` | Application database |
| `DB_USER` | `scanbeforeeat_app` | Dedicated least-privilege user |
| `DB_PASSWORD` | `<secure-generated-password>` | Strong database password |
| `DB_SSL` | `true` | Enforces TLS connection to database |
| `SESSION_SECRET` | `<64-character-random-hex>` | Secret key for signing session cookies |
| `NVIDIA_API_KEY` | `nvapi-...` | Production NVIDIA NIM API Key |
| `NVIDIA_API_BASE_URL` | `https://integrate.api.nvidia.com/v1` | NIM API Endpoint |
| `NVIDIA_MODEL` | `meta/llama-3.3-70b-instruct` | LLM model identifier |
| `AI_MOCK_MODE` | `false` | Disables mock mode for real AI analysis |
| `LOG_LEVEL` | `info` | Logging verbosity |

---

## 3. Database Migration Execution

Run migrations during your deployment pipeline before starting the new application container:

```bash
npm run db:migrate
```

To seed initial demonstration data in staging or demo environments:
```bash
npm run db:seed
```

---

## 4. Production Process Management

Using **PM2** or **Docker**:

```bash
# Using PM2
npm install -g pm2
pm2 start server/server.js --name "scanbeforeeat" -i max
pm2 save
```

Or using **Docker**:
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server/server.js"]
```

---

## 5. Reverse Proxy Configuration (Nginx)

```nginx
server {
    server_name scanbeforeeat.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/scanbeforeeat.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/scanbeforeeat.com/privkey.pem;
}
```

---

## 6. Testing Camera & Barcode on Mobile Devices Over HTTPS

Browsers strictly disable `navigator.mediaDevices.getUserMedia` when accessed over unencrypted HTTP (except on `localhost`).

To test on your physical smartphone during development:
1. **Using ngrok or cloudflared**:
   ```bash
   ngrok http 3000
   ```
2. Open the generated HTTPS URL on your phone browser.
3. Grant camera permissions when prompted to scan printed ingredient labels and barcodes!
