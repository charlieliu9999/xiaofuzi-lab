#!/usr/bin/env python3
import argparse
import glob
import os
import re
from pathlib import Path


def load_latest_xhs_file(xhs_dir: str) -> Path:
    files = sorted(glob.glob(os.path.join(xhs_dir, "*.md")))
    if not files:
        raise FileNotFoundError(f"No xhs markdown found in {xhs_dir}")
    return Path(files[-1])


def split_title_body(text: str):
    lines = [l.rstrip() for l in text.splitlines()]
    title = ""
    body_lines = []
    for i, line in enumerate(lines):
        if line.strip().startswith("# ") and not title:
            title = line.strip()[2:].strip()
            body_lines = lines[i + 1 :]
            break
    if not title:
        title = "OpenClaw 使用打卡"
        body_lines = lines
    body = "\n".join(body_lines).strip()
    body = re.sub(r"\n{3,}", "\n\n", body)
    return title[:20], body[:1000]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--xhs-dir", default="output/xhs")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    file = load_latest_xhs_file(args.xhs_dir)
    text = file.read_text(encoding="utf-8")
    title, body = split_title_body(text)

    if args.dry_run:
        print("[DRY RUN] title:", title)
        print("[DRY RUN] body preview:", body[:120])
        return

    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch_persistent_context(
            user_data_dir=str(Path.home() / ".openclaw" / "browser" / "openclaw" / "user-data"),
            headless=False,
        )
        page = browser.new_page()
        page.goto("https://creator.xiaohongshu.com/publish/publish?source=official", wait_until="domcontentloaded")

        # not logged in
        if page.locator("input[placeholder='手机号']").count() > 0 or page.locator("text=短信登录").count() > 0:
            print("Login required. Please log in manually in opened browser, then rerun.")
            browser.close()
            return

        if page.locator("text=写长文").count() > 0:
            page.locator("text=写长文").first.click()
        if page.locator("text=新的创作").count() > 0:
            page.locator("text=新的创作").first.click()

        try:
            title_input = page.locator("input[placeholder*='标题'], textarea").first
            if title_input.count() > 0:
                title_input.click()
                title_input.fill(title)
        except Exception:
            pass

        try:
            editor = page.locator("[contenteditable='true']").last
            if editor.count() > 0:
                editor.click()
                page.keyboard.type(body, delay=8)
        except Exception:
            pass

        try:
            if page.locator("text=一键排版").count() > 0:
                page.locator("text=一键排版").first.click()
        except Exception:
            pass

        publish_btn = page.locator("button:has-text('发布')").first
        if publish_btn.count() > 0:
            publish_btn.click()
            print("Publish clicked.")
        else:
            print("Could not find publish button. Please publish manually in current page.")

        browser.close()


if __name__ == "__main__":
    main()
