<template>
  <div class="customhome-container" @dragenter="dragDefFn($event)" @dragover="dragDefFn($event)">
    <div class="customhome-header">
      <div>head</div>
    </div>
    <div class="cushome-sidebar">
      <div v-for="pageItem in comList" @drag="drag" @dragend="dragend(pageItem)" class="com-item" draggable="true"
        unselectable="on">
        <img :src="getImagePath(pageItem.example)" alt="" style="display: inline-block; width: 100%;">
        <span>{{ pageItem.com_type_name }}</span>
        <span>{{ pageItem.com_type }}</span>
      </div>
    </div>
    <div class="cushome-right">
      <el-button size="mini" type="primary" @click="saveFn">保存</el-button>
    </div>
    <div class="cushome-content" id="content">
      <div class="custom-design" id="custom-design">
        <!-- <div class="custom-design" id="custom-design" :style="stylefn(styleJson)"> -->
        <grid-layout ref="gridlayout" :layout.sync="layout" :col-num="12" :row-height="30" :is-draggable="true"
          :is-resizable="true" :is-mirrored="false" :vertical-compact="true" :margin="[20, 20]"
          :use-css-transforms="true" @layout-updated="layoutUpdatedEvent">
          <div class="grid-container" id="grid-container" :style="bjStyles"></div>
          <grid-item v-for="(item, index) in layout" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i"
            :key="item.i" @moved="movedEvent" class="gridItem" :style="stylefn(layoutJson.style_json)">
            <span class="remove" @click.stop="removeItem(item.i)">x</span>
            <div v-if="item.isLeftBarItem">{{ item.data.com_type }}</div>
            <!-- <page-item v-if="item.isLeftBarItem" :pageItem="item.data"></page-item> -->
            <div v-else>
              <page-item v-for="data in item.data" v-if="index + 1 === data.layout_seq" :pageItem="data"></page-item>
            </div>
          </grid-item>
        </grid-layout>
      </div>
    </div>

    <!-- 移动组件 start -->
    <div class="moveCon d-flex" v-if="moveShow" :style="moveStyle">
      <i class="rowIcon el-icon-folder-remove"></i>
      <div class="item-name">{{ moveData.title }}</div>
    </div>
    <!-- 移动组件 end -->
  </div>
</template>

<script>
import { GridLayout, GridItem } from 'vue-grid-layout'
import PageItem from '@/components/page-item/page-item'
import {
  formatStyleData
} from '@/common/common.js'

let mouseXY = { "x": null, "y": null }
let DragPos = { "x": null, "y": null, "w": 1, "h": 1, "i": null }

