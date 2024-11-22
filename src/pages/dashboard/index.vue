<template>
  <div class="dashboard-container">
    <main class="flex w-full flex-col">
      <header class="header block w-full">
        <div class="title">
          <span>
            数据统计
          </span>
        </div>
      </header>
      <main class="flex w-full">
        <div class="block left w-40">
          <div class="title">
            <span>
              阅读量排行
            </span>
          </div>
        </div>
        <div class="block flex-1">
          <div class="title">
            <span>
              我的待审核
            </span>
          </div>
        </div>
      </main>
      <main class="flex w-full">
        <div class="block left w-40">
          <div class="title">
            <span>
              书籍发布数统计
            </span>
          </div>
        </div>
        <div class="block flex-1">
          <div class="title">
            <span>
              我的下载
            </span>
          </div>
        </div>
      </main>
    </main>
    <aside class="w-30 flex flex-col">
      <div class="block w-full account-info">
        <div class="title">
          <span>
            账号信息
          </span>
        </div>
      </div>
      <div class="block w-full flex-1">
        <div class="title">
          <span>
            通知公告
          </span>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>

</script>

<style
  lang="scss"
  scoped
>
.dashboard-container {
  padding: 20px 32px;
  width: 100vw;
  height: 100vh;
  background-color: #F6F3EE;
  display: flex;
  gap: 20px;
}
.account-info{
  height: 350px;
}
.block {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px 30px;
}

.w-30 {
  width: 30%;
}

.w-40 {
  width: 40%;
}

.w-full {
  width: 100%;
}

.flex-col {
  flex-direction: column;
}

.flex {
  display: flex;
  gap: 20px;
}

.flex-1 {
  flex: 1;
}
</style>