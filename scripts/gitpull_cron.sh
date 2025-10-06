#!/bin/bash
# --- Marketplace Auto Git Pull + Safe Restart (Hardened) ---
set -e
cd /volume1/web/marketplace

LOG_DIR="/volume1/web/marketplace/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/gitpull_$(date +%F).log"

echo "=== 🕒 Marketplace Auto Git Pull $(date) ===" >> "$LOG_FILE"

# --- Concurrency lock ---
LOCKFILE="/tmp/marketplace_gitpull.lock"
if [ -f "$LOCKFILE" ]; then
  echo "[SKIP] Another GitPull process is already running." >> "$LOG_FILE"
  exit 0
fi
trap "rm -f $LOCKFILE" EXIT
touch "$LOCKFILE"

# --- 1️⃣ Detect running Node process (port 3101) ---
PID=$(sudo netstat -tulnp 2>/dev/null | grep 3101 | awk '{print $7}' | cut -d'/' -f1 | head -n1)

if [ -n "$PID" ]; then
  echo "[INFO] Marketplace running on port 3101 (PID: $PID). Stopping..." >> "$LOG_FILE"
  sudo kill -15 "$PID" || true
  sleep 3
fi

# --- 2️⃣ Run Git sync check ---
/volume1/web/marketplace/scripts/refresh_git_sync.sh >> "$LOG_FILE" 2>&1

# --- 3️⃣ Pull updates if behind ---
if grep -q "⬇️" "$LOG_FILE"; then
  echo "[ACTION] Pulling latest changes from GitHub..." >> "$LOG_FILE"
  git pull origin main >> "$LOG_FILE" 2>&1
  echo "[OK] Repository updated." >> "$LOG_FILE"
else
  echo "[OK] Repository already up to date." >> "$LOG_FILE"
fi

# --- 4️⃣ Restart the server ---
echo "[ACTION] Starting Marketplace server..." >> "$LOG_FILE"
nohup sudo node /volume1/web/marketplace/server.js >> "$LOG_DIR/server_autostart.log" 2>&1 &
echo "[OK] Server restarted at $(date)" >> "$LOG_FILE"

echo "[DONE] GitPull Cron completed at $(date)" >> "$LOG_FILE"
