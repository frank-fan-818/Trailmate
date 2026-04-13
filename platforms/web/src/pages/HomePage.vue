<template>
  <div class="min-h-screen bg-white relative">
    <!-- 网格背景 -->
    <div 
      class="absolute inset-0 bg-grid-pattern bg-grid"
      style="mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);"
    />
    
    <!-- 导航栏 -->
    <nav class="relative z-10 h-16 border-b border-geist-200 flex items-center justify-between px-6 lg:px-12">
      <div class="flex items-center gap-2">
        <img src="/logo.jpg" alt="伴旅" class="w-8 h-8 rounded" />
        <span class="font-semibold text-foreground">伴旅</span>
      </div>
      <div class="flex items-center gap-4">
        <a href="#features" class="text-body-sm text-muted hover:text-foreground transition-colors">功能</a>
        <a href="#" class="text-body-sm text-muted hover:text-foreground transition-colors">文档</a>
        <button 
          @click="$emit('start')"
          class="vercel-button-primary"
        >
          开始使用
        </button>
      </div>
    </nav>

    <!-- Hero 区域 -->
    <main class="relative z-10">
      <div class="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-geist-200 bg-geist-100 mb-8">
          <span class="w-2 h-2 rounded-full bg-vercel-blue animate-pulse"/>
          <span class="text-caption text-muted">AI 驱动的智能行程规划</span>
        </div>

        <!-- 主标题 -->
        <h1 class="text-title-1 md:text-display lg:text-hero font-extrabold text-foreground tracking-tight mb-6">
          让每一次旅行
          <br />
          <span class="text-vercel-blue">都恰到好处</span>
        </h1>

        <!-- 副标题 -->
        <p class="text-subtitle text-muted max-w-2xl mx-auto mb-10">
          输入目的地，AI 即刻生成多套行程方案。智能规划、实时调整、一键出发。
        </p>

        <!-- CTA 按钮组 -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button 
            @click="$emit('start')"
            class="vercel-button-primary w-full sm:w-auto"
          >
            <span>立即开始</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <button class="vercel-button-secondary w-full sm:w-auto">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>观看演示</span>
          </button>
        </div>

        <!-- 代码展示卡片 -->
        <div class="vercel-card max-w-3xl mx-auto overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-geist-200 bg-geist-100">
            <div class="flex gap-1.5">
              <div class="w-3 h-3 rounded-full bg-geist-300"/>
              <div class="w-3 h-3 rounded-full bg-geist-300"/>
              <div class="w-3 h-3 rounded-full bg-geist-300"/>
            </div>
            <span class="text-caption text-muted ml-2">行程规划示例</span>
          </div>
          <div class="p-6 text-left overflow-x-auto">
            <pre class="font-mono text-code text-geist-700"><code><span class="text-vercel-blue">$</span> trailmate plan <span class="text-vercel-purple">"北京 3 日游"</span>

<span class="text-muted">→</span> 正在分析目的地...
<span class="text-muted">→</span> 生成 3 套行程方案
<span class="text-muted">→</span> 优化路线规划中...

<span class="text-vercel-green">✓</span> 方案生成完成！

<span class="text-foreground font-semibold">Day 1</span>
  09:00  故宫博物院
  14:00  景山公园
  18:00  王府井步行街

<span class="text-foreground font-semibold">Day 2</span>
  08:00  长城（八达岭）
  15:00  鸟巢/水立方
  19:00  三里屯

