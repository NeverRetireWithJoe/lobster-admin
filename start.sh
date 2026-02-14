#!/bin/bash

echo "🦞 小龍蝦管理系統啟動腳本"
echo "=============================="

# 檢查並安裝後端依賴
echo "📦 檢查後端依賴..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "安裝後端依賴..."
    npm install
fi

# 檢查並安裝前端依賴，並 build
echo "📦 檢查前端依賴..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "安裝前端依賴..."
    npm install
fi

echo "🔨 建置前端..."
npm run build

# 回到根目錄啟動後端
cd ..
echo "🚀 啟動後端伺服器..."
cd backend
node server.js
