const state = {
  // key: service@use_type, value is a promise resolved to service response
  cache: {},
}

// getters
const getters = {
  getSrvCols: (state) => (service, useType, mainSrv) => {
    let key = service + "@" + useType
    if(mainSrv){
      key += `@${mainSrv}`
    }
    return state.cache[key]
  },

}

// mutations
const mutations = {
  addSrvCols(state, {service, useType, response, mainSrv}) {
    let key = service + "@" + useType
    if(mainSrv){
      key += `@${mainSrv}`
    }
    state.cache[key] = response
  },
}

export default {
  state,
  getters,
  mutations
}