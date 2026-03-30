# 伴旅（Trailmate）智能旅行应用开发文档
## 📋 项目概述
### 项目定位
伴旅是一款智能旅行应用，系统性解决旅行者三大核心痛点：
1. 行程规划耗时耗力
2. 旅途不确定性困扰
3. 结伴出行难以找到合适伙伴

### 开发周期规划（三个月）
| 阶段 | 时间 | 核心目标 | 完成状态 |
|------|------|----------|---------|
| 第一月 | 第1-4周 | 完成智能规划引擎模块开发，支持自然语言输入生成多套行程方案 | ✅ 已完成 |
| 第二月 | 第5-8周 | 完成情境感知服务模块开发，实现行程时间线与主动提示功能 | ⏳ 进行中 |
| 第三月 | 第9-12周 | 完成社交匹配系统模块开发，实现旅伴匹配、临时组队、信用评价功能 | 📅 未开始 |

### 当前版本进度（v1.0.1）
- ✅ 已完成微内核Core层核心功能开发
- ✅ 已完成行程规划引擎模块开发
- ✅ 已完善完整的项目目录结构（所有模块目录已创建）
- ✅ 已修复代码类型安全问题，替换所有不合理的`any`类型
- ✅ 已完成项目规范文档制定
- ✅ **已完成Web端核心页面开发（首页/仪表盘/行程规划/设置）**
- ✅ **已完成MiniMax AI大模型接入，支持智能对话**
- ✅ **已完成多轮对话上下文记忆功能**
- ✅ **已完成对话历史记录侧边栏（支持保存/加载/清空）**
- ✅ **已完成用户偏好设置全局同步到AI提示词**
- 🔄 正在进行AI对话交互优化（地点点击详情/行程卡片操作）

### 演示版约束
- 优先保障交互流程完整性，后端逻辑和第三方接口使用模拟实现
- 仅开发Web端，支持浏览器流畅演示
- 设计容量支持50个注册用户，10人并行操作

---
## 🏗️ 整体架构设计
### 架构模式：微内核+插件化
```
┌─────────────────────────────────────────────────────┐
│                     前端展示层                        │
│  （交互界面、卡片渲染、拖拽操作、聊天式输入）           │
├─────────────────────────────────────────────────────┤
│                   微内核Core层                       │
│  事件总线/全局状态/插件管理/依赖注入/配置中心/安全拦截器│
├─────────────────────────────────────────────────────┤
│                     业务插件层                        │
│  行程规划插件｜情境感知插件｜社交匹配插件｜基础服务插件  │
├─────────────────────────────────────────────────────┤
│                     适配插件层                        │
│  Mock适配｜AI大模型适配｜地图服务适配｜OTA服务适配     │
└─────────────────────────────────────────────────────┘
```

### 核心架构优势
1. **单一职责**：每个模块/插件仅负责一项功能，可独立开发、测试、部署
2. **零耦合通信**：模块间仅通过内核事件总线通信，无直接依赖
3. **高可移植性**：核心层无平台绑定，可快速迁移到移动端、小程序等环境
4. **易扩展性**：新增功能仅需开发新插件，无需修改现有代码
5. **安全兜底**：内核统一安全拦截，所有社交请求自动校验实名认证状态

### 项目目录结构
```
Trailmate/
├── core/                     # 微内核核心层（100%稳定，无业务逻辑）
│   ├── interfaces/           # 全局标准接口定义
│   ├── event-bus.ts          # 带安全拦截的事件总线
│   ├── state-manager.ts      # 全局状态管理器（支持订阅）
│   ├── plugin-manager.ts     # 插件生命周期管理
│   ├── di-container.ts       # 依赖注入容器
│   ├── config-center.ts      # 统一配置中心
│   └── security-interceptor.ts # 统一安全拦截器
│
├── modules/                  # 业务功能模块（每个模块为独立插件）
│   ├── base/                 # 基础服务模块
│   ├── trip-tools/           # 行程工具类模块
│   │   └── itinerary-generator/ # 行程规划引擎（已完成开发）
│   ├── perception/           # 情境感知模块
│   └── social/               # 社交功能模块
│
├── adapters/                 # 第三方服务适配层
│   └── mock-adapter/         # 统一模拟数据适配器
│
├── platforms/                # 多端实现层
│   └── web/                  # Web演示端
│
├── shared/                   # 公共工具库（无状态，可跨模块复用）
├── package.json
├── tsconfig.json
└── README.md
```

