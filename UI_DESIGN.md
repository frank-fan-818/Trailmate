# Trailmate 前端设计系统规则

本文档定义了 Trailmate 项目的前端设计系统规范，所有 UI 开发必须严格遵循本规范。

---

## 1. 色彩系统

### 1.1 品牌主色（橙红色主题）

```css
--color-primary: #FF6B4A;           /* 橙红色 - 主色 */
--color-primary-hover: #E55A3D;     /* 主色悬停 */
--color-primary-active: #D04A2D;    /* 主色激活 */
--color-primary-10: rgba(255,107,74,0.1);  /* 10%透明度背景 */

--color-secondary: #8B7355;         /* 陶土棕 - 辅助色 */
--color-secondary-hover: #9B8365;
--color-secondary-active: #7B6345;

--color-accent: #C4956A;            /* 琥珀金 - 强调色 */
--color-accent-hover: #D4A57A;
--color-accent-active: #B4855A;
```

### 1.2 中性色

```css
--color-neutral-50: #F7F5F2;        /* 米白背景 */
--color-neutral-100: #E8E4DF;       /* 暖灰边框 */
--color-neutral-200: #D1D5DB;       /* 输入框边框 */
--color-neutral-500: #6B7280;       /* 次要文字 */
--color-neutral-700: #374151;       /* 主要文字 */
--color-neutral-900: #1A1A1A;       /* 标题文字 */
```

### 1.3 语义色

```css
--color-success: #2D5A4A;
--color-warning: #C4956A;
--color-error: #8B3A3A;
--color-error-10: rgba(139,58,58,0.1);
```

### 1.4 深色模式预留（暂不实现）

```css
/* Dark Mode - 预留变量结构 */
--color-primary-dark: #4D7A6A;
--color-neutral-950: #0A0A0A;       /* 深色背景 */
--color-neutral-800: #1F1F1F;       /* 深色卡片 */
--color-neutral-700-dark: #E5E5E5;  /* 深色模式文字 */
```

### 1.5 禁止项

- ❌ 蓝紫渐变（任何形式的 `linear-gradient` 包含 purple/violet/indigo）
- ❌ 霓虹色、彩虹色
- ❌ 单页面超过3种品牌色
- ❌ 背景使用渐变（Hero 背景图叠加遮罩除外）

---

## 2. 排版系统

### 2.1 字体族

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
--font-mono: 'Geist Mono', 'SF Mono', Monaco, monospace;
```

### 2.2 字号比例

统一使用 **rem**，基准 `1rem = 16px`

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 2rem;       /* 32px */
--text-4xl: 2.5rem;     /* 40px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

### 2.3 字重

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-extrabold: 800;
```

### 2.4 行高

- 正文：`line-height: 1.5` 或 `line-height: 1.75`
- 标题：`line-height: 1.25` 或 `line-height: 1.3`

---

## 3. 间距系统

### 3.1 基准单位

