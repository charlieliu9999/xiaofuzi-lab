---
title: "任务总表（Task Board）"
date: 2026-03-11T17:15:00+08:00
draft: false
tags: ["OpenClaw", "任务管理", "Agent Team", "Ops"]
---

这份文件是当前工作的唯一任务总表。原则：
- 所有重要任务先登记，再执行。
- 所有研究任务必须最终沉淀为正式研究文件。
- 所有正式结论必须可追溯到来源、链接与摘要。

## 状态说明
- TODO：已确认，待开始
- DOING：进行中
- BLOCKED：被阻塞
- DONE：已完成

## 当前任务列表

### T001｜OpenClaw memory 最佳方案研究
- 类型：研究 / 架构
- 状态：DOING
- 负责人：Research Agent + Debug Agent + Publishing Agent
- 目标：确认当前环境最稳的 memory 方案，并形成正式研究文件发布到 GitHub
- 交付标准：必须包含 结论 / 论据 / 文件来源 / 链接 / 摘要
- 当前判断：倾向“Markdown 主记忆 + SQLite 辅助检索”，暂不把内建 memory 插件作为主链路
- 下一步：补齐来源、论据和正式研究稿

### T002｜agent-memory 结构化 recall/remember 报错排查
- 类型：排障 / 稳定性
- 状态：TODO
- 负责人：Debug Agent
- 目标：修复 recall 与 remember 的 sqlite 报错问题
- 已知现象：
  - recall 曾报 `sqlite3.OperationalError: no such column: lab`
  - remember 曾报 `sqlite3.IntegrityError: constraint failed`
- 下一步：检查表结构、SQL 拼接方式、唯一约束与去重逻辑

### T003｜Codex/OpenAI server_error 高频问题排查
- 类型：排障 / 上游依赖 / 运行稳定性
- 状态：TODO
- 负责人：Debug Agent + Research Agent
- 目标：判断高频 server_error 是否由上游波动、上下文过长、工具链过重或会话污染导致，并形成正式排查报告
- 交付标准：必须包含 结论 / 论据 / 文件来源 / 链接 / 摘要
- 下一步：收集报错样本、日志上下文、触发条件，并整理社区侧信息

### T004｜研究文件标准化模板
- 类型：流程 / 规范
- 状态：TODO
- 负责人：Memory Agent + Publishing Agent
- 目标：建立统一研究文件模板，后续所有研究任务必须按模板交付
- 强制字段：结论 / 论据 / 文件来源 / 链接 / 摘要
- 下一步：在仓库中新增模板文件并接入执行流程

### T005｜GitHub 研究成果发布工作流
- 类型：发布 / 沉淀
- 状态：DOING
- 负责人：Publishing Agent + Leader Agent
- 目标：将重要任务成果从聊天沉淀到 GitHub 仓库，形成长期可追溯记录
- 下一步：把 task board、team 规则、研究模板先落仓库；随后发布 T001 / T003 的正式文件


### T006｜Agent Team 构建与运行设计落地
- 类型：架构 / 组织 / 工作流
- 状态：DOING
- 负责人：Leader Agent + Memory Agent + Publishing Agent
- 目标：把“团队型 agent”从概念说明升级为可执行设计，明确角色、任务分发、状态流转、验收机制与后续扩展方式
- 交付标准：形成正式设计文件，可作为后续 agent 构建与协作的操作基线
- 下一步：新增《agent-team-design-v1》设计文件，并把本任务纳入任务板长期跟踪

## 执行规则
1. 新任务进入系统时，必须先登记到本任务总表。
2. 研究类任务必须先有任务卡，再开始搜集资料。
3. 完成的正式结论必须至少同步到：
   - 本仓库正式文件
   - 工作区记忆文件（MEMORY.md 或 daily memory）
4. Leader Agent 负责验收；未经验收的草稿不视为完成。
