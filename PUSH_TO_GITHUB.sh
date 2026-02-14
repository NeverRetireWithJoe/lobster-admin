#!/bin/bash

echo "🦞 準備推送到 GitHub"
echo "===================="
echo ""

# 檢查是否在正確的目錄
if [ ! -d ".git" ]; then
    echo "❌ 錯誤：請在項目根目錄執行此腳本"
    exit 1
fi

echo "📋 當前 Git 狀態："
git status
echo ""

echo "📝 提交歷史："
git log --oneline
echo ""

echo "📦 Repository 大小："
du -sh .git
echo ""

echo "📄 追蹤的文件數："
git ls-files | wc -l
echo ""

echo "⚠️  請確認以下信息："
echo "   Git 用戶: $(git config user.name)"
echo "   Git 郵箱: $(git config user.email)"
echo ""

read -p "是否要設定 GitHub remote？(y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "請輸入你的 GitHub 用戶名: " github_username
    
    if [ -z "$github_username" ]; then
        echo "❌ 用戶名不能為空"
        exit 1
    fi
    
    REPO_URL="https://github.com/$github_username/lobster-admin.git"
    
    echo ""
    echo "🔗 設定 remote URL: $REPO_URL"
    
    # 檢查是否已存在 remote
    if git remote | grep -q "^origin$"; then
        echo "⚠️  remote 'origin' 已存在，正在移除..."
        git remote remove origin
    fi
    
    git remote add origin "$REPO_URL"
    
    echo "✅ Remote 設定完成"
    echo ""
    
    read -p "是否要立即推送到 GitHub？(y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 推送到 GitHub..."
        echo ""
        
        # 重命名分支為 main
        git branch -M main
        
        # 推送
        if git push -u origin main; then
            echo ""
            echo "✅ 推送成功！"
            echo ""
            echo "🌐 你的 Repository: https://github.com/$github_username/lobster-admin"
            echo ""
            echo "📝 下一步："
            echo "   1. 訪問 GitHub repository 確認文件已上傳"
            echo "   2. 閱讀 DEPLOYMENT_VERCEL.md 部署到 Vercel"
            echo "   3. 在 Settings 中添加 Description 和 Topics"
            echo ""
        else
            echo ""
            echo "❌ 推送失敗"
            echo ""
            echo "可能原因："
            echo "   1. Repository 不存在（請先在 GitHub 創建）"
            echo "   2. 沒有推送權限"
            echo "   3. 需要身份驗證"
            echo ""
            echo "💡 手動推送指令："
            echo "   git push -u origin main"
            echo ""
        fi
    else
        echo ""
        echo "💡 手動推送指令："
        echo "   git branch -M main"
        echo "   git push -u origin main"
        echo ""
    fi
else
    echo ""
    echo "💡 手動設定 remote 並推送："
    echo "   git remote add origin https://github.com/YOUR_USERNAME/lobster-admin.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
fi

echo "📚 相關文檔："
echo "   - GITHUB_SETUP.md - GitHub 詳細設定指南"
echo "   - DEPLOYMENT_VERCEL.md - Vercel 部署指南"
echo "   - QUICK_START.md - 快速開始指南"
echo ""
