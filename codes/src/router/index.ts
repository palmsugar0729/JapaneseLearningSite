import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '../api/client'

const routes = [
  {
    path: '/',
    component: () => import('../views/Welcome.vue'),
  },
  {
    path: '/login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    component: () => import('../views/Register.vue'),
    meta: { guest: true },
  },
  {
    path: '/word',
    component: () => import('../views/Vocabulary.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/exercise',
    component: () => import('../views/Exercise.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/user',
    component: () => import('../views/UserCenter.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = getToken()

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.guest && token) {
    next('/')
  } else {
    next()
  }
})

export default router
