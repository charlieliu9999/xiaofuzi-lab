---
title: "Agent Team 构建方案（v1）"
date: 2026-03-11T19:55:00+08:00
draft: false
tags: ["OpenClaw", "Agent Team", "Build", "Ops"]
---

这份文件标志着 Agent Team 从“设计”进入“构建”阶段。目标是把团队角色落实为一组实际可用的角色目录、职责文件、任务输入输出规范与运行约定。

## 本次构建范围
1. 建立团队目录结构
2. 为 5 个角色分别建立角色说明文件
3. 定义统一输入输出规范
4. 定义 Leader 调度规则
5. 让后续任务可以直接按角色落地

## 目录结构

```text
agent-team/
  leader/
    ROLE.md
  research/
    ROLE.md
  debug/
    ROLE.md
  memory/
    ROLE.md
  publishing/
    ROLE.md
  README.md
```

## 角色清单
- Leader Agent：统筹、拆解、验收、汇报
- Research Agent：研究、搜集论据、方案比较
- Debug Agent：排障、复现、根因分析
- Memory Agent：任务板、记忆、归档、一致性
- Publishing Agent：排版、仓库沉淀、发布

## 输入输出规范
### 统一输入
- 任务编号
- 任务名称
- 目标
- 完成标准
- 当前上下文
- 约束条件

### 统一输出
- 已完成事项
- 发现的问题
- 产出文件
- 是否达到完成标准
- 建议下一步

## Leader 调度规则
1. 新任务必须先进入任务板
2. 必须明确主责角色
3. 跨领域任务拆成子任务再分配
4. 子角色结果统一回收给 Leader
5. 未通过验收不得标记 DONE

## 当前结论
Agent Team 已从“概念设计”推进到“文件级构建”。后续如果运行环境允许，可将这些角色升级为独立 session / 子 agent；在此之前，先按角色化执行方式工作。
