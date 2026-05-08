# 社交功能模块 (Social)

## 当前状态

此目录为社交功能的架构占位符。实际实现位于：

- `modules/companion-matching/` — 旅伴匹配、组队请求、信用评价

## 规划

STANDARD.md 规划的社交功能包括：
- 用户旅行标签管理
- 旅伴匹配算法（已实现于 companion-matching）
- 临时组队：拼车/拼餐/互助拍照
- 信用评价体系
- 安全守护：位置分享给紧急联系人

## 与 companion-matching 的关系

`companion-matching` 实现了社交匹配的核心功能（匹配工作流、组队CRUD）。
随着功能扩展，可将其重构为 `social/` 下的子模块，或将新功能直接添加到
`social/` 目录下通过标准 IPlugin 接口接入 Core。
