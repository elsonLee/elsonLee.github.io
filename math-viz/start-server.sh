#!/bin/bash
# 统计数学定理可视化模拟 - 本地开发服务器启动脚本

echo "==================================="
echo "  统计数学定理可视化模拟"
echo "  Local Development Server"
echo "==================================="
echo ""

# 检测 Python 版本
if command -v python3 &> /dev/null; then
    echo "🚀 使用 Python 3 启动服务器..."
    echo "📍 访问地址: http://localhost:8000"
    echo "⏹️  停止服务器: 按 Ctrl+C"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "🚀 使用 Python 2 启动服务器..."
    echo "📍 访问地址: http://localhost:8000"
    echo "⏹️  停止服务器: 按 Ctrl+C"
    echo ""
    python -m SimpleHTTPServer 8000
elif command -v npx &> /dev/null; then
    echo "🚀 使用 http-server 启动服务器..."
    echo "📍 访问地址: http://localhost:8080"
    echo "⏹️  停止服务器: 按 Ctrl+C"
    echo ""
    npx http-server -p 8080
else
    echo "❌ 错误: 未找到 Python 或 Node.js"
    echo ""
    echo "请安装以下工具之一:"
    echo "  - Python 3: https://www.python.org/downloads/"
    echo "  - Node.js: https://nodejs.org/"
    echo ""
    echo "或者使用 VS Code 的 Live Server 扩展"
    exit 1
fi
