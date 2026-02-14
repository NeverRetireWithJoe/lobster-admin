# 🦞 小龍蝦管理系統 - Vercel 部署指南

## 部署架構

本項目採用**前後端分離**部署：

- **前端**: Vercel（靜態網站）
- **後端**: VPS (本地伺服器，port 8080)

## 前置準備

### 1. 確保後端運行正常

在 VPS 上：
```bash
cd /home/autorun/.openclaw/workspace/lobster-admin
./run-background.sh start
./run-background.sh status
```

確認後端運行在 `http://YOUR_VPS_IP:8080`

### 2. 設定防火牆

開放 8080 端口（如果需要）：
```bash
# 範例（需要 root 權限）
sudo ufw allow 8080/tcp
```

## Vercel 前端部署

### 方式一：通過 Vercel CLI（推薦）

1. **安裝 Vercel CLI**
```bash
npm install -g vercel
```

2. **登入 Vercel**
```bash
vercel login
```

3. **部署前端**
```bash
cd /home/autorun/.openclaw/workspace/lobster-admin
vercel
```

按照提示操作：
- Set up and deploy: Yes
- Which scope: 選擇你的帳號
- Link to existing project: No
- Project name: lobster-admin
- In which directory is your code located: `./frontend`
- Override settings: Yes
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

4. **設定環境變數**

在 Vercel Dashboard 或使用 CLI：
```bash
vercel env add VITE_API_URL
# 輸入: http://YOUR_VPS_IP:8080
```

5. **重新部署**
```bash
vercel --prod
```

### 方式二：通過 Vercel Dashboard

1. 訪問 [vercel.com](https://vercel.com)
2. 點擊 "Add New Project"
3. 從 GitHub 導入項目
4. 設定：
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 環境變數：
   - `VITE_API_URL`: `http://YOUR_VPS_IP:8080`
6. 點擊 "Deploy"

## 後端持久化運行

### 使用 PM2（推薦）

1. **安裝 PM2**
```bash
npm install -g pm2
```

2. **創建 PM2 配置**
創建 `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'lobster-admin-api',
    cwd: '/home/autorun/.openclaw/workspace/lobster-admin/backend',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
}
```

3. **啟動服務**
```bash
cd /home/autorun/.openclaw/workspace/lobster-admin
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 使用 Systemd

創建 `/etc/systemd/system/lobster-admin.service`（需要 root）:
```ini
[Unit]
Description=Lobster Admin Backend
After=network.target

[Service]
Type=simple
User=autorun
WorkingDirectory=/home/autorun/.openclaw/workspace/lobster-admin/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

啟動服務：
```bash
sudo systemctl enable lobster-admin
sudo systemctl start lobster-admin
sudo systemctl status lobster-admin
```

## 使用 Nginx 反向代理（可選，推薦）

### 安裝 Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 配置 Nginx

創建 `/etc/nginx/sites-available/lobster-admin`:
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

啟用配置：
```bash
sudo ln -s /etc/nginx/sites-available/lobster-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL 證書（使用 Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

## CORS 配置

後端已經啟用 CORS，如果需要限制來源，修改 `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

## 環境變數配置總結

### 前端（Vercel）
- `VITE_API_URL`: 後端 API 地址
  - 有域名: `https://api.your-domain.com`
  - 無域名: `http://YOUR_VPS_IP:8080`

### 後端（VPS）
不需要環境變數，直接運行即可。

如果使用 .env：
```bash
PORT=8080
NODE_ENV=production
```

## 驗證部署

1. **檢查前端**
訪問 Vercel 提供的 URL（例如：`https://lobster-admin.vercel.app`）

2. **檢查 API 連接**
打開瀏覽器開發者工具 → Network，登入系統，確認 API 請求正確指向後端

3. **測試功能**
- 登入
- 查看 Dashboard
- 新增用戶
- 修改方案

## 常見問題

### Q: 前端無法連接後端
A: 檢查：
1. 後端是否運行：`./run-background.sh status`
2. 防火牆是否開放 8080
3. VITE_API_URL 是否正確設定
4. CORS 配置是否包含前端域名

### Q: 如何更新前端
A: 
```bash
cd /home/autorun/.openclaw/workspace/lobster-admin/frontend
npm run build
vercel --prod
```

### Q: 如何更新後端
A: 
```bash
cd /home/autorun/.openclaw/workspace/lobster-admin
git pull
./run-background.sh restart
```

或使用 PM2:
```bash
pm2 restart lobster-admin-api
```

## 監控和日誌

### 後端日誌
```bash
# 使用 run-background.sh
./run-background.sh logs

# 使用 PM2
pm2 logs lobster-admin-api

# 使用 systemd
sudo journalctl -u lobster-admin -f
```

### Vercel 日誌
訪問 Vercel Dashboard → 你的項目 → Deployments → 查看日誌

## 備份

定期備份重要文件：
```bash
# 資料庫
cp /home/autorun/.openclaw/workspace/lobster-admin/database.db ~/backups/database-$(date +%Y%m%d).db

# 配置
cp /home/autorun/.openclaw/workspace/lobster-admin/config.json ~/backups/config-$(date +%Y%m%d).json
```

## 成本估算

- **Vercel**: 免費（Hobby 計劃）
- **VPS**: 依現有伺服器，無額外成本
- **域名**（可選）: ~$10-15/年
- **總計**: $0-15/年

---

🦞 部署完成後，你的管理系統將在全球 CDN 上運行，並連接到你的 VPS 後端！
