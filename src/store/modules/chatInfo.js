const state = {
      chatBase:{
          chatCount: 0,
          msg:{}
      },
      chatList:[]
}


const mutations = {
    handleSetChatCount(state, payload) {
        state.chatBase = payload
    },
    handleCleaCount(state, payload) {
        state.chatBase = {
            chatCount: 0,
            msg:{}
        }
    },

    handleSetChatList(state, payload) {
        state.chatList = payload
        console.log('----这是目前打开过的会话',state.chatList)
    },

    handleClearChatList(state, payload) {
        state.chatList = []
    },

}

export default {
    namespaced: true,
    state,
    mutations,
}