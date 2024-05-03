import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { useUserStore } from '@/stores/user'

export const LoginPath = '/login'
export const IndexPath = '/'
export const ignoreList = [LoginPath]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/chat'
    },
    {
      path: '/chat',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (userStore.token) {
    // token 存在
    if (to.path === LoginPath) {
      // 跳转首页
      next(IndexPath)
    } else {
      if (!userStore.user?.username) {
        // 用户信息不存在，则重新请求接口获取
        try {
          await userStore.getUserInfoAction()
          next({ ...to, replace: true })
        } catch (error) {
          // 接口异常
          console.error('error: ', error)
          // userStore.setToken(null)
          return Promise.reject(error)
        }
      } else {
        // 直接进入页面
        next()
      }
    }
  } else {
    // token 不存在
    if (ignoreList.indexOf(to.path) >= 0) {
      next()
    } else {
      next(LoginPath)
    }
  }
})

export default router
