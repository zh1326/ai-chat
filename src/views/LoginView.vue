<template>
  <div class="login-container">
    <div>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" @keyup.enter="onLogin">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            :prefix-icon="User"
            placeholder="输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            :prefix-icon="Lock"
            show-password
            placeholder="输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item class="login-button">
          <el-button type="primary" @click="onLogin()">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const loginFormRef = ref()

const loginForm = reactive({
  username: '',
  password: '',
  key: ''
})

const loginRules = ref({
  username: [{ required: true, message: '用户名为必填项', trigger: 'blur' }],
  password: [{ required: true, message: '密码为必填项', trigger: 'blur' }]
})

const onLogin = () => {
  loginFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      return false
    }

    // 重新封装登录数据
    const loginData = {
      username: loginForm.username,
      password: loginForm.password
    }

    // 用户登录
    userStore
      .accountLoginAction(loginData)
      .then(() => {
        console.log('login success')
        router.push({ path: '/' })
      })
      .catch((error) => {
        console.error('error', error)
      })
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  height: 100vh;
}
</style>
