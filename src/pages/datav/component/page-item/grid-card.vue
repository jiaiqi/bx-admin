<template>
  <div class="grid" :style="'--grid-cols:' + pageItem.grid_json.max_cols" v-if="cardStyle === '上图下文'">
    <div class="grid-item" :class="{ 'no-image': !baseListItem.image }" v-for="(baseListItem, baseListIndex) in buttons"
      :key="baseListIndex" @click="onGridItem(baseListItem)" :custom-style="{ padding: '15rpx 0' }">
      <img :src="getImagePath(baseListItem.image)" style="width: 40px;height:40px;" alt="" srcset="">
      <span class="grid-text" style="padding: 10upx 0;color: #323232;">{{ baseListItem.label || baseListItem.child_name
      }}</span>
    </div>
  </div>
  <div class="grid" :style="'--grid-cols:' + pageItem.grid_json.max_cols" v-else-if="cardStyle === '仅图片'">
    <div class="grid-item" :class="{ 'no-image': !baseListItem.image }" v-for="(baseListItem, baseListIndex) in buttons"
      :key="baseListIndex" @click="onGridItem(baseListItem)">
      <img :src="getImagePath(baseListItem.image)" alt="" srcset="">
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  props: {
    pageItem: {
      type: Object
    },
  },
  computed: {
    buttons: function () {
      let type = this.pageItem?.grid_json?.grid_src
      let buttonList = []
      if (type == '组件子节点') {
        buttonList = this.pageItem?.child_json?.map(item => item)
      }
      if ((!buttonList || buttonList?.length === 0) && this.pageItem?.grid_json?.max_cols) {
        buttonList = []
        const length = this.pageItem?.grid_json?.max_cols
        for (let index = 0; index < length; index++) {
          buttonList.push({
            child_name: '按钮' + index,
          })
        }
      }
      return buttonList
    },
    cardStyle: function () {
      let style = this.pageItem?.grid_json?.card_style || ''
      return style
    }
  },
  methods: {
    // // jump 拦截处理权限
    // async jumpAction(jumpJson, itemData) {
    //   let rowData = itemData
    //   if (jumpJson) {
    //     let jumpOptions = ""
    //     let isLogin = uni.getStorageSync('isLogin')

    //     let pageNo = jumpJson?.dest_page_no
    //     let url = '/views/custom/index/index'
    //     let authJson = jumpJson.page_auth_json || null
    //     if (pageNo) {
    //       if (jumpJson?.tmpl_page_json?.file_path) {
    //         url = `${jumpJson?.tmpl_page_json?.file_path}?page_no=${pageNo}`
    //       }
    //       let id = rowData?.id || ''
    //       url = `${jumpJson?.tmpl_page_json?.file_path}?page_no=${pageNo}`
    //       if (jumpJson.cols_map_json && jumpJson.cols_map_json.to_type == 'URL') {
    //         let maps = jumpJson.cols_map_json.cols_map_json
    //         if (maps && rowData) {
    //           let parmes = ''
    //           for (let key in maps) {
    //             if (rowData?.hasOwnProperty(maps[key]) && (rowData[maps[key]] || rowData[maps[key]] == 0)) {
    //               parmes = `${parmes}&${key}=${rowData[maps[key]]}`
    //             }
    //           }
    //           // let maps = jump.cols_map_json.cols_map_json
    //           url = `${url}${parmes}`
    //         }
    //       } else if (jumpJson?.cols_map_json?.cols_map_detail_json?.length) {
    //         jumpJson?.cols_map_json?.cols_map_detail_json.forEach(item => {
    //           if (item.to_type === 'URL') {
    //             if (item.from_type == '常量') {
    //               url = `${url}&${item.col_to}=${item.col_from}`
    //             } else if (item.from_type === '页面') {
    //               url = `${url}&${item.col_to}=${this.queryOptions[item.col_from]}`
    //             } else if (rowData && rowData[item.col_from]) {
    //               url = `${url}&${item.col_to}=${rowData[item.col_from]}`
    //             }
    //           }
    //         })
    //       }

    //       if (!url.includes('id') && id) {
    //         url += `&id=${id}`
    //       }

    //     } else {
    //       console.log('无效的跳转页面')
    //     }


    //     let isJumpAuth = false
    //     if (authJson) {
    //       let type = authJson.in_cond || ''
    //       let authRoles = authJson.roles || ''
    //       let userRoles = sessionStorage.getItem('current_login_user')?.roles
    //       if (this.$store?.state?.user?.loginUserInfo?.roles) {
    //         userRoles = this.$store?.state?.user?.loginUserInfo?.roles
    //       }
    //       let noneAuthJump = authJson.jump_json || null
    //       let noneTipMsg = authJson.tip_msg || '暂无权限访问'
    //       if (type.indexOf('有权限时') !== -1 && authRoles) {
    //         authRoles = authRoles.split(',')

    //         let onRoles = userRoles.filter(role => new Set(authRoles).has(role));

    //         if (onRoles && onRoles.length > 0) {
    //           uni.navigateTo({
    //             url: `${url}`
    //           })
    //         } else if (onRoles && onRoles.length == 0) {
    //           // 没有获取授权 重新登录再检测下权限
    //           // uni.setStorageSync('isLogin', false)
    //           // await Vue.prototype.initLogin()
    //           // userRoles = uni.getStorageSync('login_user_info').roles
    //           // onRoles = userRoles.filter(role => new Set(authRoles).has(role));
    //           if (onRoles && onRoles.length == 0) {
    //             uni.showModal({
    //               title: '提示',
    //               content: `${noneTipMsg}`,
    //               confirmText: `刷新页面`,
    //               success: function (res) {
    //                 if (res.confirm) {
    //                   store.commit('SET_LOGIN_STATE', false)
    //                   store.commit('SET_LOGIN_USER', null)
    //                   store.commit('setWxAppUser', null)
    //                   store.commit('SET_TICKET', '')

    //                   uni.setStorageSync('isLogin', false)
    //                   uni.removeStorageSync('backUrl')
    //                   uni.removeStorageSync('bx_auth_ticket')
    //                   uni.removeStorageSync('login_user_info')
    //                   uni.removeStorageSync('wxAppUser')
    //                   uni.removeStorageSync('redirect_page')
    //                   uni.reLaunch({
    //                     url: '/views/custom/index/index'
    //                   })
    //                 }
    //               }
    //             });
    //           }

    //         }
    //         console.log('authRoles', authRoles, userRoles, onRoles)
    //       } else {
    //         uni.navigateTo({
    //           url: `${url}`
    //         })
    //       }
    //     } else {
    //       const addTabByUrl = function (url, tab_title, urlParams, type) {
    //         url = url || common_page_path[type] + '?data=' + urlParams;
    //         let page = {
    //           title: tab_title || "新标页签",
    //           url,
    //         };

    //         if (window.top.tab && window.top.tab.addTab) {
    //           window.top.tab.addTab(page);
    //         } else {

    //           let strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
    //           let newWindow = window.open(url, "CNN_WindowName", strWindowFeatures)
    //           newWindow.document.title = tab_title;
    //         }
    //       }
    //       // if (jumpJson?.obj_type === '微信小程序') {
    //       //   if (jumpJson?.wxxcx_json?.path && jumpJson.wxxcx_json?.appid) {
    //       //     let path = jumpJson?.wxxcx_json?.path
    //       //     if (jumpJson?.wxxcx_json?.getCode?.url) {
    //       //       let req = jumpJson?.wxxcx_json?.getCode?.req || {}
    //       //       let rUrl = jumpJson?.wxxcx_json?.getCode?.url
    //       //       const res = await this.$http.post(rUrl, req)
    //       //       if (res?.data?.data) {
    //       //         const data = res.data.data
    //       //         path = this.renderStr(path, {
    //       //           data,
    //       //           ...this.queryOptions,
    //       //         })
    //       //       }
    //       //     }
    //       //     uni.navigateToMiniProgram({
    //       //       appId: jumpJson.wxxcx_json?.appid,
    //       //       path,
    //       //       envVersion: 'trial'
    //       //     })
    //       //   }
    //       //   return
    //       // }

    //       addTabByUrl(url)
    //     }
    //     console.log(jumpJson)

    //   } else {
    //     console.log('jumpJson 配置错误 或 未获取到有效的 jump_json')
    //   }
    // },
    onGridItem(item) {
      let jumpJson = item?.jump_json || null
      this.jumpAction(jumpJson, item)
    }
  }
}
</script>

<style scoped lang="scss">
.grid {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-column-gap: 10px;

  &-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    text-align: center;
    img {
      width: 100%;
      min-height: 40px;
      margin: 0 auto;
      // background-color: #333;

      //flex: 1;
    }

    &.no-image {
      img {
        background-color: #999;
        border-radius: 6px;
      }
    }

    .grid-text {
      margin-top: 10px;
    }
  }
}</style>
