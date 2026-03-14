# OpenClaw 使用教程自动化生产线

目标：每天 18:00（Asia/Shanghai）自动收集 OpenClaw 相关资料（文档、仓库动态、视频），生成：
1. GitHub 教程系列草稿（Markdown）
2. 小红书版本文案草稿（Markdown）

## 当前自动化范围
- GitHub 仓库信息：openclaw/openclaw
- OpenClaw 官方文档入口
- YouTube 搜索 RSS（openclaw 关键词）

## 目录结构
- `scripts/collect.py`：抓取资料
- `scripts/generate.py`：生成教程稿 + 小红书稿
- `data/sources.json`：原始抓取数据
- `output/github/`：GitHub 教程稿
- `output/xhs/`：小红书稿
- `.github/workflows/daily.yml`：每天定时执行

## 本地运行
```bash
cd openclaw-tutorial-series
python3 scripts/collect.py
python3 scripts/generate.py
```

## GitHub Actions 定时
已配置 cron：`0 10 * * *`（UTC），等于北京时间 18:00。

## 小红书同步发布
当前先生成小红书文案草稿到 `output/xhs/`。
你可以：
- 手动发布，或
- 结合 OpenClaw `xiaohongshu-publish` skill 做浏览器自动发布。
