<template>
  <div id="app">
    <!-- 首页（参考第一个设计） -->
    <HomePage v-if="currentPage === 'home'" @start="currentPage = 'dashboard'" />
    
    <!-- 应用主界面（参考第二个设计） -->
    <Dashboard v-else-if="currentPage === 'dashboard'" @startPlanning="currentPage = 'planner'" @openSettings="currentPage = 'settings'" />
    
    <!-- 行程规划页面 -->
    <ItineraryPlanner v-else-if="currentPage === 'planner'" @back="currentPage = 'dashboard'" />
    
    <!-- 设置页面 -->
    <Settings v-else-if="currentPage === 'settings'" @back="currentPage = 'dashboard'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HomePage from './pages/HomePage.vue'
import Dashboard from './pages/Dashboard.vue'
import ItineraryPlanner from './pages/ItineraryPlanner.vue'
import Settings from './pages/Settings.vue'

const currentPage = ref('home') // 'home' | 'dashboard' | 'planner' | 'settings'
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