<span class="text-vercel-blue">$</span> _<span class="animate-pulse">|</span></code></pre>
          </div>
        </div>
      </div>

      <!-- 功能特性 -->
      <div id="features" class="max-w-6xl mx-auto px-6 py-24 border-t border-geist-200">
        <div class="text-center mb-16">
          <h2 class="text-title-2 font-bold text-foreground mb-4">核心功能</h2>
          <p class="text-body text-muted">为现代旅行者打造的智能工具</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="vercel-card p-6 hover:border-geist-400 transition-colors">
            <div class="w-10 h-10 rounded border border-geist-200 flex items-center justify-center mb-4">
              <svg class="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-body font-semibold text-foreground mb-2">智能规划</h3>
            <p class="text-body-sm text-muted">AI 分析目的地特色，一键生成多套行程方案，省时省力</p>
          </div>

          <div class="vercel-card p-6 hover:border-geist-400 transition-colors">
            <div class="w-10 h-10 rounded border border-geist-200 flex items-center justify-center mb-4">
              <svg class="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-body font-semibold text-foreground mb-2">旅伴匹配</h3>
            <p class="text-body-sm text-muted">基于行程和兴趣，智能推荐志同道合的旅行伙伴</p>
          </div>

          <div class="vercel-card p-6 hover:border-geist-400 transition-colors">
            <div class="w-10 h-10 rounded border border-geist-200 flex items-center justify-center mb-4">
              <svg class="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
              </svg>
            </div>
            <h3 class="text-body font-semibold text-foreground mb-2">情境感知</h3>
            <p class="text-body-sm text-muted">根据天气、交通、排队情况实时推送智能提醒</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div class="vercel-card p-6 hover:border-geist-400 transition-colors">
            <div class="w-10 h-10 rounded border border-geist-200 flex items-center justify-center mb-4">
              <svg class="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-body font-semibold text-foreground mb-2">动态调整</h3>
            <p class="text-body-sm text-muted">行程变动？AI 自动重新规划，确保最佳体验</p>
          </div>

          <div class="vercel-card p-6 hover:border-geist-400 transition-colors">
            <div class="w-10 h-10 rounded border border-geist-200 flex items-center justify-center mb-4">
              <svg class="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-body font-semibold text-foreground mb-2">本地推荐</h3>
            <p class="text-body-sm text-muted">发现隐藏 gems，本地人推荐的餐厅和景点</p>
          </div>

          <div class="vercel-card p-6 hover:border-geist-400 transition-colors">
            <div class="w-10 h-10 rounded border border-geist-200 flex items-center justify-center mb-4">
              <svg class="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-body font-semibold text-foreground mb-2">离线支持</h3>
            <p class="text-body-sm text-muted">下载行程到本地，无网络也能查看完整计划</p>
          </div>
        </div>
      </div>

      <!-- 技术栈展示 -->
      <div class="max-w-6xl mx-auto px-6 py-24 border-t border-geist-200">
        <div class="text-center mb-12">
          <h2 class="text-title-3 font-bold text-foreground mb-3">技术驱动</h2>
          <p class="text-body text-muted">基于现代技术栈构建</p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-8">
          <div class="flex items-center gap-2 text-muted">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 19h20L12 2zm0 3.5L17.5 17h-11L12 5.5z"/>
            </svg>
            <span class="text-body-sm font-medium">Vue 3</span>
          </div>
          <div class="flex items-center gap-2 text-muted">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span class="text-body-sm font-medium">TypeScript</span>
          </div>
          <div class="flex items-center gap-2 text-muted">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span class="text-body-sm font-medium">AI Engine</span>
          </div>
          <div class="flex items-center gap-2 text-muted">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            <span class="text-body-sm font-medium">Open Source</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-geist-200 py-12">
      <div class="max-w-6xl mx-auto px-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <img src="/logo.jpg" alt="伴旅" class="w-6 h-6 rounded" />
            <span class="text-body-sm text-muted">伴旅 Trailmate</span>
          </div>
          <div class="flex items-center gap-6">
            <a href="#" class="text-caption text-muted hover:text-foreground transition-colors">GitHub</a>
            <a href="#" class="text-caption text-muted hover:text-foreground transition-colors">文档</a>
            <a href="#" class="text-caption text-muted hover:text-foreground transition-colors">反馈</a>
          </div>
          <p class="text-caption text-muted">
            2024 Trailmate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>
