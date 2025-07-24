<template>
  <div class="chat_en" :style="[chatStyleJson,setPosition]"
       @click.stop="onTap"
       @mousedown.stop="handleMouseDown"
       ref="chatEntranceRef"
       :class="{ 'draggable': isPreview || isView, 'editable': !isPreview && !isView }"
  >
    <!-- 编辑模式下的拖动按钮 -->
    <div
      v-if="isActive && !isPreview && !isView"
      class="drag-button"
      @mousedown.stop="startDrag"
      title="拖动组件"
    >
      <i class="el-icon-rank"></i>
    </div>

     <li v-for="(item,index) in chatList" class="chat_list" @click="handleChatClick(item, $event)">
       <span><img :src="chatImgs" alt="" :class="{'chat_ds': true, 'blink': item.isOpen}"></span>
       <span>{{item.chat_type}}</span>
     </li>
  </div>
</template>

<script>
import { formatStyleData } from "@/pages/datav/common";
import chaImg from '@/assets/img/chat.png'
export default {
  name: "chat-entrance",
  data(){
    return {
      chatCount:0,
      chatImgs:chaImg,
      chatType:0,
      chatList:[
        {
          chat_type:'法律咨询',
          code:2,
          groupId:null,
          isOpen:false
        },
        {
          chat_type:'法律咨询161',
          code:161,
          groupId:null,
          isOpen:false
        }
      ],
      left: this.position.x || 0,
      top: this.position.y || 0,
      isDragging: false,
      startX: 0,
      startY: 0,
      startLeft: 0,
      startTop: 0,
      dragStartTime: 0,
      hasMoved: false,
      // 鼠标相对于组件的偏移量
      offsetX: 0,
      offsetY: 0,
      // 拖动结束后的延迟标志，防止立即触发点击
      dragEndTime: 0,
    }
  },
  props: {
    position: {
      type: Object,
      default: () => ({
        x: 0,
        y: 0,
      }),
    },
    currentId: {
      type: [String, Number],
      default: "",
    },
    id: {
      type: [String, Number],
      default: "",
    },
    pageItem:{
      type:Object,
    },
    pageParamsModel:{
      type:Object,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    isView: {
      type: Boolean,
      default: false,
    },
  },
  computed:{
    isActive() {
      return this.currentId && this.id === this.currentId;
    },
    setPosition() {
      console.log('position',this.position)
      return {
        position: "absolute",
        left: this.left + "%",
        top: this.top + "%",
      };
    },
    props() {
      return { ...this.$props, ...(this.$attrs || {}) };
    },
    chatStyleJson() {
      const styleJson = this.pageItem?.style_json || {};
      let style = {};
      if (styleJson) {
        style = formatStyleData(styleJson);
      }
      return style;
    },
    chartStore(){
      return this.$store.state.chatInfo.chatBase
    },
    storeChatList(){
      return this.$store.state.chatInfo.chatList
    },
    setDataInfo(){
      return this.pageItem.srv_req_type==='请求数据'? this.pageItem.srv_req_json:null
    },
  },
  watch:{
    storeChatList:{
      handler(newVal){
        this.handelSetChatList(newVal)
      },
      deep:true,
      immediate:true
    },
    chartStore:{
      handler(newVal){
        if(newVal.msg&&newVal.msg.groupId){
          this.handelSetChatOpenStatus(true,newVal.msg);
        }
      },
      deep:true,
      immediate:true
    }
  },
   mounted(){
    // this.getChatList()
    // 初始化位置
    if (this.pageItem?.layout_x !== undefined) {
      this.left = parseFloat(this.pageItem.layout_x);
    }
    if (this.pageItem?.layout_y !== undefined) {
      this.top = parseFloat(this.pageItem.layout_y);
    }

    // 添加全局事件监听
    window.addEventListener("mousemove", this.onDrag);
    window.addEventListener("mouseup", this.stopDrag);
  },
  beforeDestroy() {
    // 移除全局事件监听
    window.removeEventListener("mousemove", this.onDrag);
    window.removeEventListener("mouseup", this.stopDrag);
  },
  methods:{
    getParentContainer() {
      // 由于这是全屏拖动的浮动组件，直接使用视口作为容器
      return {
        element: null,
        rect: {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    },
    onTap(event) {
      // 如果刚刚拖动过，不触发点击事件
      if (this.hasMoved) return;

      // 在编辑模式下，总是触发选中事件
      if (!this.isPreview && !this.isView) {
        let val = this.props;
        console.log("onTap:", val);
        this.$emit("click", val);
        return;
      }

      // 预览模式下不触发选中事件
    },
    handleMouseDown(event) {
      // 只有在预览和查看模式下，组件本身才可以拖动
      if (this.isPreview || this.isView) {
        this.startDrag(event);
      }
    },
    startDrag(event) {
      this.isDragging = true;
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.startLeft = this.left;
      this.startTop = this.top;
      this.dragStartTime = Date.now();
      this.hasMoved = false;
      // 重置拖动结束时间，开始新的拖动
      this.dragEndTime = 0;

      // 计算鼠标相对于组件的偏移量（全屏拖动模式）
      if (this.isPreview || this.isView) {
        const elementRect = this.$el.getBoundingClientRect();

        // 直接使用视口坐标系
        // 鼠标相对于视口的位置就是 event.clientX/Y
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // 组件相对于视口的位置
        const elementX = elementRect.left;
        const elementY = elementRect.top;

        // 计算偏移量（鼠标在组件内的相对位置）
        this.offsetX = mouseX - elementX;
        this.offsetY = mouseY - elementY;
      }

      event.preventDefault();
    },
    onDrag(event) {
      if (!this.isDragging) return;

      const deltaX = event.clientX - this.startX;
      const deltaY = event.clientY - this.startY;

      // 检测是否真的在移动（超过3像素才算移动）
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        this.hasMoved = true;
      }

      // 获取容器信息
      const container = this.getParentContainer();
      const elementRect = this.$el.getBoundingClientRect();
      const parentRect = container.rect;

      if (this.isPreview || this.isView) {
        // 全屏拖动模式：直接使用视口坐标系
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 鼠标位置（相对于视口）
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // 组件左上角位置 = 鼠标位置 - 偏移量
        const newLeft = mouseX - this.offsetX;
        const newTop = mouseY - this.offsetY;

        // 边界限制（确保组件完全在视口内）
        const maxLeft = viewportWidth - elementRect.width;
        const maxTop = viewportHeight - elementRect.height;

        const constrainedLeft = Math.max(0, Math.min(maxLeft, newLeft));
        const constrainedTop = Math.max(0, Math.min(maxTop, newTop));

        // 转换为百分比（相对于视口）
        this.left = (constrainedLeft / viewportWidth) * 100;
        this.top = (constrainedTop / viewportHeight) * 100;

      } else {
        // 编辑模式
        const percentX = (deltaX / parentRect.width) * 100;
        const percentY = (deltaY / parentRect.height) * 100;

        this.left = this.startLeft + percentX;
        this.top = this.startTop + percentY;

        // 边界限制
        const elementWidthPercent = (elementRect.width / parentRect.width) * 100;
        const elementHeightPercent = (elementRect.height / parentRect.height) * 100;

        this.left = Math.max(0, Math.min(100 - elementWidthPercent, this.left));
        this.top = Math.max(0, Math.min(100 - elementHeightPercent, this.top));
      }
    },
    stopDrag() {
      if (!this.isDragging) return;
      if (this.hasMoved) {
        this.updateComponentProps();
        // 记录拖动结束时间，用于防止立即触发点击事件
        this.dragEndTime = Date.now();
      }
      this.isDragging = false;
      // 延迟重置hasMoved标志，防止拖动结束后立即触发点击
      setTimeout(() => {
        this.hasMoved = false;
      }, 100); // 100ms延迟
    },
    updateComponentProps() {
      // 更新组件的属性，触发事件通知父组件
      const updatedProps = {
        ...this.props,
        layout_x: parseFloat(this.left.toFixed(2)),
        x: parseFloat(this.left.toFixed(2)),
        layout_y: parseFloat(this.top.toFixed(2)),
        y: parseFloat(this.top.toFixed(2)),
      };

      // 在预览和查看模式下，只更新位置，不触发选中事件
      if (this.isPreview || this.isView) {
        this.$emit("resize", updatedProps);
      } else {
        // 编辑模式下，触发resize事件和click事件
        this.$emit("resize", updatedProps);
        this.$emit("click", updatedProps);
      }
    },
    async getChatList(){
      if(this.setDataInfo){
        let req= typeof this.pageItem.srv_req_json==='string'?JSON.parse(this.pageItem.srv_req_json):this.pageItem.srv_req_json
        let setParams={
          serviceName:req.serviceName,
          colNames:['*'],
          condition:req.condition?req.condition:[],
        }
        const url = `/${req.mapp}/select/${req.serviceName}`;
        const res = await this.$http.post(url, setParams);
        if(res.data.state!=='SUCCESS') return;
        // this.chatList = res.data.data
      }
    },

    handelSetChatList(storeChatList){
      console.log('storeChatList',storeChatList)
      // 遍历本地chatList，根据store中的数据更新groupId
      this.chatList.forEach(localItem => {
        // 在store的chatList中查找对应的项
        const storeItem = storeChatList.find(storeItem => storeItem.setId === localItem.code);
        if (storeItem) {
          // 如果找到对应项，更新groupId
          localItem.groupId = storeItem.groupId;
        }
      });
      console.log('---这是重新组合后的会话类型',this.chatList)
    },

    handelSetChatOpenStatus(flag,item){
      this.chatList.map(d=>{
        if(!flag){
          if(d.code === item.code){
             d.isOpen = flag
          }
        }else {
          if(d.groupId === item.groupId){
             d.isOpen=true
          }
        }
      })
    },

    handleChatClick(item, event) {
      // 在编辑模式下，阻止聊天功能，但允许事件冒泡到父组件
      if (!this.isPreview && !this.isView) {
        console.log('编辑模式下，阻止聊天功能，但允许选中组件');
        // 不调用 event.stopPropagation()，让事件冒泡到父组件的 onTap
        return;
      }

      // 预览模式下，阻止事件冒泡，执行聊天功能
      event.stopPropagation();
      this.handleSetChat(item);
    },
    handleSetChat(item){
      // 如果刚刚拖动过，不触发聊天功能
      if (this.hasMoved) return;

      // 如果拖动刚结束（200ms内），也不触发聊天功能
      const timeSinceDragEnd = Date.now() - this.dragEndTime;
      if (this.dragEndTime > 0 && timeSinceDragEnd < 200) {
        console.log('拖动刚结束，忽略点击事件');
        return;
      }

      // 执行聊天功能
      this.handelSetChatOpenStatus(false,item)
      this.chatCount = 0
      // this.$store.commit('chatInfo/handleCleaCount')
      this.$emit('setOpenChat',item)
      console.log(item)
    }
  }
}
</script>



<style scoped lang="scss">
li{
  list-style: none;
}
.chat_en{
  position: absolute;
  z-index: 10000;
  top:0.625rem;
  left:0.625rem;
  width:9.375rem;
  padding:0.625rem;
  box-sizing: border-box;
  font-size:0.875rem;
  color:#fff;
  text-align: center;
  user-select: none;

  // 预览模式下可拖动
  &.draggable {
    cursor: move;

    &:hover {
      opacity: 0.9;
      transform: scale(1.02);
      transition: all 0.2s ease;
    }

    &:active {
      transform: scale(0.98);
      opacity: 0.8;
    }
  }

  // 编辑模式下默认指针
  &.editable {
    cursor: pointer;
  }

  // 拖动按钮样式
  .drag-button {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 20px;
    height: 20px;
    background-color: #17d57e;
    border: 1px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: move;
    z-index: 1000;
    font-size: 12px;
    color: white;

    &:hover {
      background-color: #15c471;
      transform: scale(1.1);
    }

    i {
      font-size: 10px;
    }
  }
}
.chat_list{
  display: flex;
  width:100%;
  align-items: center;
  justify-content: space-around;
  margin:0.125rem 0;
  background:#f7c25c;
  border:1px solid #d3ebf6;
  cursor: pointer;
  img{
    display: block;
    width:1.875rem;
  }
}
.chat_ds{
  &.blink {
    animation: messageAlert 1s infinite;
  }
}

@keyframes messageAlert {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.3;
  }
}
</style>