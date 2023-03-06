import Vue from 'vue'

const state = {
  // key: table name, value is the data as listmap
  tables: {},
}

// getters
const getters = {
  getFrontTableData: (state) => () => {
    return state.tables
  },

}

// mutations
const mutations = {
  setFrontTableData(state, {table, data}) {
    Vue.set(state.tables, table, data)
  },
}

export default {
  state,
  getters,
  mutations
}