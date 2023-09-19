import Vue from 'vue'

const state = {
  // key: table name, value is the data as listmap
  tableButtonsPopup: {

  },
}

// getters
const getters = {
  getTableButtonsPopup: (state) => () => {

    return state.tableButtonsPopup
  },

}

// mutations
const mutations = {
  setTableButtonsPopup(state, {service, buttonsKey, buttonType,buttonMode,submitState}) {
    
    if(service){
      let obj = {
        buttonsKey,
        buttonType,
        buttonMode,
        submitState
      }
      if(state.tableButtonsPopup[service]){
        state.tableButtonsPopup[service] = Object.assign(state.tableButtonsPopup[service],obj)
      }else{
        state.tableButtonsPopup[service] = obj
      }
      
      
    }
    
  },
}

export default {
  state,
  getters,
  mutations
}