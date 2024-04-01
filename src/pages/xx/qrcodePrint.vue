<template>
  <div class="list-wrap print-layout">
    <div class="header">
      <div style="font-weight: bold">荣誉标签列表</div>
      <el-button size="mini" @click="toPrint" v-if="_printList.length">打印</el-button>
    </div>
    <el-checkbox-group v-model="checkList" class="checkbox-group">
      <div class="list-item" v-for="item in list"
           :class="{ 'on-print': checkList && checkList.includes(item.index_no) }"
           :key="item.id">
        <div class="img" :style="setBg(item)">
          <img :src="getQrcode(item)" alt="" class="qrcode"/>
          <div class="note">
            {{ item.note || "" }}
          </div>
        </div>
        <div style="text-align: center; margin-top: 12px; margin-bottom: 0" class="check-box">
          <el-checkbox :label="item.index_no">{{
              item.index_name
            }}
          </el-checkbox>
          <div style="margin-top: 10px" v-if="checkList && checkList.includes(item.index_no)">
            <span style="font-size: 12px"> 打印数量： </span>
            <el-input-number size="mini" v-model="checkListNumber[item.index_no]"></el-input-number>
          </div>
        </div>
      </div>
    </el-checkbox-group>
    <div class="list-box">
      <div class="list-item" :class="{ 'on-print': checkList && checkList.includes(item.index_no) }" :key="index"
           v-for="(item, index) in printList">
        <img :src="getImagePath(item.picture)" alt="" class="bg"/>
        <img :src="item.qrcodeUrl" alt="" class="qrcode"/>
        <div class="note">{{ item.note || "" }}</div>
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
      printList: [],
      checkListNumber: {},
    };
  },
  computed: {
    _printList() {
      return this.list
          .filter((item) => this.checkList?.includes(item.index_no))
          .reduce((pre, cur) => {
            if (this.checkListNumber[cur.index_no]) {
              for (
                  let index = 0;
                  index < this.checkListNumber[cur.index_no];
                  index++
              ) {
                pre.push({
                  index_no: cur.index_no,
                  index_name: cur.index_name,
                  picture: cur.picture,
                  note: cur.note,
                  school_no: cur.school_no,
                });
              }
            }
            return pre;
          }, []);
    },
  },
  methods: {
    async toPrint() {
      const list = await this.addchild()
      if (Array.isArray(list) && list.length) {
        this.printList = list.map(item => {
          const data = this.list.find(e => e.index_no === item.index_no)
          const str = encodeURIComponent(`a:${item.index_no};b:${item.index_no_child};c:${item.school_no};d:${data.index_name};`)
          // str.split(';').reduce((pre, cur) => {
          //   let arr = cur.split(':')
          //   pre[arr[0]] = arr[1]
          //   return pre
          // }, {})
          return {
            // index_no: item.index_no,
            // index_no_child: item.index_no_child,
            index_name: data?.index_name,
            picture: data?.picture,
            note: data?.note,
            // school_no: item.school_no,
            qrcodeUrl: `${this.serviceApi().qrcode}?content=${str}&width=140`
          }
        })
      }
      setTimeout(() => {
        window.print();
      }, 1000);
    },
    getQrcode(item) {
      return `${this.serviceApi().qrcode}?content=${encodeURIComponent(
          JSON.stringify({
            a: item.index_no,
            b: item.index_no_child
          })
      )}&width=140`;
    },
    setBg(item) {
      return "background-image: url(" + this.getImagePath(item.picture) + ")";
    },
    async addchild() {
      const url = `${window.backendIpAddr}/ledu/add/srvledu_evaluate_index_child_label_add`;
      const req = [
        {
          serviceName: "srvledu_evaluate_index_child_label_add",
          condition: [],
          data: this._printList.map(item => {
            return {
              school_no: item.school_no,
              index_no: item.index_no,
            }
          })

        },
      ];
      const res = await this.$http.post(url, req)
      if (res?.data?.state === 'SUCCESS') {
        return res.data?.response?.[0]?.response.effect_data
      }
    },
    getList() {
      const url = `${window.backendIpAddr}/ledu/select/srvledu_evaluate_index_label_select`;
      const req = {
        serviceName: "srvledu_evaluate_index_label_select",
        colNames: ["*"],
        page: {pageNo: 1, rownumber: 100},
        order: [],
        use_type: "list",
        query_source: "list_page",
      };
      this.$http.post(url, req).then((res) => {
        if (res?.data?.state === "SUCCESS") {
          this.list = res.data.data;
          if (res.data.data.length) {
            res.data.data.forEach((item) => {
              this.$set(this.checkListNumber, item.index_no, 1);
            });
          }
        }
      });
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
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .note {
    z-index: 2;
    display: inline-block;
    margin-top: 10px;
    width: 100%;
    text-align: center;
    height: 20px;
    font-size: 14px;
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
    // height: 105mm;
    // width: 49.5mm;
    position: relative;
    justify-content: center;
    align-items: center;
    width: calc((100vw / 4) - 3mm / 4) !important;
    height: calc((100vh / 3) - 2mm / 3) !important;
    margin-right: 1mm;
    margin-bottom: 1mm;

    &:nth-child(4n) {
      margin-right: 0;
    }

    &:nth-child(9),
    &:nth-child(10),
    &:nth-child(11),
    &:nth-child(12) {
      margin-bottom: 0;
    }

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

    .note {
      z-index: 2;
      display: inline-block;
      position: absolute;
      font-size: 12px;
      top: calc(50% + 70px);
      width: 100%;
      text-align: center;
    }
  }
}

@media print {
  @page {
    margin: 0; // 可以控制打印布局（四周边距）
    padding: 0;
    // width: 297mm;
    // height: 210mm;
  }

  .list-box {
    display: flex;
    // transform: rotate(90deg);
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
