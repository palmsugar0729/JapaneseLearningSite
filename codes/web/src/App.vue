<template>
  <div class="app">
    <nav class="nav">
      <div class="nav-inner">
        <router-link to="/word" class="nav-brand">🎌 日语学习</router-link>
        <div class="nav-links">
          <router-link to="/word">背单词</router-link>
          <router-link to="/exercise">刷题</router-link>
        </div>
        <div class="nav-right">
          <template v-if="isLoggedIn">
            <router-link to="/user" class="nav-btn">用户中心</router-link>
            <span class="nav-username">{{ user?.username }}</span>
            <button class="nav-btn" @click="handleLogout">退出</button>
          </template>
          <template v-else>
            <router-link to="/user" class="nav-btn">用户中心</router-link>
            <router-link to="/login" class="nav-btn">登录</router-link>
            <router-link to="/register" class="nav-btn nav-btn-primary">注册</router-link>
          </template>
        </div>
      </div>
    </nav>
    <main class="main">
      <router-view />
    </main>
    <footer class="footer">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
        沪ICP备2026043380号
      </a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getToken, setToken, setUser, getUser } from './api/client'
import { initSRSFromServer, resetSRSInit } from './composables/useSRS'
import { initExerciseFromServer, resetExerciseInit } from './composables/useExerciseProgress'

const router = useRouter()
const user = ref(getUser())
const isLoggedIn = computed(() => !!getToken())

async function handleLogout() {
  setToken(null)
  setUser(null)
  resetSRSInit()
  resetExerciseInit()
  user.value = null
  router.push('/')
}

onMounted(async () => {
  if (getToken()) {
    user.value = getUser()
    await Promise.all([initSRSFromServer(), initExerciseFromServer()])
  }
})
</script>

<style lang="scss">
@use "sass:color";
$primary: #a3c1ad;

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.nav {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
  height: 48px;
  padding: 0 20px;
}

.nav-brand {
  font-weight: bold;
  font-size: 15px;
  color: #2c3e50;
  text-decoration: none;
  white-space: nowrap;
}

.nav-links {
  display: flex;
  gap: 14px;
  flex: 1;

  a {
    font-size: 13px;
    color: #2c3e50;
    opacity: 0.65;
    text-decoration: none;
    transition: opacity 0.2s;
    white-space: nowrap;

    &:hover,
    &.router-link-active {
      opacity: 1;
    }
  }
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-username {
  font-size: 12px;
  opacity: 0.5;
}

.nav-btn {
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  color: #2c3e50;
  text-decoration: none;
  opacity: 0.65;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    opacity: 1;
    border-color: rgba(0, 0, 0, 0.25);
  }
}

.nav-btn-primary {
  background: $primary;
  color: #fff;
  border-color: transparent;
  opacity: 1;

  &:hover {
    background: color.adjust($primary, $lightness: -5%);
  }
}

.main {
  flex: 1;
  padding: 24px 16px;
}

.footer {
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: #999;

  a {
    color: #999;
    text-decoration: none;

    &:hover {
      color: #666;
    }
  }
}
</style>
