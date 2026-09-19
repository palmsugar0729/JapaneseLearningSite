<template>
  <div class="app">
    <nav class="nav">
      <div class="nav-inner">
        <router-link to="/" class="nav-brand">🎌 日语学习</router-link>
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
      <div class="footer-inner">
        <!-- 政策链接（左）-->
        <div class="footer-item footer-links">
          <router-link to="/privacy">隐私政策</router-link>
          <span class="sep">·</span>
          <router-link to="/contact">联系我们</router-link>
        </div>

        <!-- 备案信息（中）-->
        <div class="footer-item footer-beian">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            沪ICP备2026043380号-1
          </a>
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=31011302009700"
            rel="noreferrer"
            target="_blank"
          >
            <img src="/beian.png" alt="" />
            沪公网安备31011302009700号
          </a>
        </div>

        <!-- 访问统计（右，busuanzi）-->
        <div class="footer-item footer-stats">
          <span id="busuanzi_container_site_pv" style="display: none">
            本站总访问量<span id="busuanzi_value_site_pv"></span>次
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getToken, setToken, setUser, getUser } from './api/client'
import { initSRS, resetSRSInit } from './composables/useSRS'
import { initExercise, resetExerciseInit } from './composables/useExerciseProgress'

const router = useRouter()

// getUser() 返回 client.ts 里的响应式 ref，包成 computed 才能跟着 setUser() 变
// （之前用 ref 存快照，改了用户名导航栏不会更新）
const user = computed(() => getUser())
const isLoggedIn = computed(() => !!getToken())

async function handleLogout() {
  setToken(null)
  setUser(null)
  resetSRSInit()
  resetExerciseInit()
  // 退出后身份变回匿名，重新读回本机进度。不重读的话内存里是空的，
  // 用户随便点一下触发 saveAll() 就会把 localStorage 里的匿名进度冲掉。
  await Promise.all([initSRS(), initExercise()])
  router.push('/')
}

onMounted(async () => {
  // ⚠️ 不能只在有 token 时初始化：匿名用户同样要读回 localStorage，
  // 否则刷新一次进度全丢（见 useSRS.initSRS 的注释）
  await Promise.all([initSRS(), initExercise()])
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

// 深色底 + 奶白字。本站底色是浅绿渐变，亮色字压在它上面对比度极低：
// #999 只有 1.46~1.86:1，换成奶白色反而更差（1.40~1.78:1），
// 所以加一层半透明深色底，奶白字压在这层底上是 6.66~7.06:1（达 WCAG AA）
$footer-bg: rgba(44, 62, 80, 0.82); // 取自站内文字色 #2c3e50
$footer-text: #f2f6f3;

.footer {
  padding: 18px 16px;
  font-size: 12px;
  background: $footer-bg;
  color: $footer-text;

  a {
    color: $footer-text;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #fff;
      text-decoration: underline;
    }
  }
}

.footer-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 16px;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

// 左右各占一份，中间的备案号才是真正居中（只靠 space-between 会偏）
.footer-links {
  flex: 1;
}

.footer-stats {
  flex: 1;
  justify-content: flex-end;
  white-space: nowrap;
}

.footer-beian a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

// 原图 36×40，按 16px 高显示并保持比例
.footer-beian img {
  height: 16px;
  width: auto;
  display: block;
}

.footer-links .sep {
  opacity: 0.55;
}

// 窄屏转上下结构，备案号在上、政策链接在下
@media (max-width: 640px) {
  .footer-inner {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .footer-links,
  .footer-stats {
    flex: 0 0 auto;
    justify-content: center;
  }

  .footer-beian {
    order: -1;
  }
}
</style>
