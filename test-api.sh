#!/bin/bash

echo "🦞 小龍蝦管理系統 API 測試"
echo "=============================="
echo ""

# 測試登入
echo "1️⃣ 測試登入..."
LOGIN_RESULT=$(curl -s http://localhost:8080/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"lobster2026"}')
TOKEN=$(echo $LOGIN_RESULT | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ 登入成功！Token: ${TOKEN:0:50}..."
else
    echo "❌ 登入失敗"
    exit 1
fi

echo ""

# 測試 Dashboard
echo "2️⃣ 測試 Dashboard..."
STATS=$(curl -s http://localhost:8080/api/dashboard/stats -H "Authorization: Bearer $TOKEN")
if echo "$STATS" | grep -q "totalUsers"; then
    echo "✅ Dashboard API 正常"
    echo "$STATS" | python3 -m json.tool 2>/dev/null || echo "$STATS"
else
    echo "❌ Dashboard API 失敗"
fi

echo ""

# 測試方案管理
echo "3️⃣ 測試方案管理..."
PLANS=$(curl -s http://localhost:8080/api/plans -H "Authorization: Bearer $TOKEN")
if echo "$PLANS" | grep -q "personal"; then
    echo "✅ 方案管理 API 正常"
    PLAN_COUNT=$(echo "$PLANS" | grep -o "\"id\"" | wc -l)
    echo "📋 共有 $PLAN_COUNT 個方案"
else
    echo "❌ 方案管理 API 失敗"
fi

echo ""

# 測試用戶管理
echo "4️⃣ 測試用戶管理..."
USERS=$(curl -s http://localhost:8080/api/users -H "Authorization: Bearer $TOKEN")
if echo "$USERS" | grep -q "\["; then
    echo "✅ 用戶管理 API 正常"
    USER_COUNT=$(echo "$USERS" | grep -o "\"telegram_id\"" | wc -l)
    echo "👥 共有 $USER_COUNT 個用戶"
else
    echo "❌ 用戶管理 API 失敗"
fi

echo ""

# 測試新增用戶
echo "5️⃣ 測試新增用戶..."
ADD_USER=$(curl -s http://localhost:8080/api/users -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"telegram_id":"test123","name":"測試用戶","plan_id":"personal","expiry_date":"2026-12-31"}')
if echo "$ADD_USER" | grep -q "成功"; then
    echo "✅ 新增用戶成功"
else
    echo "⚠️ 新增用戶: $ADD_USER"
fi

echo ""

# 測試 Bot 狀態
echo "6️⃣ 測試 Bot 狀態..."
BOTS=$(curl -s http://localhost:8080/api/bots/status -H "Authorization: Bearer $TOKEN")
if echo "$BOTS" | grep -q "小龍蝦"; then
    echo "✅ Bot 狀態 API 正常"
    BOT_COUNT=$(echo "$BOTS" | grep -o "\"name\"" | wc -l)
    echo "🦞 共有 $BOT_COUNT 隻小龍蝦"
else
    echo "❌ Bot 狀態 API 失敗"
fi

echo ""

# 測試前端
echo "7️⃣ 測試前端..."
FRONTEND=$(curl -s http://localhost:8080/ | head -5)
if echo "$FRONTEND" | grep -q "小龍蝦管理系統"; then
    echo "✅ 前端服務正常"
else
    echo "❌ 前端服務失敗"
fi

echo ""
echo "=============================="
echo "✨ 測試完成！"
echo "🌐 請訪問: http://localhost:8080"
echo "👤 帳號: admin"
echo "🔑 密碼: lobster2026"
