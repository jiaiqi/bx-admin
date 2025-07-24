<template>
  <div class="chat_en" :style="chatStyleJson">
     <li v-for="(item,index) in chatList" class="chat_list" @click="handleSetChat(item)">
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
      ]
    }
  },
  props: {
    pageItem:{
      type:Object,
    },
    pageParamsModel:{
      type:Object,
    }
  },
  computed:{
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
    }
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
  methods:{

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

    handleSetChat(item){
      this.handelSetChatOpenStatus(false,item)
      this.chatCount = 0
      this.$store.commit('chatInfo/handleCleaCount')
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
  min-width:7.5rem;
  box-sizing: border-box;
  font-size:0.875rem;
  color:#fff;
  text-align: center;
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