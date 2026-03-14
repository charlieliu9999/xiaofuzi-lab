# OpenClaw 教程自动化发布标准流程（SOP）

版本：v1.0
更新时间：2026-03-14
适用范围：OpenClaw 教程系列（GitHub + 小红书）

## 1. 目标
每天 18:00 自动完成以下闭环：
1) 采集 OpenClaw 相关资料（文档、仓库动态、视频）
2) 生成教程内容（GitHub 长文版 + 小红书版）
3) 推送到 GitHub 仓库
4) 发布到小红书创作平台
5) 记录执行日志与异常

## 2. 输入与输出
输入：
- GitHub API（openclaw/openclaw）
- docs.openclaw.ai
- YouTube RSS（关键词 openclaw）

输出：
- data/sources.json
- output/github/YYYY-MM-DD-openclaw-tutorial.md
- output/xhs/YYYY-MM-DD-xhs.md
- GitHub 仓库更新提交
- 小红书已发布笔记（或草稿/异常日志）

## 3. 执行流程
Step 1：采集
- 执行 scripts/collect.py
- 校验 data/sources.json 非空且含 github/docs/videos 三类字段（允许单源失败但需记录）

Step 2：生成
- 执行 scripts/generate.py
- 校验 output/github 与 output/xhs 当天文件已生成

Step 3：质量门禁（必须通过）
- 按 docs/CONTENT_QUALITY_GATE.zh-CN.md 进行检查
- 未通过则禁止发布，只允许保存草稿并标记 fail

Step 4：GitHub 推送
- 同步至仓库目录
- commit + push
- 校验远端 HEAD 是否可见、目标文件是否可访问

Step 5：小红书发布
- 使用登录态进入创作平台
- 自动填充标题与正文
- 发布前再次执行平台适配检查（字数、敏感词、可读性）
- 执行发布并记录发布结果

Step 6：归档
- 记录 output/daily-local.log
- 失败项写入错误日志并给出可恢复动作

## 4. 失败处理策略
1) 数据源失败：允许部分降级，但必须在文稿中标注“数据不完整”
2) Git push 失败：自动重试 1 次；仍失败则告警并保留本地提交
3) 小红书发布失败：降级为“存草稿 + 人工确认发布”
4) 选择器变化：停止自动点击发布，转人工确认，避免误发

## 5. 验收标准（Definition of Done）
同时满足以下条件才算当天完成：
- GitHub 仓库出现当天内容提交
- 小红书出现当天已发布笔记（或明确记录为人工待发）
- 日志无 critical 级错误
- 内容质量评分 >= 85/100

## 6. 运营节奏
- 每日 18:00：自动执行主流程
- 每周复盘：检查题材重复率、互动数据、标题点击率
- 每月优化：更新模板、关键词、选题结构、发布策略
