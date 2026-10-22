import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.user) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