**4px 基准网格，统一使用 rem**

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-32: 8rem;     /* 128px */
```

### 3.2 禁止项

- ❌ 魔法数字（13px、7px、23px等）
- ❌ 内联样式的间距值（除 Hero 标题文字阴影外）
- ❌ 混用 px/rem/em

---

## 4. 布局约束

```css
--container-max: 68.75rem;            /* 1100px 最大内容宽度 */
--grid-gap: var(--space-8);          /* 网格间距 32px */
--section-padding-y: var(--space-12); /* 纵向区块间距 */
```

### 4.1 布局规则

- 内容区最大宽度：`1100px`
- 水平内边距：`px-8`（32px）
- 网格间距：使用 `gap-8`（32px）
- 纵向区块间距：`mb-32`（128px）
- 内容区顶部圆角：`rounded-t-[40px]`
- 禁止滥用 `position: absolute`（仅用于 overlays/tooltips）

### 4.2 Hero 区域

- 全屏高度：`h-screen`
- 背景：固定定位 `fixed`，z-index `-z-10`
- 多层背景叠加时使用交叉淡入淡出动画
- 遮罩层：使用 `bg-black/X` 调整亮度
- 文字阴影：`text-shadow: 0 10px 30px rgba(0,0,0,0.4)`

---

## 5. 组件规范

### 5.1 卡片

- 边框 + 阴影组合
- 圆角：`rounded-2xl`（16px）或 `rounded-3xl`（24px）
- 边框：`border border-gray-200`
- 阴影等级：
  ```css
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  ```
- Hover 效果：`hover:-translate-y-2 hover:shadow-lg`
- 图片比例：`aspect-[4/3]` 或固定高度 `h-44`

### 5.2 按钮

- 主按钮：实心填充，使用 `var(--color-primary)`，无渐变
- 次按钮：描边或幽灵样式
- Hover：背景变深 `primary-hover`
- Active：背景更深 `primary-active`
- 圆角：`rounded-lg` 或 `rounded-xl`
- 最小点击区域：`44px × 44px`
- 过渡动画：`transition-all duration-300`

### 5.3 输入框

- 边框：`1px solid var(--color-neutral-200)`
- 圆角：`rounded-lg`
- Focus：边框变色 + `outline`，无发光效果

### 5.4 头像 & 图片（社交场景）

- Avatar 圆角：`rounded-lg`（8px）或 `rounded-xl`（12px）
- Media/Image 圆角：`rounded-2xl`（16px）或 `rounded-3xl`（24px）

### 5.5 导航栏

- 固定定位：`fixed top-0 w-full z-50`
- 高度：`py-6`（24px）
- 透明背景：`bg-transparent text-white`
- 滚动后背景：`bg-white/85 backdrop-blur-md shadow-md text-gray-900`
- Logo 区域可使用负 margin `-ml-4` 微调位置

---

## 6. 交互状态

### 6.1 过渡动画

```css
--transition-fast: 0.15s ease;
--transition-normal: 0.2s ease-in-out;
--transition-slow: 0.3s ease-in-out;
--transition-fade: 1s ease-in-out;
```

### 6.2 交互规则

- 所有可交互元素必须有 `:focus-visible` 状态
- Focus ring：`2px outline-offset`
- 过渡属性：`color, background-color, border-color, transform, opacity`
- 链接 hover：下划线或主色变化
- 图片 hover：`hover:scale-105` 放大效果

### 6.3 轮播/走马灯

- 无限循环：复制数据数组实现
- 动画：`requestAnimationFrame` 实现平滑滚动
- 重置位置：滚动到一半时重置 position
- 卡片宽度：`w-80`（320px）
- 卡片间距：`gap-8`（32px）

---

## 7. 图标规范

- 统一使用 **Lucide** 图标库
- 内联图标：`16px`
- 独立图标：`20px`
- Stroke-width：统一 `2px`
- ❌ 禁止使用 emoji 作为功能图标
- ❌ 同一界面禁止混用不同图标库

---

## 8. 禁止模式清单

| 禁止项 | 说明 |
|--------|------|
| 蓝紫渐变 | 任何形式的 `linear-gradient` 包含 purple/violet/indigo |
| 玻璃拟态 | 除非明确要求 |
| Emoji 图标 | 功能性图标禁止使用 |
| 过度阴影 | 单页面不超过2级阴影深度 |
| 内联样式 | 颜色、间距、排版禁止内联 |
| 魔法数字 | 所有数值必须引用设计 Token |
| 大圆角 | 按钮/卡片圆角不超过 `rounded-3xl`（24px） |
| 混合单位 | 统一使用 rem |

---

## 9. Tailwind CSS 映射

在 `tailwind.config.js` 中扩展以下配置：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#FF6B4A',
        hover: '#E55A3D',
        active: '#D04A2D',
      },
      secondary: {
        DEFAULT: '#8B7355',
        hover: '#9B8365',
        active: '#7B6345',
      },
      accent: {
        DEFAULT: '#C4956A',
        hover: '#D4A57A',
        active: '#B4855A',
      },
      neutral: {
        50: '#F7F5F2',
        100: '#E8E4DF',
        200: '#D1D5DB',
        500: '#6B7280',
        700: '#374151',
        900: '#1A1A1A',
      },
    },
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1.5' }],
      'sm': ['0.875rem', { lineHeight: '1.5' }],
      'base': ['1rem', { lineHeight: '1.75' }],
      'lg': ['1.125rem', { lineHeight: '1.75' }],
      'xl': ['1.25rem', { lineHeight: '1.5' }],
      '2xl': ['1.5rem', { lineHeight: '1.3' }],
      '3xl': ['2rem', { lineHeight: '1.3' }],
      '4xl': ['2.5rem', { lineHeight: '1.2' }],
      '5xl': ['3rem', { lineHeight: '1.2' }],
      '6xl': ['3.75rem', { lineHeight: '1.1' }],
    },
    spacing: {
      '1': '0.25rem',
      '2': '0.5rem',
      '3': '0.75rem',
      '4': '1rem',
      '5': '1.25rem',
      '6': '1.5rem',
      '8': '2rem',
      '10': '2.5rem',
      '12': '3rem',
      '16': '4rem',
      '20': '5rem',
      '32': '8rem',
    },
    borderRadius: {
      'sm': '6px',
      'md': '8px',
      'lg': '12px',
      'xl': '16px',
      '2xl': '20px',
      '3xl': '24px',
      '4xl': '32px',
    },
    boxShadow: {
      'sm': '0 1px 3px rgba(0,0,0,0.08)',
      'md': '0 4px 12px rgba(0,0,0,0.1)',
      'lg': '0 10px 30px rgba(0,0,0,0.15)',
    },
    transitionDuration: {
      'fast': '150ms',
      'normal': '200ms',
      'slow': '300ms',
      'fade': '1000ms',
    },
    maxWidth: {
      'content': '1100px',
    },
  },
}
```

---

## 10. 版本记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2024-04 | 初始版本，定义核心设计系统 |
| v1.1 | 2025-04 | 更新为橙红色主题，添加 Hero 区域规范、轮播组件规范、布局约束细化 |
