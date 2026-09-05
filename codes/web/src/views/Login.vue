<template>
  <div class="container">
    <div class="auth-card">
      <h1 class="title">日语学习</h1>
      <p class="subtitle">登录你的账号</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="请输入用户名" autocomplete="username" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" autocomplete="current-password" />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="switch-link">
        还没有账号？<router-link to="/register">注册</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, setToken, setUser, type UserInfo } from '../api/client'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = '请填写用户名和密码'
    return
  }

  loading.value = true
  try {
    const data = await api.post<{ token: string; user: UserInfo }>('/auth/login', {
      username: username.value,
      password: password.value,
    })
    setToken(data.token)
    setUser(data.user)
    router.push('/word')
  } catch (e: any) {
    error.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@use "sass:color";

$primary: #a3c1ad;
$primary-dark: color.adjust($primary, $lightness: -10%);

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 24px;
}

.auth-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 4px;
}

.subtitle {
  text-align: center;
  font-size: 14px;
  opacity: 0.6;
  margin-bottom: 28px;
}

.form-group {
  margin-bottom: 18px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    opacity: 0.7;
  }

  input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.6);
    font-size: 15px;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: $primary;
    }
  }
}

.error-msg {
  color: #ff6b6b;
  font-size: 13px;
  margin-bottom: 14px;
  text-align: center;
}

.btn-primary {
  width: 100%;
  padding: 13px 24px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, color.adjust($primary, $lightness: 6%), $primary-dark);
  color: #2c3e50;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.switch-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  opacity: 0.6;

  a {
    color: $primary-dark;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
