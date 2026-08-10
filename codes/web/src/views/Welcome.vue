<template>
  <div class="welcome">
    <h1 class="title">欢迎来到本站</h1>
    <p class="subtitle">选择一个模块开始学习</p>

    <div class="entries">
      <router-link to="/word" class="entry-card">
        <div class="entry-icon">🎌</div>
        <h3>日语学习</h3>
        <p>SM-2 间隔重复背单词 · JLPT N5~N1 · 练习题库</p>
      </router-link>

      <div class="entry-card disabled">
        <div class="entry-icon">🔮</div>
        <h3>未来开放</h3>
        <p>更多学习模块即将上线，敬请期待</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Welcome page — 公开页面
</script>

<style scoped lang="scss">
.welcome {
  max-width: 560px;
  margin: 0 auto;
  padding: 80px 16px 40px;
  text-align: center;
}

.title {
  font-size: 32px;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 15px;
  opacity: 0.5;
  margin-bottom: 40px;
}

.entries {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.entry-card {
  flex: 1;
  max-width: 240px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px 20px;
  text-decoration: none;
  color: #2c3e50;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;

  &:hover:not(.disabled) {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .entry-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 18px;
    margin-bottom: 8px;
  }

  p {
    font-size: 13px;
    opacity: 0.55;
    line-height: 1.5;
  }

  &.disabled {
    opacity: 0.45;
    cursor: default;
  }
}

@media (max-width: 480px) {
  .entries {
    flex-direction: column;
    align-items: center;
  }
  .entry-card {
    max-width: 100%;
    width: 100%;
  }
}
</style>