export default {
  components: {
    GridLayout,
    GridItem,
    PageItem,
  },
  data() {
    return {
      pageInfo: null,
      styleJson: null,
      layoutJson: null,
      comJson: [],
      comList: [],
      options: [
        {
          value: "1",
          label: "合同报表",
        },
        {
          value: "2",
          label: "结算报表",
        },
      ], //左侧分类选项
      selectors: [
        {
          id: "1",
          title: "合同报表",
          child: [
            {
              title: "表格1/1",
              id: "1-1",
              move: true,
              type: "table",
            },
            {
              title: "柱状图1/2",
              id: "1-2",
              move: true,
              type: "bar",
            },
          ],
        },
        {
          id: "2",
          title: "结算报表",
          child: [
            {
              title: "折线图2/1",
              id: "2-1",
              move: true,
              type: "line",
            },
            {
              title: "饼图2/2",
              id: "2-2",
              move: true,
              type: "pie",
            },
          ],
        },
      ], //menu数据
      designData: { layoutCon: [], layoutData: [] }, //容器内容
      bjStyles: {}, //栅格样式
      curDesign: "", //点击容器组件样式
      rowheight: 30, //默认一格高度
      moveShow: false, //显示移动元素
      moveStyle: {}, //显示移动元素的位置
      mouseFalg: false, //按下的开关
      mouseLeft: 0, //鼠标距离x轴位置
      mouseTop: 0, //鼠标距离y轴位置
      designLeft: 0, //自定义容器距离x轴位置
      designTop: 0, //自定义容器距离y轴位置
      moveData: {}, //元素内容
      layout: [
        // i: 元素的ID（如果位置重叠，使用id体现元素先后顺序）
        // x: 元素位于第几列（可配置初始位置）
        // y: 元素位于第几行（可配置初始位置）
        // w: 元素的初始宽度（值为colWidth的倍数，最大值12/24）
        // h: 元素的初始高度（值为rowHeight的倍数，值任意大）
        // { "x": 0, "y": 0, "w": 4, "h": 12, "i": "0", type: 'videoCard' },
        // { "x": 5, "y": 0, "w": 6, "h": 6, "i": "1", type: 'currentInfo' },
      ],
    };
  },
  created() {
    if (this.$route.query.pageNo) {
      const pageNo = this.$route.query.pageNo
      this.initPage(pageNo)
    }
  },
  mounted() {
    this.getComList()
    document.addEventListener("dragover", function (e) {
      mouseXY.x = e.clientX;
      mouseXY.y = e.clientY;
    }, false);

    this.initDesign();
    this.moveMousemove();
    this.moveMouseup();
    window.onclick = () => {
      this.curDesign = "";
    };
  },
  methods: {
    stylefn(style) {
      if (style) {
        return formatStyleData(style)
      }
    },
    saveFn() {
      console.log(this.layout)
    },
    async initPage(no) {
      const url = `/config/select/srvpage_cfg_page_guest_select`
      const req = {
        "serviceName": "srvpage_cfg_page_guest_select",
        "colNames": ["*"],
        "condition": [{
          colName: 'page_no',
          ruleType: 'eq',
          value: no
        }],
      }
      const res = await this.$axios.post(url, req)
      if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
        let data = res.data.data[0]
        Object.keys(data).forEach(key => {
          if (key && key.indexOf("_json") !== -1) {
            try {
              data[`${key}_data`] = JSON.parse(data[key])
            } catch (e) {
              //TODO handle the exception
            }
          }
        })
        this.comJson = data.component_json_data
        this.styleJson = data.page_style_json_data

        this.layoutJson = data.layout_json_data
        this.layoutJson.parts_json.forEach((item, index) => {
          let obj = {}
          obj.x = item.pos_x
          obj.y = item.pos_y
          obj.w = item.row_span
          obj.h = item.col_span
          obj.i = item.seq
          obj.layout_no = item.layout_no
          obj.data = this.comJson
          this.layout.push(obj)
        })
      }
    },
    // 对应Vue生命周期的created
    layoutCreatedEvent(newLayout) {
      // console.log("Created layout: ", newLayout)
    },
    // 对应Vue生命周期的beforeMount
    layoutBeforeMountEvent(newLayout) {
      // console.log("beforeMount layout: ", newLayout)
    },
    // 对应Vue生命周期的mounted
    layoutMountedEvent(newLayout) {
      // console.log("Mounted layout: ", newLayout)
    },
    // 当完成mount中的所有操作时生成的事件
    layoutReadyEvent(newLayout) {
      // console.log("Ready layout: ", newLayout)
    },
    // 更新事件（布局更新或栅格元素的位置重新计算）
    layoutUpdatedEvent(newLayout) {
      console.log("Updated layout: ", newLayout)
    },
    // 移动时的事件
    moveEvent(i, newX, newY) {
      // console.log("MOVE i=" + i + ", X=" + newX + ", Y=" + newY);
    },
    // 调整大小时的事件
    resizeEvent(i, newH, newW, newHPx, newWPx) {
      // console.log("RESIZE i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx);
    },
    // 移动后的事件
    movedEvent(i, newX, newY) {
      console.log("MOVED i=" + i + ", X=" + newX + ", Y=" + newY);
    },
    // 调整大小后的事件
    resizedEvent(i, newH, newW, newHPx, newWPx) {
      // console.log("RESIZED i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx);
    },
    //点击容器某一个组件
    changeDesign(idx) {
      if (this.curDesign == idx) {
        return;
      }
      this.curDesign = idx;
    },
    //删除自定义组件布局
    deleteDesignCon(id) {
      this.deleteOnlyData(id);
      this.addClass(id, "no");
    },
    //删除容器里某一条数据
    deleteOnlyData(id) {
      let idx = this.filterData(id);
      this.designData.layoutCon.splice(idx, 1);
      this.designData.layoutData.splice(idx, 1);
    },
    //鼠标按下
    moveMouseDown(data, ev) {
      this.moveData = data;
      if (!this.haveData()) {
        this.mouseFalg = true;
        this.moveStyle = {
          top: ev.clientY + "px",
          left: ev.clientX + "px",
        };
        this.mouseLeft = ev.clientX;
        this.mouseTop = ev.clientY;
      } else {
      }
    },
    //自定义布局容器是否有当前数据
    haveData() {
      let flag = false;
      for (
        let i = 0, len = this.designData.layoutCon.length;
        i < len;
        i++
      ) {
        if (this.designData.layoutCon[i].i == this.moveData.id) {
          flag = true;
        }
      }
      return flag;
    },
    //删除哪一条数据
    filterData(id) {
      for (
        let i = 0, len = this.designData.layoutCon.length;
        i < len;
        i++
      ) {
        if (this.designData.layoutCon[i].i == id) {
          return i;
        }
      }
    },
    addClass(id, type) {
      for (let i = 0, len = this.selectors.length; i < len; i++) {
        let childs = this.selectors;
        for (let j = 0, jen = childs[i].child.length; j < jen; j++) {
          if (id == childs[i].child[j].id) {
            if (type == "have") {
              childs[i].child[j].move = false;
            } else {
              childs[i].child[j].move = true;
            }
          }
        }
      }
    },
    //自定义容器初始化
    initDesign() {
      let domstyleWidth = document.getElementById("grid-container").offsetWidth - 20 * 10,
        domstyleHeight = 50,
        // domstyleHeight = document.getElementById("grid-container").offsetHeight / 20,
        domContainer = document.getElementById("custom-design"),
        resWidth = domstyleWidth / 12,
        everyWidth = ((resWidth / domstyleWidth) * 100).toFixed(2);
      this.bjStyles = {
        right: "20px",
        background: "linear-gradient(rgba(241, 243, 242, 1) 20px, transparent 0px) 0% 0%," +
          "linear-gradient(to right, rgba(241, 243, 242, 1) 20px, transparent 0px) rgba(223, 232, 228, 1)",
        "background-size": `${everyWidth}% ${domstyleHeight}px`,
      };
      this.rowheight = domstyleHeight - 10;
      this.designLeft = domContainer.offsetLeft + 250;
      this.designTop = domContainer.offsetTop + 70;
    },
    //鼠标移动
    moveMousemove() {
      window.onmousemove = (ev) => {
        if (!this.mouseFalg) {
          return;
        }
        this.moveShow = true;
        this.moveStyle = {
          top: ev.clientY + "px",
          left: ev.clientX + "px",
        };
        this.mouseLeft = ev.clientX;
        this.mouseTop = ev.clientY;
        if (
          this.mouseLeft >= this.designLeft &&
          this.mouseTop >= this.designTop
        ) {
          if (!this.haveData()) {
            this.computedPosi(
              { w: 6, h: 4 },
              this.moveData.id,
              this.designData.layoutCon
            );
            this.designData.layoutData.push(this.moveData);
            this.addClass(this.moveData.id, "have");
          } else {
            let X = this.mouseLeft - this.designLeft,
              domstyleWidth = (document.getElementById("grid-container").offsetWidth - 12 * 10) / 12,
              xlang = Math.floor(X / domstyleWidth / 2);
            if (xlang > 6) {
              xlang = 6;
            }
            this.designData.layoutCon[this.filterData(this.moveData.id)].x = xlang;
          }
        }
      };
    },
    //鼠标抬起
    moveMouseup() {
      window.onmouseup = () => {
        if (this.mouseFalg) {
          this.moveStyle = {
            top: 0,
            left: 0,
          };
          if (
            this.mouseLeft < this.designLeft ||
            this.mouseTop < this.designTop
          ) {
            if (this.haveData()) {
              this.deleteOnlyData(this.moveData.id);
              this.addClass(this.moveData.id, "no");
            }
          }
          this.mouseLeft = 0;
          this.mouseTop = 0;
          this.moveShow = false;
          this.mouseFalg = false;
        }
      };
    },
    //计算位置
    computedPosi(item, itemId, layout) {
      let newItem = {
        i: itemId,
        x: 0,
        y: 0,
        w: item.w,
        h: item.h,
      };
      let Ys = [],
        maxX = 0,
        maxY = 0,
        edgeX = 0,
        edgeY = 0;
      layout.map((item) => {
        Ys.push(item.y + item.h);
      });
      maxY = (Ys.length && Math.max.apply(null, Ys)) || 1;
      edgeX = 12;
      edgeY = maxY;
      let gridMap = new Array();
      for (let x = 0; x < edgeX; x++) {
        gridMap[x] = new Array();
        for (let y = 0; y < edgeY; y++) {
          gridMap[x][y] = 0;
        }
      };
      layout.map((item) => {
        for (let x = item.x; x < item.x + item.w; x++) {
          for (let y = item.y; y < item.y + item.h; y++) {
            gridMap[x][y] = 1;
          }
        }
      });
      for (let y = 0; y < edgeY; y++) {
        for (let x = 0; x < edgeX; x++) {
          if (edgeX - x >= item.w && edgeY - y >= item.h) {
            let itemSignArr = [];
            for (let a = x; a < x + item.w; a++) {
              for (let b = y; b < y + item.h; b++) {
                itemSignArr.push(gridMap[x][y]);
              }
            }
            if (itemSignArr.indexOf(1) < 0) {
              newItem.x = x;
              newItem.y = y;
              layout.push(newItem);
              return;
            }
          }
        }
      };
      newItem.x = 0;
      newItem.y = edgeY + 1;
      layout.push(newItem);
    },
    async getComList() {
      const url = `/config/select/srvpage_cfg_com_cus_type_select`
      const req = {
        "serviceName": "srvpage_cfg_com_cus_type_select",
        "colNames": ["*"]
      }
      const res = await this.$axios.post(url, req)
      if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
        this.comList = res.data.data
        this.comList.forEach((item, i) => {
          this.comList[i]['com_type'] = item.com_type_no
        })
      }
    },
    removeItem: function (val) {
      const index = this.layout.map(item => item.i).indexOf(val);
      this.layout.splice(index, 1);
    },
    dragDefFn(e) {
      e.preventDefault()
    },

    drag: function (e) {
      let parentRect = document.getElementById('content').getBoundingClientRect();
      let mouseInGrid = false;
      if (((mouseXY.x > parentRect.left) && (mouseXY.x < parentRect.right)) && ((mouseXY.y > parentRect.top) && (mouseXY.y < parentRect.bottom))) {
        mouseInGrid = true;
      }
      if (mouseInGrid === true && (this.layout.findIndex(item => item.i === 'drop')) === -1) {
        this.layout.push({
          x: (this.layout.length * 2) % (this.colNum || 12),
          y: this.layout.length + (this.colNum || 12), // puts it at the bottom
          w: 1,
          h: 1,
          i: 'drop',
        });
      }
      let index = this.layout.findIndex(item => item.i === 'drop');
      if (index !== -1) {
        try {
          this.$refs.gridlayout.$children[this.layout.length].$refs.item.style.display = "none";
        } catch {
        }
        let el = this.$refs.gridlayout.$children[index];
        el.dragging = { "top": mouseXY.y - parentRect.top, "left": mouseXY.x - parentRect.left };
        let new_pos = el.calcXY(mouseXY.y - parentRect.top, mouseXY.x - parentRect.left);
        if (mouseInGrid === true) {
          this.$refs.gridlayout.dragEvent('dragstart', 'drop', new_pos.x, new_pos.y, 1, 1);
          DragPos.i = String(index);
          DragPos.x = this.layout[index].x;
          DragPos.y = this.layout[index].y;
        }
        if (mouseInGrid === false) {
          this.$refs.gridlayout.dragEvent('dragend', 'drop', new_pos.x, new_pos.y, 1, 1);
          this.layout = this.layout.filter(obj => obj.i !== 'drop');
        }
      }
    },
    dragend: function (o) {
      let parentRect = document.getElementById('content').getBoundingClientRect();
      let mouseInGrid = false;
      if (((mouseXY.x > parentRect.left) && (mouseXY.x < parentRect.right)) && ((mouseXY.y > parentRect.top) && (mouseXY.y < parentRect.bottom))) {
        mouseInGrid = true;
      }
      if (mouseInGrid === true) {
        // alert(`Dropped element props:\n${JSON.stringify(DragPos, ['x', 'y', 'w', 'h'], 2)}`);
        this.$refs.gridlayout.dragEvent('dragend', 'drop', DragPos.x, DragPos.y, 1, 1);
        this.layout = this.layout.filter(obj => obj.i !== 'drop');
        // UNCOMMENT below if you want to add a grid-item
        let obj = {
          x: DragPos.x,
          y: DragPos.y,
          w: 1,
          h: 1,
          i: DragPos.i
        }
        obj.data = o
        obj.isLeftBarItem = true
        console.log(obj.data)
        this.layout.push(obj);
        this.$refs.gridlayout.dragEvent('dragend', DragPos.i, DragPos.x, DragPos.y, 1, 1);
        try {
          this.$refs.gridlayout.$children[this.layout.length].$refs.item.style.display = "block";
        } catch {
        }
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    const answer = window.confirm("当前页面数据未保存，确定要离开？");
    if (answer) {
      next();
    } else {
      next(false);
    }
  },
};
</script>

