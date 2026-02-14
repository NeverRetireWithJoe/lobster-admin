# 🦞 小龍蝦付費管理系統

完整的 Telegram Bot 付費用戶管理後台系統。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/joe-github/lobster-admin)

## 功能特色

### ✨ 核心功能
- 🔐 **管理員登入** - JWT token 認證，安全可靠
- 📊 **儀表板** - 總覽用戶數、營收、訊息量等關鍵指標
- 👥 **用戶管理** - 新增、編輯、刪除用戶，查看使用情況
- 💎 **方案管理** - 動態調整方案參數，即時生效
- 🦞 **龍蝦控制** - 監控 3 隻 Bot 狀態，發送廣播訊息
- 📈 **財經訂閱** - 管理訂閱用戶列表
- ⚙️ **系統設定** - 調整試用期、限制參數等

### 🔄 即時同步
所有用戶、方案、訂閱設定都會即時同步到各個 Bot 的配置文件：
- `/home/autorun/.openclaw/workspace-smartbot1/users.json`
- `/home/autorun/.openclaw/workspace-smartbot1/subscribers.json`
- 以此類推 (smartbot2, smartbot3)

## 技術棧

- **前端**: React 18 + Vite + TailwindCSS
- **後端**: Node.js + Express
- **資料庫**: SQLite (better-sqlite3)
- **認證**: JWT
- **風格**: 深色主題，響應式設計

## 安裝與啟動

### 一鍵啟動
```bash
chmod +x start.sh
./start.sh
```

啟動腳本會自動：
1. 安裝後端依賴
2. 安裝前端依賴
3. 建置前端
4. 啟動後端伺服器（port 8080）

### 手動啟動

#### 後端
```bash
cd backend
npm install
node server.js
```

#### 前端（開發模式）
```bash
cd frontend
npm install
npm run dev
```

#### 前端（生產模式）
```bash
cd frontend
npm install
npm run build
# 靜態文件會輸出到 frontend/dist，由後端 serve
```

## 使用說明

### 登入
- **網址**: `http://localhost:8080`
- **預設帳號**: `admin`
- **預設密碼**: `lobster2026`

### 方案設定
系統預設三個方案：

| 方案 | 月費 | 人數上限 | 每日訊息上限 | 月Token上限 |
|------|------|---------|------------|-----------|
| 🦞 個人版 | NT$500 | 1 | 50 | 5M |
| 👨‍👩‍👧 家庭版 | NT$1,000 | 3 | 50/人 | 15M |
| 🏢 企業版 | NT$3,000 | 10 | 30/人 | 30M |

所有參數都可在「方案管理」頁面即時修改。

### API 端點

#### 認證
- `POST /api/auth/login` - 登入

#### Dashboard
- `GET /api/dashboard/stats` - 獲取統計資料

#### 用戶管理
- `GET /api/users` - 獲取所有用戶
- `POST /api/users` - 新增用戶
- `PUT /api/users/:id` - 更新用戶
- `DELETE /api/users/:id` - 刪除用戶

#### 方案管理
- `GET /api/plans` - 獲取所有方案
- `PUT /api/plans` - 更新方案

#### Bot 控制
- `GET /api/bots/status` - 獲取 Bot 狀態
- `POST /api/bots/broadcast` - 發送廣播訊息

#### 訂閱管理
- `GET /api/subscribers` - 獲取訂閱者
- `POST /api/subscribers` - 新增訂閱者
- `DELETE /api/subscribers/:telegram_id` - 移除訂閱者

#### 系統設定
- `GET /api/settings` - 獲取設定
- `PUT /api/settings` - 更新設定
- `PUT /api/settings/password` - 修改管理員密碼

## 資料同步機制

當您在後台修改用戶、方案或訂閱者時，系統會自動將資料寫入到以下位置：

```
/home/autorun/.openclaw/workspace-smartbot1/
  ├── users.json          # 用戶資料
  └── subscribers.json    # 訂閱者列表

/home/autorun/.openclaw/workspace-smartbot2/
  ├── users.json
  └── subscribers.json

/home/autorun/.openclaw/workspace-smartbot3/
  ├── users.json
  └── subscribers.json

/home/autorun/.openclaw/workspace/lobster-admin/
  └── config.json         # 全局設定（方案定義、限制參數）
```

確保各 Bot 能即時讀取最新設定。

## 安全建議

1. **修改預設密碼** - 登入後立即在「系統設定」修改管理員密碼
2. **反向代理** - 生產環境建議使用 Nginx 反向代理並啟用 HTTPS
3. **JWT Secret** - 修改 `backend/auth.js` 中的 `JWT_SECRET`
4. **防火牆** - 限制 8080 端口只能從信任的 IP 訪問

## 開發

### 目錄結構
```
lobster-admin/
├── backend/              # 後端
│   ├── routes/          # API 路由
│   ├── database.js      # SQLite 資料庫
│   ├── auth.js          # JWT 認證
│   └── server.js        # Express 主程式
├── frontend/            # 前端
│   └── src/
│       ├── components/  # React 組件
│       ├── pages/       # 頁面組件
│       └── utils/       # 工具函數
├── config.json          # 全局設定
├── database.db          # SQLite 資料庫文件
├── start.sh             # 啟動腳本
└── README.md
```

## 生產環境部署

### Vercel 部署（前端）

詳細步驟請參閱 [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)

**快速部署**：
1. Fork 本項目到你的 GitHub
2. 點擊上方 "Deploy with Vercel" 按鈕
3. 設定環境變數 `VITE_API_URL` 為你的後端 API 地址
4. 部署完成！

### VPS 部署（後端）

**使用 PM2（推薦）**：
```bash
npm install -g pm2
cd /home/autorun/.openclaw/workspace/lobster-admin
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**或使用內建腳本**：
```bash
./run-background.sh start
```

## 環境變數

### 前端
創建 `frontend/.env`：
```
VITE_API_URL=http://your-api-server.com:8080
```

### 後端
創建 `backend/.env`（可選）：
```
PORT=8080
NODE_ENV=production
JWT_SECRET=your-random-secret-key
```

## 授權

MIT License

---

🦞 **小龍蝦管理系統** - 讓付費用戶管理變得簡單高效！
