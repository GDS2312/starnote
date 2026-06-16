#!/bin/bash
# 星记 StarNote 一键部署脚本
set -e

echo "✦ 星记 StarNote — 部署到 GitHub Pages"
echo ""

# 检查 gh CLI
if ! command -v gh &> /dev/null; then
    echo "⚠️  gh CLI 未安装，正在安装..."
    brew install gh
fi

# 登录
echo "📋 请在浏览器中完成 GitHub 登录..."
gh auth login --web --hostname github.com

# 创建仓库
echo "📦 创建 GitHub 仓库 starnote..."
gh repo create starnote --public --source=. --remote=origin --push 2>/dev/null || {
    echo "仓库可能已存在，尝试直接推送..."
    git remote add origin https://github.com/$(gh api user --jq '.login')/starnote.git 2>/dev/null || true
    git push -u origin main
}

echo ""
echo "✅ 部署完成！"
echo "🔗 访问地址: https://$(gh api user --jq '.login').github.io/starnote/"
echo ""
echo "⚠️  请到 GitHub 仓库 Settings → Pages → Source 选择 'GitHub Actions'"
