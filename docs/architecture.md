# Trailmate 架构文档

## 分层架构

```
platforms/web/        # 前端展示层 (Vue 3 + Vite + Tailwind)
       ↓
core/                 # 微内核层 (EventBus, StateManager, PluginManager, DI)
       ↓
modules/              # 业务插件层 (companion-matching, perception, trip-tools)
       ↓
adapters/             # 适配器层 (mock-adapter, supabase-adapter)
       ↓
shared/               # 公共工具库 (utils, types, workflow-engine)
```

## 核心原则

1. **零耦合通信**: 模块间仅通过 Core EventBus 通信，禁止直接导入其他模块内部实现
2. **类型共享**: 公共类型定义在 `shared/types/`，各模块通过该目录共享类型
3. **插件化**: 所有模块实现 `IPlugin` 接口，由 PluginManager 统一管理生命周期
4. **服务降级**: Mock adapter 以 fallback 模式注册，真实服务不可用时自动降级

## 数据流

```
用户操作 → Vue Component → useTrailmateCore composable
         → Core.service.call('service.name', ...args)
         → Adapter/Module handler → 返回结果
         → 发布 GlobalEvent → 其他模块的 EventBus 订阅者响应
```
