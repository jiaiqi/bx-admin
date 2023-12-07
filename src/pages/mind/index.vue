<template>
    <div  
    v-loading="loading"
    :element-loading-text="loadtext"
    element-loading-spinner="el-icon-loading">
        
    </div>
        


  </template>
  
  <script>
  
  
//   import draggable from 'vuedraggable'
//   import uiDrag from './components/uiDrag.vue'
//   import pageInit from './utils/page-mixin.js'
//   import comlistInit from './utils/comlist-init-mixin.js'
//   import { $axios } from "../common/http.js";
  export default {
    name:'mindIndex',
    components: {},
  
    mixins: [],
  
    props: {},
  
    data() {
      return {
        loading:false,
        loadtext:'加载中'
      };
    },
  computed:{
     
  },
  created: function () {
    this.loading = true
    
  },

  mounted: function () {
    
  },
  
    
  
    methods: {
        
    },
    watch:{
        
    }
  };
  </script>
  
  
  
  <style lang="scss" scoped>
  
  .drag-ui-layout {
        user-select: none;
    .layer-layout{
        display:flex;
        .layer-layout-left{
            //拖拽左侧模板
            width:10rem;
            padding:5px;
            box-sizing:border-box;
            height:100vh;
            overflow-y:auto;
            &>div{
                margin-bottom:5px;
                &:last{
                    margin-bottom:0;
                }
            }

        }
        .layer-layout-view{
            //拖拽视口区域
            width:calc(100% - 25rem);
            max-width:calc(100vw - 25rem);
            overflow-x:auto;
            
            &.view-full{
                width:100vw;
                max-width:100vw;
            }
        }
        .layer-layout-right{
            // 右侧功能
            width:15rem;

        }
        // cursor:no-drop;
        .on-drag-view{
            background:#c8efc6;
            cursor:cell;
            // cursor:cell;
            .layer-layout-view{
                
            }
        }
    }
    
  }
  
  </style>
  