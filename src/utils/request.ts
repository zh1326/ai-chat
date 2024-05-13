import axios, { type AxiosResponse } from 'axios'
import qs from 'qs'
import { ElMessage } from 'element-plus'
import { ElMessageBox } from 'element-plus/es'
import { useUserStore } from '@/stores/user'
import router, { LoginPath } from '@/router'

export const host = import.meta.env.VITE_APP_API_HOST

// axios 实例
const service = axios.create({
  baseURL: host,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()

    if (userStore?.token && config.headers) {
      config.headers.authorization = 'Bearer  ' + userStore.token
    }

    // 追加时间戳，防止GET请求缓存
    if (config.method?.toUpperCase() === 'GET') {
      config.params = { ...config.params, t: new Date().getTime() }
    }

    if (Object.values(config.headers).includes('application/x-www-form-urlencoded')) {
      config.data = qs.stringify(config.data)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  async (response: AxiosResponse<any>) => {
    // const userStore = useUserStore()
    if (response.status === 401) {
      return handleAuthorized()
    }

    if (response.status === 422) {
      console.log('error')
    }

    if (response.status !== 200 && response.status !== 204) {
      return Promise.reject(new Error(response.statusText || 'Error'))
    }

    const res = response.data
    if (Object.prototype.toString.call(res) === '[object Blob]') {
      return response
    }

    if (response.status === 200) {
      return res
    }

    if (response.status === 204) {
      return res || true
    }

    // 错误提示
    ElMessage.error(res.msg)

    return Promise.reject(new Error(res.msg || 'Error'))
  },
  (error) => {
    const { response } = error
    const curPath = router.currentRoute.value.fullPath

    if (response.status === 401) {
      if (curPath === LoginPath) {
        ElMessage.error('用户名或密码错误')
        return
      }
      return handleAuthorized()
    } else if (response.status === 422) {
      ElMessage.error('出错了，请稍后重试')
      return
    }
    ElMessage.error(error.message)
    return Promise.reject(error)
  }
)

const handleAuthorized = () => {
  ElMessageBox.confirm('登录超时，请重新登录', '提示', {
    showCancelButton: false,
    closeOnClickModal: false,
    showClose: false,
    confirmButtonText: '重新登录',
    type: 'warning'
  }).then(() => {
    const userStore = useUserStore()
    userStore?.clearToken()
    router.push({
      path: LoginPath,
      query: { returnUrl: router.currentRoute.value.fullPath }
    })

    return Promise.reject('登录超时，请重新登录')
  })
}

// 导出 axios 实例
export default service
