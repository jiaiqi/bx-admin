<template>
    <div  @dragover="onDragOver" class="drag-ui-layout" v-on:dragend="onDragStop">
        <!-- @dragend="dragend" @dragover="onDragOver" -->
        <el-row :gutter="10" style="height:100%;"   >
            <el-col  :lg="2" >
                <draggable v-model="list" :group="{
                            name:`itxst`,//组名为itxst
                            pull:'clone',//是否允许拖出当前组
                            put:false,//是否允许拖入当前组
                        }" v-for="(item,index) in list" :key="index"
                        @end="unchoose($event,item)">
                    <transition-group>
                        <!-- @mousemove="mousemove" @mouseup="mouseup" @mousedown="mousedown"  -->
                        <div class="grid-content bg-purple" style="padding:10px;border:1px solid #eee;" :key="index">{{item.text}}</div>
                    </transition-group>
                </draggable>
                
                
            </el-col>
            <el-col  :lg="18" class="" :class="inDragView ? 'on-drag-view' : ''">
                <!-- <draggable v-model="list2" :group="{
                            name:`itxst`,//组名为itxst
                            pull:false,//是否允许拖出当前组
                            put:true,//是否允许拖入当前组
                        }" 
                          @add="onAdd">
                    <transition-group>
                       
                    </transition-group>
                </draggable> -->
                <uiDrag :list="list2"
                        ref="uidrag"
                        :key="'uidrag'"
                        @active-updated="activeUpdated"
                        @clones-active="clonesActive"
                        @updated="updatedItem"
                        ></uiDrag>
            </el-col>
            <el-col  :lg="4" >
                <div class="grid-content bg-purple">
                    {{active ? active.text : ''}}
                    <div>{{JSON.stringify(active)}}</div>
                    <div v-if="active">
                        <el-button @click="onUp">置顶</el-button>
                        <el-button @click="onDown">置底</el-button>
                    </div>
                    
                </div>
            </el-col>
        </el-row>
    </div>
        


  </template>
  
  <script>
  
  
  import draggable from 'vuedraggable'
  import uiDrag from './components/uiDrag.vue'
  export default {
    components: {draggable,uiDrag},
  
    mixins: [],
  
    props: {},
  
    data() {
      return {
        active:null,
        list: [
            {
                key:1,
                text:'测试1',
                gridData:{
                    w:100,
                    h:200,
                },
            },{
                key:2,
                text:'测试2',
                gridData:{
                    w:600,
                    h:100,
                },
            },
            {
                key:3,
                text:'测试3',
                gridData:{
                    w:200,
                    h:600,
                },
            }
           
        ],
        list2:[],
        dragView:null,
        onDragView:false,
        onDragData:null,
        updateGridItem:false,
      };
    },
  computed:{
     inDragView(){
        let is = false
        let dragView =  this.dragView ? this.bxDeepClone(this.dragView) :this.dragView
        let onDrag = this.onDragData ? this.bxDeepClone(this.onDragData) :this.onDragData 
        if(onDrag && dragView && onDrag.x > dragView.x  && onDrag.y > dragView.y && onDrag.x < (dragView.x + dragView.width) && onDrag.y < (dragView.y + dragView.height) ){
            is = true
        }
        return is
     },
     zIndexs(){
        let z = {}
        let list = this.bxDeepClone(this.list2)
        for(let item of list){
            if(item.hasOwnProperty('_id')){
                z[item['_id']] = item.gridData.z
            }
        }
        return z
     }
  },
  created: function () {
  },

  mounted: function () {
      this.dragView = this.$refs.uidrag.$el.getBoundingClientRect();
      if(this.dragView){
        this.$set(this,'dragView',{
            bottom: this.dragView.bottom,
            height: this.dragView.height,
            left: this.dragView.left,
            right: this.dragView.right,
            top: this.dragView.top,
            width: this.dragView.width,
            x: this.dragView.x,
            y: this.dragView.y})
      }
      console.log('----',this.$refs.uidrag.$el.getBoundingClientRect())
  },
  
    
  
    methods: {
        // @mousemove="mousemove" @mouseup="mouseup" @mousedown="mousedown"
        onUp(){
            this.updateGridItem = true
            let active = this.bxDeepClone(this.active)
            let list = this.bxDeepClone(this.list2)
            // this.list2 = []
            let oldTop = list.filter(item => item.gridData.z === 999)
            if(oldTop.length > 0){

            }
            if(list.length > 1){
                let onIndex = null
                list = list.map((item,index) => {
                    
                    
                    if(item.hasOwnProperty('_id') && active  && item['_id'] === active['_id']){
                        onIndex = index
                        item.gridData.z = 999
                    }else{
                        if(index > onIndex && item.gridData.z !== 999){
                            item.gridData.z = item.gridData.z - 1
                        }else if(item.gridData.z === 999){
                            item.gridData.z = list.length - 1
                        }
                    }
                    
                    
                    return item
                })
                
                // list = list.sort(function (a, b) {
                //         return a.gridData.z - b.gridData.z; //升序排序
                // });
                this.$nextTick(() => {
                    this.list2 = [].map(item=>item)
                    this.list2 = list.map(item => item)
                    this.updateGridItem = false
                })
            }
            
            
        },
        onDown(){
            this.updateGridItem = true
            let active = this.bxDeepClone(this.active)
            let list = this.bxDeepClone(this.list2)
            // this.list2 = []
            if(list.length > 1){
                let onIndex = null
                list = list.map((item,index) => {
                    
                    
                    if(item.hasOwnProperty('_id') && active  && item['_id'] === active['_id']){
                        onIndex = index
                        item.gridData.z = 0
                    }else{
                        item.gridData.z = item.gridData.z + 1
                    }
                    
                    
                    return item
                })
               
                
                // list = list.sort(function (a, b) {
                //         return a.gridData.z - b.gridData.z; //升序排序
                // });
                this.$nextTick(() => {
                    this.list2 = [].map(item=>item)
                    this.list2 = list.map(item => item)
                    this.updateGridItem = false
                })
            }
        },
        onMove(e,originalEvent){ 
            console.log(e,originalEvent)
         //不允许停靠
         if (e.relatedContext.element.id == 1) return false;
         //不允许拖拽
         if (e.draggedContext.element.id == 4) return false;
        //  return true;
      },  
      onDragStop(e){ 
            console.log('onDragStop---------------------------------',e)
        //  return true;
      },  
      onDragOver(e){
            let x = e.x
            let y = e.y
            
            console.log('onDragOver',x,y)
            this.$set(this,'onDragData',{x,y})
        },
        add(e){
            let oldList = this.bxDeepClone(this.list2)
            oldList = oldList.sort(function (a, b) {
                        return a.gridData.z - b.gridData.z; //升序排序
                });
            if(!e && (!this.dragView || !this.onDragData) && this.list2.length > 199){
                return
            }else if(this.dragView && this.onDragData){
                let newItem = this.bxDeepClone(e)
                let x =  this.onDragData.x - this.dragView.x
                let y =  this.onDragData.y - this.dragView.y
                let grid = {
                    x:x,
                    y:y,
                    w:newItem.gridData.w,
                    h:newItem.gridData.h,
                    z:oldList.length + 1,
                }
                newItem['gridData'] = this.bxDeepClone(grid)
                newItem['_id'] = this.guid()
                oldList.push(newItem)
                this.onDragData = null
                oldList = oldList.map((item,index) => {
                    item.gridData.z = index + 1
                    return item
                })
                this.list2 = oldList.map((item,index) => {return item})
                
            }
            
            
        },
        unchoose(e,item){
            // console.log('unchoose',e)
            console.log('unchoose',e.item._underlying_vm_,item)
            if(this.inDragView){
                
                this.add(item)
            }
            
        },
        // mousemove(e){
        //     console.log('mousemove',e)
        // },
        // mouseup(e){
        //     console.log('mouseup',e)
        // },
        mousedown(e){
            console.log('mousedown',e)
        },
        // updateMove(e){
        //     console.log('updateMove',e)
        // },
        // sort(e){
        //     console.log('sort',e)
        // },
        activeUpdated(item){ 
            if(item && !this.updateGridItem){
                this.$set(this,'active',item)
            }
        },
        updatedItem(e){
            console.log(e)
            if(e &&  !this.updateGridItem){
                this.list2 = this.list2.map(i => {
                    if(e && i && i['_id'] == e['_id']){
                        i = this.bxDeepClone(e)
                    }
                        
                    return i
                })
            }
            

        },
        clonesActive(){
            this.$set(this,'active',null)
        }
    },
  };
  </script>
  
  
  
  <style lang="scss" scoped>
  .drag-ui-layout {
    
    // cursor:no-drop;
    .on-drag-view{
        background:#c8efc6;
        cursor:cell;
        // cursor:cell;
    }
  }
  
  </style>
  