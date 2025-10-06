#!/bin/bash
# --- Marketplace Git Sync Check ---
set -e
cd /volume1/web/marketplace

echo "=== 🔁 Marketplace Git Sync Check ==="
date
echo

# 1️⃣ Fetch & prune
git fetch --prune origin >/dev/null 2>&1

# 2️⃣ Show local vs remote difference
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "✅ Up to date with origin/main"
elif [ "$LOCAL" = "$BASE" ]; then
  echo "⬇️  Local behind remote — run update_marketplace.sh"
elif [ "$REMOTE" = "$BASE" ]; then
  echo "⬆️  Local ahead of remote — local commits not pushed"
else
  echo "⚠️  Diverged — manual check needed!"
fi

echo
git status -s
