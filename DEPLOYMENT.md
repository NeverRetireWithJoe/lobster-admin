# 🦞 小龍蝦管理系統 - 部署指南

## 快速啟動

### 方式一：一鍵啟動（推薦）
```bash
cd /home/autorun/.openclaw/workspace/lobster-admin
./start.sh
```

這會自動：
1. 安裝所有依賴
2. 建置前端
3. 啟動服務器

### 方式二：後台運行
```bash
cd /home/autorun/.openclaw/workspace/lobster-admin
./run-background.sh start    # 啟動
./run-background.sh status   # 檢查狀態
./run-background.sh logs     # 查看日誌
./run-background.sh stop     # 停止
./run-background.sh restart  # 重啟
```

## 訪問系統

- **網址**: http://localhost:8080
- **預設帳號**: admin
- **預設密碼**: lobster2026

⚠️ **首次登入後請立即修改密碼！**

## 功能清單

### ✅ 已實作功能

#### 1. 認證系統
- [x] 管理員登入（JWT）
- [x] Token 自動刷新
- [x] 密碼修改功能

#### 2. 儀表板
- [x] 總用戶數統計
- [x] 付費用戶數統計
- [x] 月營收計算
- [x] 今日訊息量
- [x] API Token 用量
- [x] 3 隻小龍蝦狀態顯示

#### 3. 用戶管理
- [x] 查看所有用戶
- [x] 新增用戶
- [x] 編輯用戶（方案、狀態、到期日）
- [x] 刪除用戶
- [x] 搜尋功能
- [x] 即時同步到 bot 的 users.json

#### 4. 方案管理
- [x] 查看所有方案
- [x] 編輯方案參數（價格、限制等）
- [x] 新增自訂方案
- [x] 刪除方案
- [x] 即時寫入 config.json

#### 5. 小龍蝦控制
- [x] 查看 3 隻 bot 狀態
- [x] 顯示每隻 bot 的用戶列表
- [x] 廣播訊息功能

#### 6. 財經訂閱管理
- [x] 查看訂閱者列表
- [x] 新增訂閱者
- [x] 移除訂閱者
- [x] 即時同步到所有 bot 的 subscribers.json

#### 7. 系統設定
- [x] 免費試用天數設定
- [x] 試用期訊息限制
- [x] 過期用戶訊息限制
- [x] 頻率限制設定
- [x] 管理員密碼修改

## 資料同步機制

系統會自動同步資料到以下位置：

```
/home/autorun/.openclaw/workspace-smartbot1/
├── users.json          ← 用戶資料
└── subscribers.json    ← 財經訂閱名單

/home/autorun/.openclaw/workspace-smartbot2/
├── users.json
└── subscribers.json

/home/autorun/.openclaw/workspace-smartbot3/
├── users.json
└── subscribers.json

/home/autorun/.openclaw/workspace/lobster-admin/
└── config.json         ← 全局設定（方案定義、限制參數）
```

## 測試 API

運行自動測試：
```bash
./test-api.sh
```

## 目錄結構

```
lobster-admin/
├── backend/              # 後端 Express 服務
│   ├── routes/          # API 路由
│   ├── database.js      # SQLite 資料庫（使用 sql.js）
│   ├── auth.js          # JWT 認證
│   └── server.js        # 主程式
├── frontend/            # 前端 React 應用
│   ├── dist/           # 建置輸出（由後端 serve）
│   └── src/
│       ├── components/ # React 組件
│       ├── pages/      # 頁面組件
│       └── utils/      # 工具函數（API client）
├── config.json          # 全局設定
├── database.db          # SQLite 資料庫文件
├── start.sh            # 一鍵啟動腳本
├── run-background.sh   # 後台運行腳本
├── test-api.sh         # API 測試腳本
└── README.md           # 使用說明
```

## 技術棧

- **前端**: React 18 + Vite + TailwindCSS
- **後端**: Node.js + Express
- **資料庫**: SQLite (sql.js - 純 JS 實作)
- **認證**: JWT (jsonwebtoken)
- **密碼加密**: bcryptjs

## API 端點

### 認證
- `POST /api/auth/login` - 登入

### Dashboard
- `GET /api/dashboard/stats` - 獲取統計資料

### 用戶管理
- `GET /api/users` - 獲取所有用戶
- `POST /api/users` - 新增用戶
- `PUT /api/users/:id` - 更新用戶
- `DELETE /api/users/:id` - 刪除用戶

### 方案管理
- `GET /api/plans` - 獲取所有方案
- `PUT /api/plans` - 更新方案

### Bot 控制
- `GET /api/bots/status` - 獲取 Bot 狀態
- `POST /api/bots/broadcast` - 發送廣播訊息

### 訂閱管理
- `GET /api/subscribers` - 獲取訂閱者
- `POST /api/subscribers` - 新增訂閱者
- `DELETE /api/subscribers/:telegram_id` - 移除訂閱者

### 系統設定
- `GET /api/settings` - 獲取設定
- `PUT /api/settings` - 更新設定
- `PUT /api/settings/password` - 修改管理員密碼

## 安全建議

### 1. 立即修改預設密碼
登入後前往「系統設定」修改管理員密碼。

### 2. 修改 JWT Secret
編輯 `backend/auth.js`，修改 `JWT_SECRET` 為隨機字串：
```javascript
const JWT_SECRET = '你的隨機字串';
```

### 3. 使用 HTTPS
生產環境建議使用 Nginx 反向代理並啟用 SSL：
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. 限制訪問
使用防火牆限制 8080 端口只能從信任的 IP 訪問：
```bash
# 僅供參考（需要 root 權限）
sudo ufw allow from 192.168.1.0/24 to any port 8080
```

## 疑難排解

### 服務無法啟動
1. 檢查端口 8080 是否被占用：
   ```bash
   lsof -i :8080
   ```

2. 查看日誌：
   ```bash
   ./run-background.sh logs
   ```

### 前端無法載入
1. 確認前端已建置：
   ```bash
   ls frontend/dist/
   ```

2. 重新建置：
   ```bash
   cd frontend && npm run build
   ```

### 資料庫錯誤
刪除資料庫重新初始化（會清空所有資料）：
```bash
rm database.db
./run-background.sh restart
```

## 更新日誌

### v1.0.0 (2026-02-14)
- ✅ 初始版本發布
- ✅ 所有核心功能完成
- ✅ 前後端完整整合
- ✅ 資料同步機制正常運作

---

🦞 **小龍蝦管理系統** - 讓付費用戶管理變得簡單高效！
