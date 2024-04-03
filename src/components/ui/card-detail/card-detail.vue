<script>
import BroadcastChannelMixin from "../../mixin/broadcast-channel-mixin";
export  default {
  mixins: [BroadcastChannelMixin],
  data() {
    return {
      activeForm: null
    }
  },
  methods:{
    onUpdateFormActionComplete(event) {
      // debugger
      if (event === "reset") {
      } else {
        this.activeForm = null;
        // this.$refs.loader.run();
      }
      this.$emit('action-complete',event)
      this.bcPostMessage('action-complete',event)
    },
  }
}
</script>
<script setup>
import {computed, ref} from "vue";
import ChildList from "../../common/child-list.vue";
import simpleUpdate from "../../common/simple-update.vue";
import CardGroupCell from "../../../pages/datav/component/page-item/card-group-cell/card-group-cell.vue";

const props = defineProps({
  mainService: {
    type: String,
    default: ''
  },
  pageIsDraft: {
    type: String,
    default: 'norm',
  },
  isHistory:{
    type:Boolean,
    default:false
  },
  v2Data:{
    type: Object,
    default: () => {
      return {}
    }
  },
  pkCol: {
    type: [String,Number],
  },

  pk: {
    type: [String,Number],
  },
  divCond:{
    type:Array,
    default: () => {
      return []
    }
  },
  defaultConditions: {
    type: Array,
    default: () => {
      return []
    }
  },
  cellsLayoutJson: {
    type: Object,
    default: () => {
      return {}
    }
  },
  detailData: {
    type: Object,
    default: () => {
      return {}
    }
  },
  comColMapRun: {
    type: Object,
    default: () => {
      return {}
    }
  },
  cardLayoutJson: {
    type: Object,
    default: () => {
      return {}
    }
  },
  srvCols: {
    type: Array,
    default: () => {
      return []
    }
  },
  childListRun: {
    type: Object,
    default: () => {
      return {}
    }
  },
  fieldChildRun: {
    type: Object,
    default: () => {
      return {}
    }
  },
  fieldChildKeys: {
    type: Array,
    default: () => {
      return []
    }
  },
  childrenListLoaded: {
    type: Boolean,
    default: false
  }
})

const cardColumn = computed(() => {
  const arr = []

  function flatParts(parts) {
    if (!parts) return
    parts.forEach(item => {
      if (!item.sub_card_parts_json?.length && ['iconImg', 'variable'].includes(item.parts_type) && item.variable) {
        arr.push(item.variable)
      } else if (item.sub_card_parts_json?.length) {
        flatParts(item.sub_card_parts_json)
      }
    })
  }

  flatParts(props.cellsLayoutJson?.parts_json)
  return arr
})
const srvColsRun = computed(() => {
  // 1. 过滤掉卡片单元用到的字段
  // 2.
  const list = props.srvCols.filter(item => {
    return item.in_detail === 1 && !cardColumn.value.includes(item.columns)
  })
  return list.reduce((pre, cur) => {
    const arr = [{...cur}]
    if (props.fieldChildKeys?.includes(cur.columns)) {
      if (props.fieldChildRun?.[cur.columns]?.append?.length) {
        arr.push(...props.fieldChildRun[cur.columns].append)
      } else if (props.fieldChildRun?.[cur.columns]?.prepend?.length) {
        arr.unshift(...props.fieldChildRun[cur.columns].prepend)
      }
    }
    pre.push(...arr)
    return pre
  }, [])
})

const refreshDetail = () => {
}

const editBtn = computed(()=>{
  return props.v2Data?.formButton?.find(item=>item.button_type==='edit')
})

const updateService = computed(()=>{
  return editBtn?.service_name
})

</script>

<template>
  <div>
    <cardGroupCell ref="cardGroupCell" :cellsLayout="[cellsLayoutJson]" :cellData="detailData"
                   :comColMap="comColMapRun">
    </cardGroupCell>
    <div class="normal-field" v-if="detailData">
      <div class="field-item" v-for="(item, index) in srvColsRun" :key="index">
        <template v-if="item.columns">
          <div class="field-item-label">
            {{ item.label }}
          </div>
          <div class="field-item-value" v-html="detailData[item.columns]">

          </div>
        </template>
        <div v-else-if="item.foreign_key">
          {{ item.foreign_key.section_name }}
          <child-list :mainService='props.mainService' :isTree="item.table_type==='树形表'"
                      :isProc="item.table_type==='流程表'" :list-type="'detaillist'" :childListConfig="item"
                      @detailOnLoaded="refreshDetail" :pageIsDraft="pageIsDraft" :key="index" ref="childrenList"
                      :$srv-app="item.srv_app" :service="item.service_name" :foreign-key="item.foreign_key"
                      :read-only="item.foreign_key.child_table_readonly=='是'"
                      :default-condition="item.defaultCondition" :is-tree="!!item.parent_no_col"
                      :mainFormDatas="detailData" :inplace-edit="true" @list-loaded="$emit('list-loaded', $event)"
                      @update-form-loaded="$emit('update-form-loaded', $event)"
                      @add-form-loaded="$emit('add-form-loaded', $event)">
          </child-list>
        </div>
      </div>
    </div>
    <div class="button-box">
      <el-button v-if="editBtn" type="primary" @click="activeForm = 'update'">{{ editBtn.button_name }}</el-button>
    </div>
    <el-dialog
        title="编辑"
        width="90%"
        :close-on-click-modal="1 == 2"
        :visible="activeForm == 'update'"
        append-to-body
        @close="activeForm = 'xx'"
    >
      <simple-update
          name="update-form"
          ref="update-form"
          v-if="activeForm == 'update'"
          :service="updateService||(editBtn&&editBtn.service_name)"
          :pk="pk"
          :pkCol="pkCol"
          :nav-after-submit="false"
          @action-complete="onUpdateFormActionComplete"
      >
      </simple-update>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.normal-field {
  padding: 20px;
}
.button-box{
  text-align: center;
  padding: 20px;
}
.field-item {
  //display: flex;
  margin-bottom: 10px;

  &-label {
    min-width: 100px;
    padding: 10px;
    position: relative;
    padding-left: 15px;

    &:before {
      content: '';
      width: 5px;
      height: 40%;
      background-color: #1778fc;
      position: absolute;
      top: 30%;
      left: 0;
      border-radius: 10px;
    }
  }

  &-value {
    width: 100%;
    background-color: #f5f5f5;
    padding: 10px;
    margin: 0 0 10px;
  }
}
</style>