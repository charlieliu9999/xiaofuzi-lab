#!/usr/bin/env python3
import json
import os
from datetime import datetime
from zoneinfo import ZoneInfo


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def load_sources(path="data/sources.json"):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build_github_tutorial(data, dt):
    g = data.get("github", {})
    repo = g.get("repo", {})
    releases = g.get("releases", [])
    videos = data.get("videos", [])[:5]

    lines = []
    lines.append(f"# OpenClaw 使用教程系列 - {dt:%Y-%m-%d}")
    lines.append("")
    lines.append("## 今日资料速览")
    lines.append(f"- 仓库：{repo.get('full_name','N/A')} ({repo.get('html_url','')})")
    lines.append(f"- Star：{repo.get('stars','N/A')}  Fork：{repo.get('forks','N/A')}")
    lines.append(f"- 最近更新：{repo.get('updated_at','N/A')}")
    lines.append("")

    lines.append("## 教程主题建议（系列化）")
    lines.append("1. OpenClaw 安装与架构速通（本地、gateway、skills）")
    lines.append("2. OpenClaw 日常工作流（消息、自动化、会话管理）")
    lines.append("3. Skills 实战（安装、组合、排错）")
    lines.append("4. 自动化发布链路（GitHub + 小红书）")
    lines.append("")

    lines.append("## 今日版本/发布动态")
    if releases:
        for r in releases[:5]:
            lines.append(f"- {r.get('name','')} ({r.get('tag','')}) - {r.get('published_at','')} - {r.get('url','')}")
    else:
        lines.append("- 暂无可用发布信息")
    lines.append("")

    lines.append("## 今日视频素材")
    if videos:
        for v in videos:
            lines.append(f"- {v.get('title','')} | {v.get('author','')} | {v.get('link','')}")
    else:
        lines.append("- 暂无可用视频数据")
    lines.append("")

    lines.append("## 明日行动")
    lines.append("- 基于今天素材写 1 篇详细教程（1200-2000字）")
    lines.append("- 把同主题压缩成小红书版本（300-600字 + 结构化标签）")

    return "\n".join(lines)


def build_xhs_post(data, dt):
    repo = data.get("github", {}).get("repo", {})
    lines = []
    lines.append(f"# OpenClaw学习打卡 Day {dt:%d}")
    lines.append("")
    lines.append("今天整理了 OpenClaw 的入门与进阶路线，给想做自动化工作流的你一个最短路径：")
    lines.append("")
    lines.append("1）先跑通基础：安装 + gateway + skills")
    lines.append("2）再做实战：把重复任务做成自动化")
    lines.append("3）最后做发布：GitHub教程沉淀 + 小红书内容同步")
    lines.append("")
    lines.append(f"官方仓库：{repo.get('html_url','https://github.com/openclaw/openclaw')}")
    lines.append("官方文档：https://docs.openclaw.ai")
    lines.append("")
    lines.append("如果你愿意，我可以继续把“每天18:00自动更新教程”的模板开源出来。")
    lines.append("")
    lines.append("#OpenClaw #自动化工作流 #AI效率 #GitHub #小红书运营 #独立开发")
    return "\n".join(lines)


def main():
    tz = ZoneInfo("Asia/Shanghai")
    now = datetime.now(tz)

    data = load_sources()

    ensure_dir("output/github")
    ensure_dir("output/xhs")

    github_doc = build_github_tutorial(data, now)
    xhs_doc = build_xhs_post(data, now)

    github_path = f"output/github/{now:%Y-%m-%d}-openclaw-tutorial.md"
    xhs_path = f"output/xhs/{now:%Y-%m-%d}-xhs.md"

    with open(github_path, "w", encoding="utf-8") as f:
        f.write(github_doc)
    with open(xhs_path, "w", encoding="utf-8") as f:
        f.write(xhs_doc)

    print(f"wrote {github_path}")
    print(f"wrote {xhs_path}")


if __name__ == "__main__":
    main()
