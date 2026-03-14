#!/bin/zsh
set -euo pipefail

BASE="/Users/lizzysong/.openclaw/workspace/openclaw-tutorial-series"
REPO="/tmp/xiaofuzi-lab"
LOG="$BASE/output/daily-local.log"

mkdir -p "$BASE/output"

echo "===== $(date +'%F %T') START =====" >> "$LOG"

cd "$BASE"
python3 scripts/collect.py >> "$LOG" 2>&1
python3 scripts/generate.py >> "$LOG" 2>&1

mkdir -p /tmp
if [ ! -d "$REPO/.git" ]; then
  git clone https://github.com/charlieliu9999/xiaofuzi-lab.git "$REPO" >> "$LOG" 2>&1
fi

rsync -a --delete "$BASE/" "$REPO/openclaw-tutorial-series/" >> "$LOG" 2>&1
cd "$REPO"
git pull --rebase origin main >> "$LOG" 2>&1 || true
git add openclaw-tutorial-series
if ! git diff --cached --quiet; then
  git commit -m "chore: daily openclaw tutorial update" >> "$LOG" 2>&1 || true
  git push origin main >> "$LOG" 2>&1
fi

cd "$BASE"
python3 scripts/publish_xhs_playwright.py >> "$LOG" 2>&1 || true

echo "===== $(date +'%F %T') END =====" >> "$LOG"
