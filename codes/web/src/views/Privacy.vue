<template>
  <div class="container">
    <h1 class="title">隐私政策</h1>
    <p class="updated">更新日期：2026-09-16</p>

    <div class="card">
      <p class="lead">
        本站（jplearning.palmsugar.cn，以下简称「本站」）是一个由个人开发者运营的日语学习工具网站
        （沪ICP备2026043380号-1）。
        我们重视你的隐私，本政策说明我们收集哪些信息、如何使用，以及你可以如何管理这些信息。
        使用本站即表示你已阅读并同意本政策。
      </p>

      <section>
        <h2>一、我们收集的信息</h2>

        <h3>1. 你主动提供的信息</h3>
        <ul>
          <li><strong>账号信息</strong>：注册时填写的用户名和密码。密码经过单向加密（bcrypt 哈希）后存储，<strong>我们无法查看你的原始密码</strong>。</li>
          <li><strong>联系方式</strong>：当你通过邮箱联系我们时，我们会收到你的邮箱地址及邮件内容。</li>
        </ul>

        <h3>2. 你使用服务时产生的信息</h3>
        <ul>
          <li><strong>学习数据</strong>：单词学习进度（复习次数、下次复习时间等）、错题记录、练习历史。<strong>这些数据用于同步你的学习进度</strong>，是本站核心功能的一部分。</li>
          <li><strong>微信登录标识</strong>：如果你使用微信登录，我们会通过微信开放接口获取你的 <code>openid</code>（用于识别账号的唯一标识）。我们<strong>不会</strong>获取你的微信昵称、头像、手机号或好友信息。</li>
        </ul>

        <h3>3. 自动收集的信息</h3>
        <ul>
          <li><strong>访问量统计</strong>：本站使用第三方统计服务 busuanzi（布丁统计）统计页面访问量，用于了解网站使用情况。该统计仅记录访问次数等汇总数据。</li>
          <li><strong>浏览器本地存储</strong>：登录凭证、学习进度等会保存在你浏览器的 localStorage 中，用于免登录和离线兜底。清除浏览器数据会一并清除这些内容。</li>
          <li><strong>服务器日志</strong>：服务器会记录请求日志（含 IP 地址、时间、请求路径），用于排查故障和防范滥用。</li>
        </ul>
      </section>

      <section>
        <h2>二、信息的使用</h2>
        <ul>
          <li>提供、维护和改进本站的学习功能</li>
          <li>在你的不同设备间同步学习进度</li>
          <li>保障账号安全，识别和防范异常访问</li>
          <li>回复你的咨询和反馈</li>
        </ul>
        <p class="note">我们<strong>不会</strong>将你的个人信息用于广告投放，也<strong>不会</strong>出售你的个人信息。</p>
      </section>

      <section>
        <h2>三、信息的共享</h2>
        <p>除以下情形外，我们不会向第三方提供你的个人信息：</p>
        <ul>
          <li><strong>第三方统计服务</strong>：busuanzi 会接收你的浏览器请求以完成访问量统计，其数据处理遵循该服务自身的隐私政策。</li>
          <li><strong>法律法规要求</strong>：根据法律法规、司法或行政机关的合法要求，我们可能需要提供相关信息。</li>
        </ul>
      </section>

      <section>
        <h2>四、信息的存储与安全</h2>
        <ul>
          <li>数据存储在中国境内的服务器上。</li>
          <li>密码采用 bcrypt 单向哈希存储；传输过程使用 HTTPS 加密。</li>
          <li>我们会在实现本政策所述目的所需的期限内保留你的信息，超出期限后将删除或匿名化处理。</li>
        </ul>
        <p class="note">
          请注意：互联网环境下不存在绝对安全的技术手段，请妥善保管你的账号密码，
          不要在不同网站使用相同密码。
        </p>
      </section>

      <section>
        <h2>五、你的权利</h2>
        <ul>
          <li><strong>修改信息</strong>：登录后可在「用户中心」自行修改用户名和密码。</li>
          <li><strong>查询与更正</strong>：如需查询或更正你的其他信息，可通过下方邮箱联系我们。</li>
          <li><strong>注销账号</strong>：如需删除账号及全部学习数据，请通过下方邮箱提出申请，我们会在核实身份后处理。</li>
        </ul>
      </section>

      <section>
        <h2>六、未成年人</h2>
        <p>
          本站是学习工具，面向所有年龄段的日语学习者。若你是不满 14 周岁的儿童，
          请在监护人陪同下阅读本政策，并在监护人同意后使用本站。
        </p>
      </section>

      <section>
        <h2>七、本政策的更新</h2>
        <p>
          本政策可能随功能调整而更新，更新后会在本页面公布并修改顶部的更新日期。
          如有重大变更，我们会在网站显著位置提示。
        </p>
      </section>

      <section>
        <h2>八、联系我们</h2>
        <p>
          对本政策或个人信息处理有任何疑问，请联系：
          <a href="mailto:palmsugar0729@foxmail.com">palmsugar0729@foxmail.com</a>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// 公开页面，无需登录
</script>

<style scoped lang="scss">
.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 16px 60px;
}

.title {
  font-size: 24px;
  margin-bottom: 6px;
  text-align: center;
}

.updated {
  font-size: 13px;
  opacity: 0.45;
  text-align: center;
  margin-bottom: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.lead {
  font-size: 14px;
  line-height: 1.9;
  opacity: 0.75;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  h2 {
    font-size: 16px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 14px;
    margin: 14px 0 8px;
    opacity: 0.8;
  }

  ul {
    padding-left: 20px;
    margin: 0 0 10px;
  }

  li {
    font-size: 13.5px;
    line-height: 1.95;
    opacity: 0.75;
  }

  p {
    font-size: 13.5px;
    line-height: 1.95;
    opacity: 0.75;
  }

  code {
    background: rgba(0, 0, 0, 0.05);
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12.5px;
  }

  a {
    color: #5a8a6e;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.note {
  background: rgba(255, 217, 61, 0.12);
  border-radius: 10px;
  padding: 12px 14px;
  margin-top: 10px;
}
</style>
