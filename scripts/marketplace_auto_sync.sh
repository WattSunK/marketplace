#!/bin/bash
# ================================================================
# 🌐 Tenant–Landlord Marketplace – Auto Git Sync + Dependency Check + Restart
# ------------------------------------------------
# Combines:
#   • refresh_git_sync.sh  → Git status & diff
#   • gitpull_cron.sh      → Safe pull + restart
#   • check_deps.sh        → Auto dependency installer
# ================================================================

set -e
cd /volume1/web/marketplace
PATH=/usr/local/bin:/usr/bin:/bin:$PATH

# --- Directories & Logs ------------------------------------------------------
LOG_DIR="/volume1/web/marketplace/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/marketplace_autosync_$(date +%F).log"
LOCKFILE="/tmp/marketplace_autosync.lock"

echo "=== 🕒 Marketplace Auto-Sync $(date) ===" >> "$LOG_FILE"

# --- Prevent overlapping runs -----------------------------------------------
if [ -f "$LOCKFILE" ]; then
  echo "[SKIP] Another Auto-Sync process already running." >> "$LOG_FILE"
  exit 0
fi
trap "rm -f $LOCKFILE" EXIT
touch "$LOCKFILE"

# --- 1️⃣ Git sync check ------------------------------------------------------
echo "[INFO] Checking repo sync status..." >> "$LOG_FILE"
git fetch --prune origin >>"$LOG_FILE" 2>&1

LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "[OK] Up to date with origin/main" >> "$LOG_FILE"
elif [ "$LOCAL" = "$BASE" ]; then
  echo "[ACTION] Local behind remote — pulling latest..." >> "$LOG_FILE"
  git pull --rebase >>"$LOG_FILE" 2>&1 || true
elif [ "$REMOTE" = "$BASE" ]; then
  echo "[INFO] Local ahead of remote (un-pushed commits)" >> "$LOG_FILE"
else
  echo "[WARN] Diverged — performing clean reset to origin/main" >> "$LOG_FILE"
  git fetch origin main >>"$LOG_FILE" 2>&1
  git reset --hard origin/main >>"$LOG_FILE" 2>&1
fi

# --- 2️⃣ Dependency auto-check -----------------------------------------------
echo "[INFO] Checking dependencies..." >> "$LOG_FILE"
DEPS=(
  express
  express-session
  connect-sqlite3
  better-sqlite3
  sqlite3
  sqlite
  dotenv
  joi
  jsonwebtoken
  bcryptjs
)
for pkg in "${DEPS[@]}"; do
  if ! npm list "$pkg" >/dev/null 2>&1; then
    echo "[INSTALL] Missing package: $pkg" >> "$LOG_FILE"
    sudo npm install "$pkg" --no-audit --no-fund --loglevel=error >>"$LOG_FILE" 2>&1 || true
  fi
done
echo "[OK] All dependencies verified." >> "$LOG_FILE"

# --- 3️⃣ Stop old process if running -----------------------------------------
PID=$(sudo netstat -tulnp 2>/dev/null | grep 3101 | awk '{print $7}' | cut -d'/' -f1 | head -n1)
if [ -n "$PID" ]; then
  echo "[ACTION] Stopping running process on port 3101 (PID $PID)" >> "$LOG_FILE"
  sudo kill -15 "$PID" || true
  sleep 3
fi

# --- 4️⃣ Rebuild native modules ----------------------------------------------
echo "[INFO] Rebuilding native bindings..." >> "$LOG_FILE"
sudo npm rebuild better-sqlite3 sqlite3 >>"$LOG_FILE" 2>&1 || true
echo "[OK] Native rebuild complete." >> "$LOG_FILE"

# --- 5️⃣ Restart the API -----------------------------------------------------
echo "[ACTION] Starting Marketplace server..." >> "$LOG_FILE"
nohup sudo node /volume1/web/marketplace/server.js >>"$LOG_DIR/server_autostart.log" 2>&1 &
echo "[OK] Server restarted at $(date)" >> "$LOG_FILE"

echo "[DONE] Auto-Sync completed successfully $(date)" >> "$LOG_FILE"
