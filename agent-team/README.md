# Agent Team

这是小福子的团队型 agent 工作目录。

## 目标
把不同类型任务交给不同专长角色处理，由 Leader Agent 统一调度、验收和对外汇报。

## 角色
- leader
- research
- debug
- memory
- publishing

## 运行方式
当前阶段采用“角色化执行”：
- 每个角色有独立职责文件
- Leader 根据任务类型分配工作
- 输出统一回收到任务板与仓库文件

后续如果支持独立子 agent，再把这些角色升级为独立运行单元。
