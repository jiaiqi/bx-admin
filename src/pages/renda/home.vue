<template>
  <div class="page-container">
    <div class="top">
      <div class="top-left">
        <div class="item">
          <el-card class="box-card">
            <div slot="header" class="">
              <span>待办事项</span>
            </div>
            <div class="menu-box">
              <div class="" v-for="item in 5">
                <el-badge :value="2" class="item" type="error">
                  <div class="menu-item">
                    <img
                      src="@/pages/renda/static/img/icon1.png"
                      alt=""
                      class="icon"
                    />
                    <span>议案建议</span>
                  </div>
                </el-badge>
              </div>
            </div>
          </el-card>
        </div>
        <div class="item">
          <el-card class="box-card">
            <div slot="header" class="flex justify-between">
              <span>通知/公告</span>
              <el-link type="danger">更多</el-link>
            </div>
            <div class="list-box">
              <div class="list-item flex items-center py-2px" v-for="item in 5">
                <i class="el-icon-arrow-right text-red"></i>
                <div class="flex flex-1 px-10px">
                  <span class="mr-10px">[通知]</span>
                  <span class="flex-1">关于2022年11月1日,...</span>
                  <span class="">2022-11-01</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      <div class="top-right item">
        <el-card class="box-card">
          <div slot="header" class="flex justify-between">
            <span>工作动态</span>
            <el-link type="danger">更多</el-link>
          </div>
          <div>
            <el-carousel trigger="click" height="200px">
              <el-carousel-item v-for="item in 4" :key="item">
                <img
                  src="@/pages/renda/static/img/b.jpg"
                  alt=""
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    background-color: #cb0819;
                  "
                />
              </el-carousel-item>
            </el-carousel>
            <div class="list-box py-10px">
              <div
                class="list-item flex items-center py-2px"
                v-for="item in 5"
              >
                <i class="el-icon-arrow-right text-red"></i>
                <div class="flex flex-1 px-10px justify-between">
                  <span class="mr-10px cursor-pointer">召开法治政府建设工作会议</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    <div class="bottom">
      <div class="bottom-item item">
        <el-card class="box-card">
          <div slot="header" class="flex justify-between">
            <span>规章制度</span>
            <el-link type="danger">更多</el-link>
          </div>
          <div class="list-box">
            <div class="list-item flex items-center py-10px" v-for="item in 5">
              <i class="el-icon-star-on text-red"></i>
              <div class="flex flex-1 px-10px justify-between">
                <span class="mr-10px">人大代表小组活动制度</span>
                <span class="">2022-11-01</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      <div class="bottom-item item">
        <el-card class="box-card">
          <div slot="header" class="flex justify-between">
            <span>代表风采</span>
            <el-link type="danger">更多</el-link>
          </div>
          <div class="list-box">
            <div class="list-item flex items-center py-2px" v-for="item in 5">
              <i class="el-icon-arrow-right text-red"></i>
              <div class="flex flex-1 px-10px justify-between">
                <span class="mr-10px">人大代表履职能力提升培训</span>
                <img
                  src="@/pages/renda/static/img/a.jpg"
                  alt=""
                  class="right-img"
                />
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.text-red {
  color: #f56c6c;
}
.mr-10px {
  margin-right: 10px;
}
.p {
  &y-10px {
    padding-top: 10px;
    padding-bottom: 10px;
  }
  &y-2px {
    padding-top: 2px;
    padding-bottom: 2px;
  }
  &x-10px {
    padding-left: 10px;
    padding-right: 10px;
  }
  &r-10px {
    padding-right: 10px;
  }
}
.cursor-pointer{
  cursor: pointer;
}
.flex {
  display: flex;
}
.flex-1 {
  flex: 1;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.page-container {
  display: flex;
  padding: 20px;
  flex-wrap: wrap;
  box-sizing: border-box;
  height: calc(100% - 20px);
  width: 100%;
  gap: 20px;
  flex-wrap: wrap;

  .top {
    height: 60%;
    display: flex;
    gap: 20px;
    width: 100%;
    .top-left {
      display: flex;
      flex-direction: column;
      gap: 20px;
      .item {
        &:first-child {
          height: 40%;
        }
        &:last-child {
          height: 60%;
        }
      }
    }
    .top-left,
    .top-right {
      width: 50%;

      .item {
        height: 50%;
      }
    }
  }
  .bottom {
    height: 40%;
    display: flex;
    gap: 20px;
    width: 100%;
    .bottom-item {
      width: 50%;
    }
  }
  .item {
    ::v-deep .el-card {
      height: 100%;
      .el-card__body {
        height: unset;
        padding: 10px;
      }
    }
    .menu-box {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      .menu-item {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 10px;
        text-align: center;
      }
      .icon {
        width: 40px;
        height: 40px;
        display: inline-block;
      }
      // .badge{
      //   right: 0;
      //   top: 0;
      //   width: 20px;
      //   height: 20px;
      //   border-radius: 20px;
      //   background-color: #409EFF;
      // }
    }
  }
}
.list-item {
  .right-img {
    height: 45px;
  }
}
</style>
