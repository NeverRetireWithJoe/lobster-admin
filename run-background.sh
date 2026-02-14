#!/bin/bash

# 小龍蝦管理系統 - 後台啟動腳本

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PID_FILE="$SCRIPT_DIR/server.pid"
LOG_FILE="$SCRIPT_DIR/server.log"

case "$1" in
  start)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if ps -p $PID > /dev/null 2>&1; then
        echo "🦞 服務已在運行中 (PID: $PID)"
        exit 0
      else
        rm -f "$PID_FILE"
      fi
    fi
    
    echo "🚀 啟動小龍蝦管理系統..."
    cd "$SCRIPT_DIR/backend"
    nohup node server.js > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    sleep 2
    
    if ps -p $(cat "$PID_FILE") > /dev/null 2>&1; then
      echo "✅ 服務啟動成功！"
      echo "🌐 訪問: http://localhost:8080"
      echo "📋 日誌: $LOG_FILE"
      echo "🔢 PID: $(cat $PID_FILE)"
    else
      echo "❌ 服務啟動失敗，請查看日誌: $LOG_FILE"
      exit 1
    fi
    ;;
    
  stop)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      echo "🛑 停止服務 (PID: $PID)..."
      kill $PID
      rm -f "$PID_FILE"
      echo "✅ 服務已停止"
    else
      echo "⚠️ 服務未運行"
    fi
    ;;
    
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
    
  status)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if ps -p $PID > /dev/null 2>&1; then
        echo "🟢 服務運行中 (PID: $PID)"
        echo "🌐 訪問: http://localhost:8080"
      else
        echo "🔴 服務已停止（但 PID 文件存在）"
        rm -f "$PID_FILE"
      fi
    else
      echo "🔴 服務未運行"
    fi
    ;;
    
  logs)
    if [ -f "$LOG_FILE" ]; then
      tail -f "$LOG_FILE"
    else
      echo "⚠️ 日誌文件不存在"
    fi
    ;;
    
  *)
    echo "使用方法: $0 {start|stop|restart|status|logs}"
    echo ""
    echo "指令說明:"
    echo "  start   - 啟動服務"
    echo "  stop    - 停止服務"
    echo "  restart - 重啟服務"
    echo "  status  - 檢查狀態"
    echo "  logs    - 查看日誌"
    exit 1
    ;;
esac

exit 0
