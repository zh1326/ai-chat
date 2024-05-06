import { defineStore } from 'pinia'
import { useLoginApi, useLogoutApi, useUserInfoApi, type LoginParams } from '@/api/user'
import cache from '@/utils/cache'
import type { UserItem, UserState } from '@/interface/user'

export const useUserStore = defineStore('userStore', {
  state: (): UserState => ({
    // 用户信息
    user: {
      userid: '',
      username: '',
      email: '',
      phone: '',
      last_login_at: 0
    },
    isLogin: false,
    // 权限列表
    // authorityList: [],
    // 访问token
    token: cache.getToken(),
    // 刷新token
    refreshToken: cache.getRefreshToken()
  }),
  actions: {
    setUser(val: UserItem) {
      this.user = val
    },
    setToken(val: string | null) {
      this.token = val
      cache.setToken(val)
    },
    clearToken() {
      this.token = null
      cache.clearToken()
    },
    // 账号登录
    async accountLoginAction(loginForm: LoginParams) {
      const data = await useLoginApi(loginForm)
      if (data) {
        this.isLogin = true
        this.setToken(data.token)
      }
    },
    // 获取用户信息
    async getUserInfoAction() {
      const data = await useUserInfoApi()
      if (data) {
        this.setUser(data)
      }
    },
    // 用户退出
    async logoutAction() {
      await useLogoutApi()

      // 移除 token
      this.isLogin = false
      this.setToken(null)
    }
  }
})
