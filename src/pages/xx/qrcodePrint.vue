<template>
  <div class="list-wrap print-layout">
    <div class="header">
      <div style="font-weight: bold;">荣誉标签列表</div>
      <el-button size="mini" @click="toPrint" v-if="printList.length">打印</el-button>
    </div>
    <el-checkbox-group v-model="checkList" class="checkbox-group">
      <div class="list-item" v-for="item in list" :class="{ 'on-print': checkList && checkList.includes(item.index_no) }"
        :key="item.id">
        <div class="img" :style="setBg(item)">
          <img :src="getQrcode(item)" alt="" class="qrcode">
        </div>
        <div style="text-align: center;margin-top: 12px;margin-bottom: 0" class="check-box">
          <el-checkbox :label="item.index_no">{{ item.index_name }}</el-checkbox>
          <div style="margin-top: 10px;" v-if="checkList && checkList.includes(item.index_no)">
            <span style="font-size: 12px;">
              打印数量：
            </span>
            <el-input-number size="mini" v-model="checkListNumber[item.index_no]"></el-input-number>
          </div>
        </div>
      </div>
    </el-checkbox-group>
    <div class="list-box">
      <div class="list-item" v-for="(item, index) in printList"
        :class="{ 'on-print': checkList && checkList.includes(item.index_no) }" :key="index">
        <img :src="getImagePath(item.picture)" alt="" class="bg">
        <img :src="getQrcode(item)" alt="" class="qrcode">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      checkList: [],
      checkListNumber: {}
    }
  },
  computed: {
    printList() {
      return this.list.filter(item => this.checkList?.includes(item.index_no)).reduce((pre, cur) => {
        if (this.checkListNumber[cur.index_no]) {
          for (let index = 0; index < this.checkListNumber[cur.index_no]; index++) {
            pre.push({
              index_no: cur.index_no,
              index_name: cur.index_name,
              picture: cur.picture
            })
          }
        }
        return pre
      }, [])
    }
  },
  methods: {
    toPrint() {
      window.print()
    },
    getQrcode(item) {
      return `${this.serviceApi().qrcode
        }?content=${encodeURIComponent(item.index_no)}&width=140`
    },
    setBg(item) {
      return "background-image: url(" + this.getImagePath(item.picture) + ")";
    },
    getList() {
      const url = `${window.backendIpAddr}/ledu/select/srvledu_evaluate_index_label_select`;
      const req = {
        serviceName: "srvledu_evaluate_index_label_select",
        colNames: ["*"],
        page: { pageNo: 1, rownumber: 100 },
        order: [],
        use_type: "list",
        query_source: "list_page",
      };
      this.$http.post(url, req).then(res => {
        if (res?.data?.state === 'SUCCESS') {
          this.list = res.data.data
          if (res.data.data.length) {
            res.data.data.forEach(item => {
              this.$set(this.checkListNumber, item.index_no, 1)
            });
          }
        }
      })
    },
  },
  created() {
    this.getList();
  },
};
</script>

<style lang="scss" scoped>
.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  padding: 0 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  padding: 20px 20px 0;
  margin-bottom: 10px;
}

.list-item {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  margin-right: 20px;
  margin-bottom: 20px;

  .el-checkbox {
    margin-bottom: 0;
  }

  .img {
    width: 276px;
    height: 585px;
    background-size: 100% 100%;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .qrcode {
    width: 140px;
    height: 140px;
  }
}

.list-box {
  display: none;
  flex-wrap: wrap;
  padding: 0;

  .list-item {
    padding: 0;
    margin: 0;
    border: none;
    height: 105mm;
    width: 49.5mm;
    position: relative;
    justify-content: center;
    align-tracks: center;

    .bg {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }

    .qrcode {
      z-index: 2;
      display: inline-block;
      position: absolute;
      top: calc(50% - 70px);
      left: calc(50% - 70px);
    }
  }
}

@media print {
  @page {
    margin: 0; // 可以控制打印布局（四周边距）
  }

  .list-box {
    display: flex;
  }

  .el-checkbox-group,
  .list-item {
    padding: 0;
    margin: 0;
    // display: none;
    height: 105mm;
    width: 49.5mm;
  }

  .on-print {
    display: inline-block;
  }

  .header,
  .checkbox-group {
    display: none;
  }

  // .print-layout {
  //   -webkit-print-color-adjust: exact;
  //   print-color-adjust: exact;
  //   width: 100vw !important;
  // }
}
</style>
