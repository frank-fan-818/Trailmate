import { createRouter, createWebHistory, type RouteLocationNormalized, type NavigationGuardNext } from 'vue-router'
import { watch } from 'vue'
import { useAuth } from '@/composables/useAuth'

const auth = useAuth()

const PUBLIC_ROUTES = ['/', '/login', '/help']

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
      path: '/flights',
      name: 'flights',
      component: () => import('../pages/FlightsPage.vue'),
    },
    {
      path: '/exchange',
      name: 'exchange',
      component: () => import('../pages/ExchangePage.vue'),
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('../pages/HelpPage.vue'),
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
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/LoginPage.vue'),
    },
    {
      path: '/companion-profile/edit',
      name: 'companionProfileEdit',
      component: () => import('../pages/CompanionProfileEdit.vue'),
    },
    {
      path: '/verification',
      name: 'realNameVerification',
      component: () => import('../pages/RealNameVerification.vue'),
    },
    {
      path: '/admin/verifications',
      name: 'adminVerifications',
      component: () => import('../pages/AdminVerifications.vue'),
    },
  ],
})

function guard(to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) {
  // 已登录用户访问 /login → 重定向到 dashboard
  if (to.path === '/login' && auth.isAuthenticated.value) {
    const redirect = to.query.redirect as string | undefined
    return next({ path: redirect || '/dashboard' })
  }

  // 公开路由直接放行
  if (PUBLIC_ROUTES.includes(to.path)) {
    return next()
  }

  // 需认证但未登录 → 重定向到 /login
  if (!auth.isAuthenticated.value) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  next()
}

router.beforeEach((to, from, next) => {
  if (!auth.isAuthReady.value) {
    const unwatch = watch(auth.isAuthReady, (ready) => {
      if (ready) {
        unwatch()
        guard(to, from, next)
      }
    })
    return
  }
  guard(to, from, next)
})

export default router
