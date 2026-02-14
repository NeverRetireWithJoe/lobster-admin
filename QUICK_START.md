# 🚀 快速開始指南

## 本地開發（5分鐘啟動）

### 1. Clone 項目
```bash
git clone https://github.com/YOUR_USERNAME/lobster-admin.git
cd lobster-admin
```

### 2. 一鍵啟動
```bash
./start.sh
```

這會自動：
- ✅ 安裝前後端依賴
- ✅ 建置前端
- ✅ 啟動服務器

### 3. 訪問系統
```
網址: http://localhost:8080
帳號: admin
密碼: lobster2026
```

⚠️ **首次登入後請立即修改密碼！**

---

## 生產環境部署（10分鐘完成）

### 方案 A: Vercel（前端）+ VPS（後端）【推薦】

#### 步驟 1: 部署後端到 VPS

```bash
# SSH 到你的 VPS
ssh user@your-vps.com

# Clone 項目
git clone https://github.com/YOUR_USERNAME/lobster-admin.git
cd lobster-admin

# 安裝依賴
cd backend && npm install

# 使用 PM2 啟動
npm install -g pm2
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 步驟 2: 部署前端到 Vercel

1. 訪問 [vercel.com](https://vercel.com)
2. 點擊 "New Project"
3. Import 你的 GitHub repository
4. 配置：
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 環境變數：
   ```
   VITE_API_URL = http://YOUR_VPS_IP:8080
   ```
6. Deploy!

#### 步驟 3: 測試
訪問 Vercel 給你的 URL，登入測試所有功能。

---

### 方案 B: 全部部署在 VPS

```bash
# 後端
./run-background.sh start

# 前端（使用 Nginx）
cd frontend && npm run build
sudo cp -r dist/* /var/www/html/lobster-admin/

# Nginx 配置
sudo nano /etc/nginx/sites-available/lobster-admin
```

Nginx 配置內容：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html/lobster-admin;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
    }
}
```

---

## 日常使用

### 管理後端服務

```bash
# 啟動
./run-background.sh start

# 查看狀態
./run-background.sh status

# 查看日誌
./run-background.sh logs

# 停止
./run-background.sh stop

# 重啟
./run-background.sh restart
```

### 更新程式碼

```bash
git pull
./run-background.sh restart
```

### 備份資料

```bash
# 資料庫
cp database.db ~/backups/database-$(date +%Y%m%d).db

# 配置
cp config.json ~/backups/config-$(date +%Y%m%d).json
```

---

## 常用功能

### 新增用戶
1. 登入系統
2. 點擊「用戶管理」
3. 點擊「新增用戶」
4. 填寫 Telegram ID 和選擇方案
5. 儲存

### 修改方案
1. 點擊「方案管理」
2. 直接修改參數
3. 點擊「儲存變更」
4. 即時生效！

### 發送廣播
1. 點擊「龍蝦控制」
2. 點擊「發送廣播」
3. 選擇目標 Bot
4. 輸入訊息
5. 發送

---

## 疑難排解

### 無法啟動
```bash
# 檢查端口是否被占用
lsof -i :8080

# 查看日誌
./run-background.sh logs
```

### 前端無法連接後端
1. 檢查 `VITE_API_URL` 環境變數
2. 檢查後端是否運行
3. 檢查防火牆設定

### 忘記密碼
```bash
# 刪除資料庫重置（會清空所有資料）
rm database.db
./run-background.sh restart
# 預設密碼恢復為 lobster2026
```

---

## 獲取幫助

- 📖 完整文檔: [README.md](./README.md)
- 🚀 部署指南: [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)
- 📦 GitHub 設定: [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- ✅ 完成報告: [COMPLETED.md](./COMPLETED.md)

---

🦞 **享受使用小龍蝦管理系統！**
