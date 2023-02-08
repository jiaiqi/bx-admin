<template>
  <div class="box-wrap" @dragenter="dragDefFn($event)" @dragover="dragDefFn($event)">
    <div class="side-bar">
      <div v-for="comItem in comItemList" @drag="drag" @dragend="dragend(comItem)" class="com-item" draggable="true"
        unselectable="on">
        {{ comItem.com_label }}
        {{ comItem.com_no }}
        {{ comItem.com_type }}
      </div>
    </div>
    <div class="template-index" id="content" :style="stylefn(pageInfo ? pageInfo.page_style_json_data : '')">
      <grid-layout ref="gridlayout" :layout.sync="layout" :col-num="12" :row-height="30" :is-draggable="true"
        :is-resizable="true" :is-mirrored="false" :vertical-compact="true" :margin="[20, 20]"
        :use-css-transforms="true">
        <grid-item v-for="item in layout" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i" :key="item.i"
          class="gridItem">
          <span class="remove" @click="removeItem(item.i)">x</span>
          <page-item v-for="comItem in comItemList" v-if="item.type === comItem.com_type" :key="comItem.component_no"
            :comItem="comItem">
          </page-item>
        </grid-item>
      </grid-layout>
    </div>
  </div>
</template>

<script>
import {
  formatStyleData
} from '@/common/common.js'
import { GridLayout, GridItem } from 'vue-grid-layout'
import PageItem from '@/components/page-item/index'

let mouseXY = { "x": null, "y": null }
let DragPos = { "x": null, "y": null, "w": 1, "h": 1, "i": null }

export default {
  components: { GridLayout, GridItem, PageItem },
  data() {
    return {
      pageNo: '',
      pageInfo: null,
      // 定义栅格系统数据源
      layout: [
        // i: 元素的ID（如果位置重叠，使用id体现元素先后顺序）
        // x: 元素位于第几列（可配置初始位置）
        // y: 元素位于第几行（可配置初始位置）
        // w: 元素的初始宽度（值为colWidth的倍数，最大值12/24）
        // h: 元素的初始高度（值为rowHeight的倍数，值任意大）
        //
        // { "x": 0, "y": 0, "w": 4, "h": 12, "i": "0", type: 'videoCard' },
        // { "x": 5, "y": 0, "w": 6, "h": 6, "i": "1", type: 'currentInfo' },
        // { "x": 4, "y": 0, "w": 2, "h": 5, "i": "2" },
        // { "x": 6, "y": 0, "w": 2, "h": 3, "i": "3" },
        // { "x": 8, "y": 0, "w": 2, "h": 3, "i": "4" },
        // { "x": 10, "y": 0, "w": 2, "h": 3, "i": "5" },
        // { "x": 0, "y": 5, "w": 2, "h": 5, "i": "6" },
        // { "x": 2, "y": 5, "w": 2, "h": 5, "i": "7" },
        // { "x": 4, "y": 5, "w": 2, "h": 5, "i": "8" },
        // { "x": 6, "y": 3, "w": 2, "h": 4, "i": "9" },
        // { "x": 8, "y": 4, "w": 2, "h": 4, "i": "10" },
        // { "x": 10, "y": 4, "w": 2, "h": 4, "i": "11" },
        // { "x": 0, "y": 10, "w": 2, "h": 5, "i": "12" },
        // { "x": 2, "y": 10, "w": 2, "h": 5, "i": "13" },
        // { "x": 4, "y": 8, "w": 2, "h": 4, "i": "14" },
        // { "x": 6, "y": 8, "w": 2, "h": 4, "i": "15" },
        // { "x": 8, "y": 10, "w": 2, "h": 5, "i": "16" },
        // { "x": 10, "y": 4, "w": 2, "h": 2, "i": "17" },
        // { "x": 0, "y": 9, "w": 2, "h": 3, "i": "18" },
        // { "x": 2, "y": 6, "w": 2, "h": 2, "i": "19" }
      ],
    }
  },
  computed: {
    comItemList() {
      if (this.pageInfo && this.pageInfo.component_json_data) {
        const comData = this.pageInfo.component_json_data
        if (Array.isArray(comData)) {
          return comData.map(item => {
            return item
          })
        }
      }
    },
  },
  created() {
    if (this.$route.query.pageNo) {
      this.pageNo = this.$route.query.pageNo
    }
  },
  mounted() {
    this.getPageInfo()

    document.addEventListener("dragover", function (e) {
      mouseXY.x = e.clientX;
      mouseXY.y = e.clientY;
    }, false);
  },
  methods: {
    async getPageInfo() {
      const url = `/config/select/srvpage_cfg_page_guest_select`
      const req = {
        "serviceName": "srvpage_cfg_page_guest_select",
        "colNames": ["*"],
        "condition": [{
          colName: 'page_no',
          ruleType: 'eq',
          value: this.pageNo || 'PG2302030002'
        }],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        },
      }
      const res = await this.$axios.post(url, req)
      if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
        let pageInfo = res.data.data[0]
        Object.keys(pageInfo).forEach(key => {
          if (key && key.indexOf("_json") !== -1) {
            try {
              pageInfo[`${key}_data`] = JSON.parse(pageInfo[key])
            } catch (e) {
              //TODO handle the exception
            }
          }
        })
        this.pageInfo = pageInfo
      } else {
        this.pageInfo = {}
      }
    },
    stylefn(style) {
      if (style) {
        return formatStyleData(style)
      }
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
        this.layout.push({
          x: DragPos.x,
          y: DragPos.y,
          w: 1,
          h: 1,
          i: DragPos.i,
          type: o.com_type
        });
        this.$refs.gridlayout.dragEvent('dragend', DragPos.i, DragPos.x, DragPos.y, 1, 1);
        try {
          this.$refs.gridlayout.$children[this.layout.length].$refs.item.style.display = "block";
        } catch {
        }
      }
    },
    removeItem: function (val) {
      const index = this.layout.map(item => item.i).indexOf(val);
      this.layout.splice(index, 1);
    },
    dragDefFn(e) {
      e.preventDefault()
    },
  }
}
</script>

<style lang="scss" scoped>
.box-wrap {
  height: 100%;
}

.side-bar {
  float: left;
  width: 200px;
  height: 100%;

  .com-item {
    height: 80px;
    margin: 20px;
    border: 1px solid deepskyblue;
    cursor: move;
    text-align: center;
  }
}

.template-index {
  margin-left: 200px;

  .gridItem {
    // border: solid black 1px;
    background-color: #fff;
    // border-radius: 10px;
    overflow: hidden;
  }
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
  z-index: 1;
}
</style>