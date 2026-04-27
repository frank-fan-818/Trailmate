<template>
  <div id="app">
    <!-- 首页（参考第一个设计） -->
    <HomePage v-if="currentPage === 'home'" @start="currentPage = 'dashboard'" />

    <!-- 应用主界面（参考第二个设计） -->
    <Dashboard
      v-else-if="currentPage === 'dashboard'"
      @startPlanning="currentPage = 'planner'"
      @openSettings="currentPage = 'settings'"
      @openPerception="currentPage = 'perception'"
      @openCommunity="currentPage = 'findCompanion'"
    />

    <!-- 寻找伴友过渡页 -->
    <FindCompanion
      v-else-if="currentPage === 'findCompanion'"
      @back="currentPage = 'dashboard'"
      @openMatch="currentPage = 'companionMatch'"
    />

    <!-- 行程规划页面 -->
    <ItineraryPlanner v-else-if="currentPage === 'planner'" @back="currentPage = 'dashboard'" />

    <!-- 情境感知页面 -->
    <PerceptionPage v-else-if="currentPage === 'perception'" @back="currentPage = 'dashboard'" />

    <!-- 旅伴匹配页面 -->
    <CompanionMatch
      v-else-if="currentPage === 'companionMatch'"
      @back="currentPage = 'findCompanion'"
      @viewProfile="currentPage = 'companionProfile'; selectedCompanionId = $event"
    />

    <!-- 旅伴个人信息页面 -->
    <CompanionProfile
      v-else-if="currentPage === 'companionProfile'"
      :companion-id="selectedCompanionId"
      @back="currentPage = 'companionMatch'"
    />

    <!-- 设置页面 -->
    <Settings v-else-if="currentPage === 'settings'" @back="currentPage = 'dashboard'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HomePage from './pages/HomePage.vue'
import Dashboard from './pages/Dashboard.vue'
import ItineraryPlanner from './pages/ItineraryPlanner.vue'
import PerceptionPage from './pages/PerceptionPage.vue'
import Settings from './pages/Settings.vue'
import FindCompanion from './pages/FindCompanion.vue'
import CompanionMatch from './pages/CompanionMatch.vue'
import CompanionProfile from './pages/CompanionProfile.vue'

const currentPage = ref('home')
const selectedCompanionId = ref('1')
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>