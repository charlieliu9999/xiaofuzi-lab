---
title: "OpenClaw Memory 方案研究（v2）：稳定优先的双层架构"
date: 2026-03-12T00:52:00+08:00
draft: false
tags: ["OpenClaw", "memory", "architecture", "research"]
---

## 结论

当前环境下最稳的 OpenClaw memory 方案，推荐采用“工作区 Markdown 主记忆 + agents.defaults.memorySearch 作为可选检索层 + 内建 memory 插件不作为主链路强依赖”的双层方案。具体落地是：把长期事实、规则、偏好写入 `MEMORY.md`，把每日过程性上下文写入 `memory/YYYY-MM-DD.md`，必要时再启用 `agents.defaults.memorySearch` 对这些 Markdown 文件做语义检索；不推荐把 `plugins.slots.memory` 下的长期记忆插件或自动 recall/capture 能力当成当前环境的主链路。

可行方案三选一：
1. 方案 A：纯 Markdown memory：`MEMORY.md` + `memory/YYYY-MM-DD.md`
2. 方案 B：Markdown 主记忆 + `agents.defaults.memorySearch` 辅助检索（推荐）
3. 方案 C：memory 插件主导（`plugins.slots.memory` 指向 `memory-core` 或 `memory-lancedb`，叠加自动 recall/capture）

最终推荐：方案 B。
不推荐主推方案 C 的原因：当前环境已有“内建 memory 插件/结构化记忆链路不完全匹配、强开易异常”的实际证据，稳定性优先级高于自动化程度。

## 论据

### 论据 1
- 观察：OpenClaw 官方文档明确把工作区视为长期记忆载体，核心文件就是 `MEMORY.md` 与 `memory/YYYY-MM-DD.md`。
- 含义：文件型记忆是第一层、默认层、最稳定载体。
- 支持结论：主链路应以 Markdown 为核心。

### 论据 2
- 观察：语义检索正式配置位于 `agents.defaults.memorySearch`，检索对象默认就是 `MEMORY.md` + `memory/**/*.md`；且有顶层 `memorySearch` 自动迁移逻辑。
- 含义：稳态实现是“文件存储 + 独立检索配置”。
- 支持结论：应以 Markdown 为主，memorySearch 为增强。

### 论据 3
- 观察：`plugins.slots.memory` 可配置并可关闭（`none`）；本地运行经验表明当前环境强开插件主链路有稳定性风险。
- 含义：插件是增强层，不是不可替代底座。
- 支持结论：应选择可回退的保守架构。

### 论据 4
- 观察：subagent 默认只注入 `AGENTS.md` + `TOOLS.md`，主会话与子代理上下文边界不同。
- 含义：强依赖插件 recall/capture 会增加多代理场景复杂度。
- 支持结论：文件型主记忆更符合边界治理。

### 论据 5
- 观察：官方建议将工作区作为 memory 并纳入版本管理。
- 含义：文件型记忆具备可审计、可追溯、可 diff 优势。
- 支持结论：与“研究发布到 GitHub”链路天然兼容。

## 文件来源

- `/Users/lizzysong/.openclaw/workspace/xiaofuzi-lab/content/ops/task-board.md`
- `/Users/lizzysong/.openclaw/workspace/xiaofuzi-lab/content/templates/research-template.md`
- `/Users/lizzysong/.openclaw/workspace/MEMORY.md`
- `/Users/lizzysong/.openclaw/workspace/memory/2026-03-11.md`
- `/usr/local/lib/node_modules/openclaw/docs/start/openclaw.md`
- `/usr/local/lib/node_modules/openclaw/docs/concepts/memory.md`
- `/usr/local/lib/node_modules/openclaw/docs/concepts/agent-workspace.md`
- `/usr/local/lib/node_modules/openclaw/docs/tools/plugin.md`
- `/usr/local/lib/node_modules/openclaw/docs/tools/subagents.md`
- `/usr/local/lib/node_modules/openclaw/docs/cli/memory.md`
- `/usr/local/lib/node_modules/openclaw/dist/daemon-cli.js`

## 链接

- https://docs.openclaw.ai
- https://docs.openclaw.ai/start/openclaw
- https://docs.openclaw.ai/concepts/memory
- https://docs.openclaw.ai/concepts/agent-workspace
- https://docs.openclaw.ai/tools/plugin
- https://docs.openclaw.ai/tools/subagents
- https://docs.openclaw.ai/cli/memory
- https://github.com/openclaw/openclaw

## 摘要

本次研究结论是：当前环境最稳的 OpenClaw memory 方案，不是把内建 memory 插件当主链路，而是采用“Markdown 主记忆 + 可选 memorySearch 辅助检索”的双层架构。官方文档已把 `MEMORY.md` 与 `memory/YYYY-MM-DD.md` 定义为标准记忆载体，源码则确认 `agents.defaults.memorySearch` 是当前正式检索配置位。结合本地运行记录，插件主导方案在当前环境稳定性不足，不适合作为默认主路径。综合稳定性、可追溯性、可维护性与 GitHub 发布链路适配性，推荐方案 B。