---
## ✅ 已完成开发内容
### 1. 微内核Core层（100%完成）
| 核心能力 | 功能说明 |
|----------|----------|
| 事件总线 | 支持事件发布/订阅，内置安全拦截，自动校验所有社交请求的实名认证状态 |
| 全局状态管理 | 支持状态变更订阅，实现跨模块状态自动同步（行程生成后情境感知模块可自动获取） |
| 插件管理 | 完整的插件生命周期管理（安装/启动/卸载），自动校验依赖关系 |
| 服务注册/调用 | 支持服务降级，真实接口失败时自动切换到模拟数据 |
| 依赖注入 | 模块间依赖解耦，便于单元测试 |
| 配置中心 | 统一管理所有业务参数，支持动态更新 |

### 2. 行程规划引擎模块（100%完成）
#### 模块功能
- 支持用户自然语言输入生成行程需求
- 自动生成至少2套不同侧重点的行程方案（亲子休闲版/探索打卡版）
- 支持文本指令调整行程（如"把第二天下午空出来"）
- 支持拖拽调整行程顺序
- 行程数据自动同步到全局状态，其他模块可实时感知

#### 核心文件说明
| 文件路径 | 功能说明 |
|----------|----------|
| `modules/trip-tools/itinerary-generator/index.ts` | 插件入口，实现标准IPlugin接口 |
| `modules/trip-tools/itinerary-generator/src/generator/index.ts` | 多套行程生成算法 |
| `modules/trip-tools/itinerary-generator/src/types/index.ts` | 核心数据结构定义 |
| `modules/trip-tools/itinerary-generator/__tests__/generator.test.ts` | 单元测试用例，覆盖核心生成逻辑 |

#### 对外暴露服务
| 服务名称 | 功能 |
|----------|------|
| `itinerary.generate` | 生成多套行程方案 |
| `itinerary.adjustByText` | 根据文本指令调整行程 |
| `itinerary.adjustByDrag` | 拖拽调整行程 |
| `itinerary.getPlan` | 获取行程详情 |

---
## 📏 开发规范

### Web前端技术栈
| 技术 | 说明 |
|------|------|
| Vue 3 | 渐进式JavaScript框架，使用Composition API |
| TypeScript | 类型安全的JavaScript超集 |
| Vite | 下一代前端构建工具 |
| Tailwind CSS | 原子化CSS框架，快速构建响应式UI |
| marked | Markdown解析库，用于AI回复渲染 |

### Web端核心功能模块（v1.0.1）
| 页面 | 功能 |
|------|------|
| HomePage | 首页：品牌展示、功能介绍、引导入口 |
| Dashboard | 仪表盘：侧边导航、功能卡片、使用统计 |
| ItineraryPlanner | 行程规划：**AI对话界面**、多轮上下文、历史记录侧边栏 |
| Settings | 设置页面：个人资料、行程偏好、通知设置、显示设置 |

### 插件开发规范
所有业务模块必须实现`IPlugin`接口：
```typescript
export interface IPlugin {
  pluginId: string       // 插件唯一ID
  pluginName: string     // 插件名称
  version: string        // 插件版本
  dependencies?: string[] // 依赖的其他插件ID

  onInstall(core: ICore): void | Promise<void> // 安装钩子
  onMount(core: ICore): void | Promise<void>   // 启动钩子
  onUnmount(core: ICore): void | Promise<void> // 卸载钩子
}
```

### 模块通信规范
模块间只能通过内核事件总线通信，禁止直接依赖其他模块内部实现：
```typescript
// 发布事件
core.eventBus.emit(GlobalEvent.PLAN_GENERATED, { plans })
// 订阅事件
core.eventBus.on(GlobalEvent.PLAN_REQUEST, handleRequest)
```

### 服务调用规范
所有跨模块能力调用必须通过内核服务注册/调用机制：
```typescript
// 注册服务
core.service.register('itinerary.generate', generateFunction)
// 调用服务
const plans = await core.service.call('itinerary.generate', request)
```

