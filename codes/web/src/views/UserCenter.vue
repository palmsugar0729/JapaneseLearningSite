<template>
  <div class="container">
    <h1 class="title">用户中心</h1>

    <!-- 未登录 -->
    <div v-if="!isLoggedIn" class="card guest">
      <p class="placeholder">登录后可以管理你的账号信息</p>
      <router-link to="/login" class="btn-primary">去登录</router-link>
    </div>

    <template v-else>
      <!-- 账号信息 -->
      <div class="card">
        <h2 class="card-title">账号信息</h2>
        <div class="info-row">
          <span class="info-label">用户名</span>
          <span class="info-value">{{ user?.username }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">用户 ID</span>
          <span class="info-value">{{ user?.id }}</span>
        </div>
      </div>

      <!-- 修改用户名 -->
      <div class="card">
        <h2 class="card-title">修改用户名</h2>
        <form @submit.prevent="handleUpdateUsername">
          <div class="form-group">
            <label>新用户名</label>
            <input
              v-model="newUsername"
              type="text"
              :placeholder="user?.username"
              autocomplete="username"
            />
            <p class="hint">{{ USERNAME_HINT }}</p>
            <p v-if="newUsername && usernameError" class="field-error">{{ usernameError }}</p>
          </div>

          <p v-if="usernameMsg" class="msg" :class="usernameMsgType">{{ usernameMsg }}</p>

          <button
            type="submit"
            class="btn-primary"
            :disabled="usernameLoading || !newUsername || !!usernameError"
          >
            {{ usernameLoading ? '保存中...' : '保存用户名' }}
          </button>
        </form>
      </div>

      <!-- 修改密码 -->
      <div class="card">
        <h2 class="card-title">修改密码</h2>
        <form @submit.prevent="handleUpdatePassword">
          <div class="form-group">
            <label>当前密码</label>
            <input v-model="oldPassword" type="password" autocomplete="current-password" />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input v-model="newPassword" type="password" autocomplete="new-password" />
            <p class="hint">{{ PASSWORD_HINT }}</p>
            <p v-if="newPassword && passwordError" class="field-error">{{ passwordError }}</p>
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <input v-model="confirmPassword" type="password" autocomplete="new-password" />
            <p v-if="confirmError" class="field-error">{{ confirmError }}</p>
          </div>

          <p v-if="passwordMsg" class="msg" :class="passwordMsgType">{{ passwordMsg }}</p>

          <button type="submit" class="btn-primary" :disabled="passwordLoading || !canSubmitPassword">
            {{ passwordLoading ? '保存中...' : '保存密码' }}
          </button>
        </form>
      </div>

      <!-- 退出登录 -->
      <div class="card">
        <button class="btn-danger" @click="handleLogout">退出登录</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api, getToken, setToken, setUser, getUser, type UserInfo } from '../api/client'
import {
  validateUsername,
  validatePassword,
  USERNAME_HINT,
  PASSWORD_HINT,
} from '../utils/validation'
import { resetSRSInit } from '../composables/useSRS'
import { resetExerciseInit } from '../composables/useExerciseProgress'

const router = useRouter()

// getUser() 返回的是 client.ts 里的响应式 ref，用 computed 包一层才能跟着变
const user = computed(() => getUser())
const isLoggedIn = computed(() => !!getToken())

// ========== 修改用户名 ==========

const newUsername = ref('')
const usernameLoading = ref(false)
const usernameMsg = ref('')
const usernameMsgType = ref<'ok' | 'err'>('ok')

const usernameError = computed(() =>
  newUsername.value ? validateUsername(newUsername.value) : null
)

async function handleUpdateUsername() {
  if (!newUsername.value || usernameError.value) return

  usernameLoading.value = true
  usernameMsg.value = ''

  try {
    const data = await api.put<{ token: string; user: UserInfo }>('/auth/username', {
      username: newUsername.value,
    })
    // token 里带着 username，必须一起换掉，否则导航栏会一直显示旧名字
    setToken(data.token)
    setUser(data.user)
    usernameMsgType.value = 'ok'
    usernameMsg.value = '用户名已更新'
    newUsername.value = ''
  } catch (e: any) {
    usernameMsgType.value = 'err'
    usernameMsg.value = e.message || '修改失败'
  } finally {
    usernameLoading.value = false
  }
}

// ========== 修改密码 ==========

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)
const passwordMsg = ref('')
const passwordMsgType = ref<'ok' | 'err'>('ok')

const passwordError = computed(() => {
  if (!newPassword.value) return null
  const err = validatePassword(newPassword.value)
  if (err) return err
  if (oldPassword.value && newPassword.value === oldPassword.value) {
    return '新密码不能与当前密码相同'
  }
  return null
})

const confirmError = computed(() => {
  if (!confirmPassword.value || !newPassword.value) return null
  return confirmPassword.value === newPassword.value ? null : '两次输入的新密码不一致'
})

const canSubmitPassword = computed(
  () =>
    !!oldPassword.value &&
    !!newPassword.value &&
    !passwordError.value &&
    !confirmError.value
)

async function handleUpdatePassword() {
  if (!canSubmitPassword.value) return

  passwordLoading.value = true
  passwordMsg.value = ''

  try {
    await api.put<{ ok: boolean }>('/auth/password', {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    })
    passwordMsgType.value = 'ok'
    passwordMsg.value = '密码已更新，下次登录请使用新密码'
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e: any) {
    passwordMsgType.value = 'err'
    passwordMsg.value = e.message || '修改失败'
  } finally {
    passwordLoading.value = false
  }
}

// ========== 退出登录 ==========

function handleLogout() {
  setToken(null)
  setUser(null)
  resetSRSInit()
  resetExerciseInit()
  router.push('/')
}
</script>

<style scoped lang="scss">
@use "sass:color";

$primary: #a3c1ad;
$primary-dark: color.adjust($primary, $lightness: -10%);
$bg-glass: rgba(255, 255, 255, 0.75);

.container {
  max-width: 560px;
  margin: 0 auto;
  padding: 32px 16px 60px;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.card {
  background: $bg-glass;
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  opacity: 0.8;
}

.guest {
  text-align: center;
  padding: 40px 24px;

  .placeholder {
    font-size: 14px;
    opacity: 0.5;
    margin-bottom: 20px;
  }

  .btn-primary {
    display: inline-block;
    width: auto;
    text-decoration: none;
    box-sizing: border-box;
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 14px;
  opacity: 0.6;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
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

.hint {
  font-size: 12px;
  opacity: 0.45;
  margin-top: 6px;
  line-height: 1.4;
}

.field-error {
  font-size: 12px;
  color: #ff6b6b;
  margin-top: 6px;
  line-height: 1.4;
}

.msg {
  font-size: 13px;
  margin-bottom: 14px;
  text-align: center;

  &.ok {
    color: #6bcb77;
  }

  &.err {
    color: #ff6b6b;
  }
}

.btn-primary {
  width: 100%;
  padding: 13px 24px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  background: linear-gradient(135deg, color.adjust($primary, $lightness: 6%), $primary-dark);
  color: #2c3e50;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-danger {
  width: 100%;
  padding: 12px 24px;
  border-radius: 999px;
  border: 1px solid rgba(255, 107, 107, 0.4);
  background: transparent;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 107, 107, 0.08);
  }
}
</style>
