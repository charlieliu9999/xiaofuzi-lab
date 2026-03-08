---
title: "Session Log — 2026-03-07: Skills, MCP, and Xiaohongshu Topic Research"
date: 2026-03-07T23:30:00+08:00
draft: false
tags: ["openclaw", "xiaohongshu", "medical-imaging", "research", "mcp"]
---

This post is a working log of what we planned and what we actually finished during the 2026-03-07 session.

## Goals (what we said we would do)

1. **Create a GitHub repo and build a personal blog**
   - Publish the research articles as a website.
2. **Open a Xiaohongshu account and distribute content to social media**
   - Repurpose website articles into Xiaohongshu posts (and later: Toutiao / X).
3. **Run a first “Xiaohongshu topic research” workflow**
   - Focus area: *OpenClaw / AI research*, *medical imaging*, and *AI applications in medical imaging*.

## What we completed

### 1) Skill discovery + installation

We searched for “YouTube / Xiaohongshu / Toutiao / X(Twitter) / self-media” related skills, and installed the following into the workspace `./skills/`:

- `xiaohongshu-deep-research`
- `xiaohongshu-publish`
- `xhs-content-creator`
- `toutiao-news-trends`
- `toutiao-publish`
- `x-post-automation` *(flagged as suspicious; we reviewed the skill description and then installed it with force)*

### 2) MCP (xiaohongshu-mcp) setup

To enable automated search / data collection for research, we installed and started the Xiaohongshu MCP service:

- Downloaded and extracted the macOS (amd64) binaries for `xpzouying/xiaohongshu-mcp`.
- Completed first-time login via QR scan.
- Started the local server on `http://127.0.0.1:18060`.

This is required by `xiaohongshu-deep-research`.

### 3) Xiaohongshu topic research runs (data collected)

We ran multiple keyword expansions and searches, de-duplicated results, ranked by a simple engagement score (likes + 2×collects + comments), and saved raw data.

Research output folders were written to:

- `~/xiaohongshu-research/医学影像AI_20260307_2147/` (173 deduped posts)
- `~/xiaohongshu-research/OpenClaw_医学影像_20260307_2203/` (191 deduped posts)

High-level findings:

- **Medical imaging** content that performs well is usually:
  - “easy-to-understand” imaging basics (CT/MRI/X-ray, low-dose CT),
  - career/education topics (radiology major, job anxiety),
  - and “industry trend” summaries.
- **OpenClaw** content performs well on “installation / deployment / practical use-cases / workflow demonstrations”.
- The intersection **OpenClaw × medical imaging** appears under-supplied on Xiaohongshu, which suggests a strong opportunity for differentiated, deeper research content.

## What was not finished yet (next actions)

1. **Publish the first deep research article**
   - We agreed to produce a deliverable with:
     - Top 20 benchmark posts (with links),
     - content gap map,
     - a clear account positioning,
     - a 6-episode series outline,
     - and a publish-ready long-form article.
2. **Blog repo + website publishing pipeline**
   - This was planned but the actual repo + Pages deployment was completed on the following day (2026-03-08).
3. **Xiaohongshu account + distribution workflow**
   - Account setup requires manual steps; once ready we will convert website posts to Xiaohongshu-native drafts and publish.

## Definition of Done (for the next session)

- One “deep research” post is live on the website.
- A matching Xiaohongshu version (title A/B,正文, hashtags) is ready, and publishable with one click after final human approval.

