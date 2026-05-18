import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../pages/Dashboard.vue'),
    },
    {
      path: '/planner',
      name: 'planner',
      component: () => import('../pages/ItineraryPlanner.vue'),
    },
    {
      path: '/perception',
      name: 'perception',
      component: () => import('../pages/PerceptionPage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../pages/Settings.vue'),
    },
    {
      path: '/find-companion',
      name: 'findCompanion',
      component: () => import('../pages/FindCompanion.vue'),
    },
    {
      path: '/companion-match',
      name: 'companionMatch',
      component: () => import('../pages/CompanionMatch.vue'),
    },
    {
      path: '/companion-profile/:id',
      name: 'companionProfile',
      component: () => import('../pages/CompanionProfile.vue'),
      props: (route) => ({ companionId: route.params.id }),
    },
    {
      path: '/my-trips',
      name: 'myTrips',
      component: () => import('../pages/MyTrips.vue'),
    },
    {
      path: '/concierge',
      name: 'concierge',
      component: () => import('../pages/AiConcierge.vue'),
    },
    {
      path: '/chat/:id',
      name: 'chat',
      component: () => import('../pages/ChatPage.vue'),
      props: (route) => ({ companionId: route.params.id, companionName: route.query.name || '' }),
    },
  ],
})

export default router
