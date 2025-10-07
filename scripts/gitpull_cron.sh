#!/bin/bash
# --- Marketplace Auto Git Pull + Safe Restart (Self-Healing) ---
set -e
cd /volume1/web/marketplace

PATH=/usr/local/bin:/usr/bin:/bin:$PATH
LOG_DIR="/volume1/web/marketplace/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/gitpull_$(date +%F).log"

echo "=== 🕒 Marketplace Auto Git Pull $(date) ===" >> "$LOG_FILE"

# --- Concurrency lock --------------------------------------------------------
LOCKFILE="/tmp/marketplace_gitpull.lock"
if [ -f "$LOCKFILE" ]; then
  echo "[SKIP] Another GitPull process is already running." >> "$LOG_FILE"
  exit 0
fi
trap "rm -f $LOCKFILE" EXIT
touch "$LOCKFILE"

# --- 1️⃣ Detect running Node process ----------------------------------------
PID=$(sudo netstat -tulnp 2>/dev/null | grep 3101 | awk '{print $7}' | cut -d'/' -f1 | head -n1)
if [ -n "$PID" ]; then
  echo "[INFO] Marketplace running on port 3101 (PID: $PID). Stopping..." >> "$LOG_FILE"
  sudo kill -15 "$PID" || true
  sleep 3
fi

# --- 2️⃣ Run Git sync check -------------------------------------------------
/volume1/web/marketplace/scripts/refresh_git_sync.sh >> "$LOG_FILE" 2>&1

# --- 3️⃣ Pull updates -------------------------------------------------------
echo "[ACTION] Pulling latest changes from GitHub..." >> "$LOG_FILE"
git pull origin main >> "$LOG_FILE" 2>&1 || true

# --- 4️⃣ Detect & heal untracked-file conflicts -----------------------------
if grep -q "would be overwritten by merge" "$LOG_FILE"; then
  echo "[WARN] Merge conflict detected (untracked files)." >> "$LOG_FILE"
  BACKUP_DIR="/volume1/web/marketplace/logs/backup_conflicts_$(date +%F_%H%M%S)"
  mkdir -p "$BACKUP_DIR"
  echo "[ACTION] Backing up conflicting files to $BACKUP_DIR" >> "$LOG_FILE"
  grep "would be overwritten by merge" "$LOG_FILE" | awk '{print $NF}' | while read -r FILE; do
    [ -f "$FILE" ] && cp -v "$FILE" "$BACKUP_DIR/" >> "$LOG_FILE" 2>&1 || true
  done
  echo "[ACTION] Cleaning and resetting repository..." >> "$LOG_FILE"
  git clean -f >> "$LOG_FILE" 2>&1
  git reset --hard origin/main >> "$LOG_FILE" 2>&1
  echo "[OK] Repository reset and conflicts resolved." >> "$LOG_FILE"
fi

# --- 5️⃣ Dependency refresh (optional safe) ---------------------------------
if [ -f "package.json" ]; then
  echo "[ACTION] Checking dependencies..." >> "$LOG_FILE"
  npm install --omit=dev >> "$LOG_FILE" 2>&1 || true
  echo "[OK] Dependencies verified." >> "$LOG_FILE"
fi

# --- 6️⃣ Restart server -----------------------------------------------------
echo "[ACTION] Starting Marketplace server..." >> "$LOG_FILE"
nohup sudo node /volume1/web/marketplace/server.js >> "$LOG_DIR/server_autostart.log" 2>&1 &
echo "[OK] Server restarted at $(date)" >> "$LOG_FILE"

echo "[DONE] GitPull Cron completed at $(date)" >> "$LOG_FILE"
