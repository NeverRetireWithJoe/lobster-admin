# 📦 GitHub 推送指南

## 已完成

✅ Git repository 已初始化  
✅ 所有文件已提交到本地 repository  
✅ Git 配置：
- User: MindMapDiTu
- Email: joe@mindmapditu.com

## 推送到 GitHub

### 方式一：創建新 Repository（推薦）

1. **在 GitHub 上創建新 repository**

訪問：https://github.com/new

設定：
- Repository name: `lobster-admin`
- Description: `🦞 小龍蝦付費管理系統 - Telegram Bot 用戶管理後台`
- Visibility: Private 或 Public（看需求）
- ❌ 不要勾選 "Initialize this repository with a README"

2. **推送程式碼**

```bash
cd /home/autorun/.openclaw/workspace/lobster-admin

# 設定遠端 repository（替換成你的用戶名）
git remote add origin https://github.com/YOUR_USERNAME/lobster-admin.git

# 重命名分支為 main（GitHub 新標準）
git branch -M main

# 推送程式碼
git push -u origin main
```

### 方式二：使用 GitHub CLI

如果已安裝 `gh` CLI：

```bash
cd /home/autorun/.openclaw/workspace/lobster-admin

# 登入 GitHub
gh auth login

# 創建 repository 並推送
gh repo create lobster-admin --private --source=. --push

# 或創建公開 repository
gh repo create lobster-admin --public --source=. --push
```

## 設定 GitHub Secrets（用於 CI/CD）

如果需要設定自動部署，在 GitHub repository 設定中添加：

- `VERCEL_TOKEN`: Vercel API token
- `VPS_HOST`: VPS 主機地址
- `VPS_USER`: SSH 用戶名
- `VPS_KEY`: SSH 私鑰

## Repository 設定建議

### 1. 添加 Topics

在 repository 頁面點擊設定齒輪，添加 topics：
- `telegram-bot`
- `payment-system`
- `react`
- `express`
- `admin-panel`
- `user-management`

### 2. 設定 Branch Protection

Settings → Branches → Add rule
- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging

### 3. 啟用 Issues 和 Projects

Settings → Features
- ✅ Issues
- ✅ Projects

## 後續更新流程

```bash
cd /home/autorun/.openclaw/workspace/lobster-admin

# 查看變更
git status

# 添加變更
git add .

# 提交
git commit -m "描述你的變更"

# 推送
git push
```

## 協作者管理

Settings → Collaborators → Add people

## Repository URL

創建完成後，你的 repository 將位於：
```
https://github.com/YOUR_USERNAME/lobster-admin
```

## Clone 指令

其他人可以使用以下指令 clone：
```bash
git clone https://github.com/YOUR_USERNAME/lobster-admin.git
cd lobster-admin
```

## 注意事項

⚠️ 確保以下敏感文件已被 `.gitignore` 排除：
- ✅ `database.db` (已排除)
- ✅ `.env` (已排除)
- ✅ `node_modules/` (已排除)
- ✅ `*.log` (已排除)

你可以驗證：
```bash
git ls-files | grep -E '(\.db$|\.env$|node_modules|\.log$)'
# 應該沒有輸出
```

---

🎉 完成推送後，你就可以：
1. 從 GitHub 直接部署到 Vercel
2. 與團隊協作
3. 追蹤版本歷史
4. 設定自動化工作流程