<style lang="scss" scoped>
.com-item {
  min-height: 90px;
  margin: 20px;
  border: 1px solid #197f54;
  cursor: move;
  text-align: center;
  display: grid;
  font-size: 14px;
}

.customhome-container {
  width: 100%;
  height: 100%;
  background: #f1f3f2;
  user-select: none;

  .cushome-sidebar {
    width: 240px;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    background: #fff;
    overflow: auto;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.08);
  }

  .cushome-right {
    width: 240px;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    overflow: auto;
    padding: 20px;
  }

  .cushome-content {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 240px;
    left: 240px;
    overflow: auto;

    .custom-design {
      width: 100%;
      height: 100%;
      // background-image: url('~@/assets/img/1234.png');
      // background-size: cover;
      // background-repeat: no-repeat;

      .grid-container {
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        position: absolute;
      }

      .design-conbox {
        width: 100%;
        height: 100%;
        background: #fff;
        border: 1px dashed transparent;

        &.activeBorder {
          border: 1px dashed #197f54;
        }

        .design-title {
          width: 100%;
          height: 56px;
          padding: 0 32px;
          justify-content: space-between;
          align-items: center;

          .row-tit {
            height: 100%;
            align-items: center;

            .line {
              width: 4px;
              height: 16px;
              border-radius: 3px;
              margin-right: 12px;
              background: #197f54;
            }

            .tit-text {
              height: 100%;
              line-height: 56px;
              font-size: 16px;
              font-weight: 400;
              color: #304265;
              cursor: default;
            }
          }

          .closeIcon {
            font-size: 20px;
            cursor: pointer;
          }
        }

        .design-content {
          width: 100%;
          height: calc(100% - 56px);
          padding: 0 31px 16px;
        }
      }
    }
  }

  .moveCon {
    position: fixed;
    top: 0;
    left: 0;
    width: 208px;
    height: 40px;
    background: #edf5f2;
    border-radius: 4px;
    margin-bottom: 12px;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    padding-left: 16px;
    opacity: 0.5;

    .rowIcon {
      font-size: 20px;
    }

    .item-name {
      font-size: 14px;
      color: #303133;
      margin-left: 10px;
    }
  }
}
</style>
<style lang="scss" scoped>
.custom-design .vue-grid-layout {
  min-height: calc(100% - 200px);
  padding-bottom: 200px;
  box-sizing: content-box;
}

.vue-grid-item.vue-grid-placeholder {
  background: #197f54;
}

.vue-grid-item>.vue-resizable-handle {
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid;
  border-color: transparent #e8eaef #e8eaef transparent;
  box-sizing: border-box;
  bottom: 6px;
  right: 6px;
  background: none;
  padding: 0;
}

.vue-grid-item:hover .vue-resizable-handle {
  border-color: transparent #197f54 #197f54 transparent;
}

.gridItem {
  border: 1px solid #fff;
  // background-color: rgba(255,255,255,1);
  overflow: hidden;
}

.remove {
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
  display: inline-block;
  width: 24px;
  height: 24px;
  margin: 0 auto;
  line-height: 24px;
  text-align: center;
}
</style>
