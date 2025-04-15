import Vue from 'vue'
import Vuex from 'vuex'
import SrvColData from './modules/srvcol-data'
import HotTableData from './modules/hot-table-data'
import frontTableData from './modules/frontTableData'
import custActiveRefresh from './modules/custActiveRefresh'
import customState from "./modules/custom-state";
import theme from './modules/theme'
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    SrvColData,
    HotTableData,
    frontTableData,
    custActiveRefresh,
    customState,
    theme
  },
  strict: false,
})