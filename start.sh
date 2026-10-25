#!/usr/bin/env bash
set -e

# IMLabStorageApp Startup Script
# 杉本研究室 備品管理システム 起動スクリプト

export PATH="$HOME/.nvm/versions/node/v24.22.1/bin:$PATH"
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo " 杉本研究室 備品管理システム (IMLabStorageApp)"
echo "=========================================="

# Check backend venv
if [ ! -f "$WORKSPACE_DIR/backend/.venv/bin/python" ]; then
    echo "⚠️ Python仮想環境が見つかりません。作成しています..."
    python3 -m venv "$WORKSPACE_DIR/backend/.venv"
    "$WORKSPACE_DIR/backend/.venv/bin/pip" install -r "$WORKSPACE_DIR/backend/requirements.txt"
fi

# Function to stop child processes on EXIT
cleanup() {
    echo ""
    echo "🛑 サーバーを終了しています..."
    kill $(jobs -p) 2>/dev/null || true
    wait 2>/dev/null || true
    echo "完了しました。"
}
trap cleanup SIGINT SIGTERM EXIT

# Start Backend
echo "🚀 バックエンド(FastAPI)を起動中... (http://localhost:8000)"
cd "$WORKSPACE_DIR/backend"
PYTHONPATH=. "$WORKSPACE_DIR/backend/.venv/bin/python" run.py &
BACKEND_PID=$!

# Wait briefly for backend
sleep 1.5

# Start Frontend
echo "💻 フロントエンド(React + Vite)を起動中... (http://localhost:5173)"
cd "$WORKSPACE_DIR/frontend"
npm run dev -- --host &
FRONTEND_PID=$!

echo ""
echo "✨ 杉本研究室 備品管理システム が起動しました！"
echo "👉 ブラウザで開く: http://localhost:5173"
echo "👉 API仕様書(Swagger): http://localhost:8000/docs"
echo "終了するには Ctrl + C を押してください。"
echo "=========================================="

wait

