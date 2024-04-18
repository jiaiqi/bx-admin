import Vue from 'vue'

const state = {
    // key: table name, value is the data as listmap
    bMapLoaded: false,//百度地图加载完成
}

// getters
const getters = {
    getBMapLoaded: (state) => () => {
        return state.bMapLoaded
    },
}

// mutations
const mutations = {
    setBMapLoaded(state, loaded) {
        state.bMapLoaded = loaded
    },
}

export default {
    state,
    getters,
    mutations
}