---
## 🚀 后续开发顺序（优先级从高到低）
### 第一月剩余开发任务
| 优先级 | 任务 | 预计工时 |
|--------|------|----------|
| P0 | 开发Mock适配器，提供机票/酒店/景点的模拟数据接口 | 1天 |
| P0 | 开发Web端基础框架，配置Vite+Vue3开发环境 | 1天 |
| P1 | 开发行程规划前端页面：需求输入框、行程卡片、时间线展示 | 3天 |
| P1 | 实现拖拽调整行程交互功能 | 2天 |

### 第二月开发任务（情境感知模块）
| 优先级 | 任务 | 预计工时 |
|--------|------|----------|
| P0 | 开发位置感知模拟模块，支持手动/自动位置模拟 | 2天 |
| P0 | 开发规则引擎，实现各类提示触发规则 | 2天 |
| P1 | 开发时间线组件，展示行程进度和提示卡片 | 3天 |
| P1 | 实现各类模拟预警功能：拥堵提醒、景区关闭通知、特殊地区提示 | 2天 |

### 第三月开发任务（社交匹配模块）
| 优先级 | 任务 | 预计工时 |
|--------|------|----------|
| P0 | 开发用户旅行标签管理和档案页面 | 2天 |
| P0 | 实现多维度旅伴匹配算法 | 3天 |
| P1 | 开发临时组队功能：拼车/拼餐/互助拍照 | 3天 |
| P1 | 实现信用评价体系和权限控制 | 2天 |
| P1 | 开发安全守护功能：位置分享给紧急联系人 | 2天 |

---
## ⚙️ 环境配置
### 开发环境要求
| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 18.0.0 | 推荐使用LTS版本（18.x/20.x） |
| 包管理器 | npm >= 9.0.0 / pnpm >= 8.0.0 | 推荐使用pnpm以获得更快的安装速度 |
| 浏览器 | Chrome >= 100 / Edge >= 100 / Firefox >= 99 | 现代浏览器支持ES6+特性 |

### 环境变量配置
在项目根目录创建`.env`文件，支持以下配置项：
```env
# 运行模式：development开发环境 / demo演示环境 / production生产环境
VITE_NODE_ENV = development

# 是否启用Mock数据（演示版建议开启，无需真实后端接口）
VITE_USE_MOCK = true

# 后端API地址（生产环境部署时修改为真实地址）
VITE_API_BASE_URL = https://api.trailmate.example.com

# 地图服务密钥（使用高德/百度地图时配置，演示版可留空）
VITE_MAP_KEY = 

# AI大模型API密钥（接入真实AI服务时配置，演示版可留空）
VITE_AI_API_KEY = 
```

### 多环境配置说明
| 环境 | 配置文件 | 特点 |
|------|----------|------|
| 开发环境 | `.env.development` | 开启调试模式，热更新，使用Mock数据 |
| 演示环境 | `.env.demo` | 关闭调试，全量Mock数据，适合产品演示 |
| 生产环境 | `.env.production` | 关闭Mock，调用真实后端接口，代码压缩混淆 |

### Vite配置说明
`platforms/web/vite.config.ts` 核心配置：
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 路径别名配置，与tsconfig保持一致
    alias: {
      '@trailmate/core': path.resolve(__dirname, '../../core/index.ts'),
      '@trailmate/shared': path.resolve(__dirname, '../../shared'),
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000, // 开发服务端口
    open: true, // 启动后自动打开浏览器
    // 后端接口代理配置（开发环境跨域使用）
    proxy: {
      '/api': {
        target: 'https://api.trailmate.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

---
## 📦 运行与部署
### 本地开发
```bash
# 安装依赖
npm install
# 启动Web端开发服务
npm run dev:web
# 运行单元测试
npx vitest run
# 构建生产版本
npm run build:web
```

### Git提交规范
```bash
# 提交格式
git commit -m "<类型>: <描述>"
# 类型说明
feat: 新功能
fix: 修复bug
docs: 文档更新
refactor: 代码重构
test: 测试用例更新
chore: 构建/工程配置更新
```

### 仓库地址
Gitee仓库：https://gitee.com/zeming-fan/trailmate

