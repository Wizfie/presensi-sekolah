import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useAttendanceStore } from '../stores/attendance'
import LoginView from '../views/LoginView.vue'
import SiswaDashboard from '../views/SiswaDashboard.vue'
import GuruDashboard from '../views/GuruDashboard.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/siswa',
    name: 'siswa-dashboard',
    component: SiswaDashboard,
    meta: { requiresAuth: true, role: 'siswa' }
  },
  {
    path: '/guru',
    name: 'guru-dashboard',
    component: GuruDashboard,
    meta: { requiresAuth: true, role: 'guru' }
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function getDashboardRouteName(role) {
  if (role === 'admin') return 'admin-dashboard'
  if (role === 'guru') return 'guru-dashboard'
  return 'siswa-dashboard'
}

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  await authStore.ensureInitialized()

  if (to.meta.requiresAuth && !authStore.user) {
    next({ name: 'login' })
    return
  }

  if (to.name === 'login' && authStore.user) {
    next({ name: getDashboardRouteName(authStore.user.role) })
    return
  }

  if (to.meta.role && authStore.user && to.meta.role !== authStore.user.role) {
    next({ name: getDashboardRouteName(authStore.user.role) })
    return
  }

  if (authStore.user && to.meta.requiresAuth) {
    const attendanceStore = useAttendanceStore()
    await attendanceStore.ensureDataLoaded()
  }

  next()
})

export default router
