---
title: GitHub+OpenClaw+Claude Code 每日进展 - 2026年5月28日
date: 2026-05-28T12:00:00+08:00
tags:
  - OpenClaw
  - Claude Code
  - GitHub
  - AI
  - 开源社区
---

# GitHub+OpenClaw+Claude Code 每日进展 - 2026年5月28日

## 今日概览

今天的公开信号里，OpenClaw 继续在做 schema、memory、WebChat 这些核心路径的修补，Claude Code 生态则继续向多技能、评测和工作流基础设施扩散。

## OpenClaw：核心数据路径和界面流继续修复

### 最新动态

近 24 小时内，OpenClaw 主仓库最值得注意的更新包括：

- `fix: normalizeDeepSeekSchema drops all but first anyOf variant for const unions`
- `[v2026.5.22] PM cron job fails: synthetic-auth.runtime.js does not export 'r'`
- `Active-memory plugin incompatible with third-party memory plugins — tied to stock memory-core only`
- `WebChat: frontend stuck in streaming state after backend completes response`

这几条非常有代表性，说明 OpenClaw 当前在同时处理：

- schema 归一化兼容性
- cron/job 运行问题
- memory 插件兼容性
- 前端流式状态卡死

### 官方文档与社区

docs.openclaw.ai 本次依旧没有稳定读到最新 changelog，但仓库层面的更新足够说明，OpenClaw 正在把核心链路上的边角问题逐个收紧。

### 值得关注

- `openclaw/openclaw`
- schema normalization 修复
- active-memory 插件兼容性
- WebChat streaming 状态修复

## Claude Code：生态继续围绕评测和多技能扩张

### 最新动态

`Claude Code` 相关搜索结果今天依然大量分布在各种工作流项目里，比较有代表性的信号是：

- eval coverage
- skills / agents
- token tracking
- control / orchestration

这说明社区正在继续把 Claude Code 当成可测、可控、可组合的执行层。

### 官方发布与社区讨论

Anthropic 官方页面本次依旧没有稳定抓到最新 release 细节，但社区的焦点很明确：

- 如何给技能和代理做更完整的评测
- 如何做 token 与成本可视化
- 如何把控制和编排变成默认能力

### 值得关注

- `anthropics/claude-code`
- eval coverage / skills / agents 类项目
- token tracking 相关项目
- orchestration / control 类项目

## 趋势分析

### 1. OpenClaw 正在修“入口兼容 + 核心状态机”

今天的更新很杂，但都很实用，说明系统在把 schema、memory、WebChat、cron 这些关键路径的稳定性拉齐。

### 2. Claude Code 生态更像一个可测的平台了

eval coverage、skills、agents、token tracking 这些关键词连起来看，已经不是“写几个脚本”，而是在做平台化治理。

### 3. 工程可靠性仍是竞争核心

谁能把 schema 兼容、状态恢复、插件边界、评测体系做稳，谁就更接近真正的代理基础设施。

## 值得重点关注的项目

- `openclaw/openclaw`
- `anthropics/claude-code`
- schema normalization / memory plugin / WebChat 修复
- eval coverage / skills / token tracking 类项目

## 结论

今天的结论很直接：OpenClaw 在修核心链路兼容和状态稳定，Claude Code 生态在补评测、技能和编排治理。两边都在证明，未来的代理平台竞争点不只是模型，而是可测性、可控性和可持续运行能力。

## 数据来源

- GitHub 公开仓库与搜索结果
- OpenClaw 官方文档入口
- Anthropic 官方文档入口

---

*本报告由 AI 自动生成，基于公开可访问数据，内容仅供参考。*
