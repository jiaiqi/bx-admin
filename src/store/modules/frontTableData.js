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
  setFrontTableData(state, {service, data, params}) {
    state.tables = {
      service,
      data,
      params
    }
  },
}

export default {
  state,
  getters,
  mutations
}