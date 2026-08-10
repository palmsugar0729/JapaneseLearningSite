<template>
  <view class="container">
    <view class="header">
      <text class="title">注册账号</text>
    </view>

    <view class="card">
      <view class="form-group">
        <text class="form-label">用户名</text>
        <input
          class="form-input"
          v-model="username"
          placeholder="请输入用户名"
          placeholder-style="color: #ccc"
        />
      </view>

      <view class="form-group">
        <text class="form-label">密码</text>
        <input
          class="form-input"
          v-model="password"
          type="password"
          placeholder="请输入密码（至少6位）"
          placeholder-style="color: #ccc"
        />
      </view>

      <view class="form-group">
        <text class="form-label">确认密码</text>
        <input
          class="form-input"
          v-model="confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          placeholder-style="color: #ccc"
        />
      </view>

      <view class="btn btn-primary mt-lg" @click="handleRegister">
        <text>{{ loading ? '注册中...' : '注册' }}</text>
      </view>

      <view class="flex-center mt-base">
        <text class="text-sm text-secondary">已有账号？</text>
        <text class="text-sm text-primary" @click="goBack">去登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/api/client'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

async function handleRegister() {
  if (!username.value || !password.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  if (password.value.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' })
    return
  }
  if (password.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }
  loading.value = true
  try {
    await api.post('/auth/register', {
      username: username.value,
      password: password.value,
    })
    uni.showToast({ title: '注册成功，请登录', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (e: any) {
    uni.showToast({ title: e.message || '注册失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.header {
  padding: 60rpx 0 36rpx;
  text-align: center;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #A3C1AD;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  margin-bottom: 12rpx;
  color: #666;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}
</style>
