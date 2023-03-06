import Vue from 'vue'
import Vuex from 'vuex'
import SrvColData from './modules/srvcol-data'
import HotTableData from './modules/hot-table-data'
import frontTableData from './modules/frontTableData'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    SrvColData,
    HotTableData,
    frontTableData
  },
  strict: false,
})