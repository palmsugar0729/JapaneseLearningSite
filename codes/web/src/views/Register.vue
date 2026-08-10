<template>
  <div class="container">
    <div class="auth-card">
      <h1 class="title">创建账号</h1>
      <p class="subtitle">注册后开始你的日语学习之旅</p>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="2-30个字符" autocomplete="username" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="至少4个字符" autocomplete="new-password" />
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input v-model="confirmPassword" type="password" placeholder="再输入一次密码" autocomplete="new-password" />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>
        <div v-if="success" class="success-msg">{{ success }}</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="switch-link">
        已有账号？<router-link to="/login">登录</router-link>
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
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  success.value = ''

  if (!username.value || !password.value) {
    error.value = '请填写用户名和密码'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = '两次密码不一致'
    return
  }

  loading.value = true
  try {
    const data = await api.post<{ token: string; user: UserInfo }>('/auth/register', {
      username: username.value,
      password: password.value,
    })
    setToken(data.token)
    setUser(data.user)
    success.value = '注册成功！正在跳转...'
    setTimeout(() => router.push('/'), 800)
  } catch (e: any) {
    error.value = e.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
// reuse same styles as Login.vue
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

.success-msg {
  color: #6bcb77;
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
