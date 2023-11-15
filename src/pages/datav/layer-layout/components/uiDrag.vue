<template>
    <div style="background:#000;height:calc(100vh - 50px);position: relative;">
        <vue-drag-resize  :parentLimitation="true" v-if="gridData.length > 0" v-for="(item,index) in gridData" :key="index" 
            :class="active && item['_id'] == active['_id'] ? 'active-grid' : ''"
            :gridX="10"
            :gridY="10"
            :snapToGrid="true"
            :isActive="active && item['_id'] == active['_id']"
            :z="item.gridData.z" 
            :x="item.gridData.x" 
            :y="item.gridData.y" 
            :w="item.gridData.w" 
            :h="item.gridData.h"
            @clicked="onActivated($event,item)"
            @deactivated="onDeactivated"
            @dragstop="onDragstop($event,item)"
            @resizestop="onResizestop($event,item)">
            <div style="padding:10;background:#fff;border:1px solid #eee;height:100%;" >
                <span>({{item.gridData.z}})</span>
                {{item.text}}
                <span>{{item._id}}</span>
            </div>
            <!-- :w="item.gridData.w"
            @mousemove="drag"
            @dragging="onDragging" :h="item.gridData.h" -->
        </vue-drag-resize>
    </div>
</template>

<script>




  import VueDragResize from 'vue-drag-resize';
export default {
    name:'ui-drag',
  components: {VueDragResize},

  mixins: [],

  props: {
    list:{
        type:Array,
        default(){
            return []
        }
    }
  },
  computed:{
     zIndexs(){
        let z = {}
        let list = this.bxDeepClone(this.list)
        for(let item of list){
            if(item.hasOwnProperty('_id')){
                z[item['_id']] = item.gridData.z
            }
        }
        return z
     }
  },
  data() {
    return {
        gridData:[],
        active:null
    };
  },

    created: function () {
    },

    mounted: function () {
        window.addEventListener('mousedown', this.mousedown)//监听鼠标按下
        // window.addEventListener('mousemove', this.mousemove)//监听鼠标按下

    window.addEventListener('mouseup', this.mouseup)//监听鼠标抬起
        // let list = this.bxDeepClone(this.list)
        // if(Array.isArray(list) && list.length > 0){
        //     this.gridData = list.map((item) => {
        //         item['gridData'] = {
        //             x:0,
        //             y:0,
        //             w:0,
        //             h:0,
        //             z:999
        //         }
        //         return item
        //     })
        // }
    },
  methods: {
    onDragging(e){
        console.log('onDragging',e)
    },
    drag(e){
        console.log(e)
    },
    onActivated(e,item){
        //点击内部
        console.log('onActivated',e,item)
        this.$emit("active-updated",this.bxDeepClone(item))
        this.$set(this,'active',this.bxDeepClone(item))

    },
    onDeactivated(e){
        //点击外部
        console.log('onDeactivated',e)
        // this.$emit("clones-active",null)
    },
    onDragstop(e,item){
        //拖放结束
        console.log('onDragstop',e,item)
        item.gridData.x = e.left
        item.gridData.y = e.top
        this.$emit("updated",item)
        
    },
    onResizestop(e,item){
        //缩放结束
        console.log('onResizestop',e,item)
        item.gridData.x = e.left
        item.gridData.y = e.top
        item.gridData.w = e.width
        item.gridData.h = e.height
        this.$emit("updated",item)
    },
    mousedown(e){
        console.log('mousedown',e)
    },
    mouseup(e){
        console.log('mouseup',e)
    }
  },
  watch:{
    "list":{
        deep:true,
        handler:function(nval,oval){
            console.log(nval,oval)
            if(Array.isArray(nval) && nval.length > 0){
                this.gridData = nval.map((item) => {
                    let obj = this.bxDeepClone(item)
                    // obj['gridData'] = {
                    //     x:0,
                    //     y:0,
                    //     w:0,
                    //     h:0,
                    //     z:999
                    // }
                    return obj
                })
            }
        }
    }
  }
};
</script>



<style lang="scss" scoped>
.active-grid{
    border:1px solid #c8efc6;
    box-shadow: 0 2px 12px 0 rgb(61 221 21 / 52%);
}
</style>
