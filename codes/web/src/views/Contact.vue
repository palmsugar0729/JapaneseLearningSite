<template>
  <div class="container">
    <h1 class="title">联系我们</h1>

    <div class="card">
      <p class="intro">
        使用中遇到问题、发现数据错误，或者有功能建议，欢迎通过下面的方式联系。
        个人项目，回复可能不及时，请见谅。
      </p>

      <div class="contact-item">
        <span class="contact-label">邮箱</span>
        <a class="contact-value" href="mailto:palmsugar0729@foxmail.com">
          palmsugar0729@foxmail.com
        </a>
      </div>

      <div class="contact-item">
        <span class="contact-label">网站</span>
        <a class="contact-value" href="https://jplearning.palmsugar.cn/" target="_blank" rel="noopener noreferrer">
          jplearning.palmsugar.cn
        </a>
      </div>

      <div class="tips">
        <h2>反馈建议</h2>
        <ul>
          <li>题目或单词数据有误：请注明题号（如 <code>ex-001</code>）或单词 ID（如 <code>n5-001</code>）</li>
          <li>页面异常：说明浏览器和操作步骤，有截图更好</li>
          <li>账号相关：请用注册邮箱/用户名说明情况，<strong>不要直接发送密码</strong></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 公开页面，无需登录
</script>

<style scoped lang="scss">
.container {
  max-width: 640px;
  margin: 0 auto;
  padding: 40px 16px 60px;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.intro {
  font-size: 14px;
  line-height: 1.8;
  opacity: 0.75;
  margin-bottom: 24px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-of-type {
    border-bottom: none;
  }
}

.contact-label {
  font-size: 14px;
  opacity: 0.55;
  min-width: 48px;
}

.contact-value {
  font-size: 15px;
  color: #5a8a6e;
  text-decoration: none;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
  }
}

.tips {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);

  h2 {
    font-size: 15px;
    margin-bottom: 12px;
    opacity: 0.8;
  }

  ul {
    padding-left: 20px;
    margin: 0;
  }

  li {
    font-size: 13px;
    line-height: 1.9;
    opacity: 0.7;
  }

  code {
    background: rgba(0, 0, 0, 0.05);
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12px;
  }
}
</style>
