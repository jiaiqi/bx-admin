const state = {
    orderForm: null
}

const getters = {
    getOrderForm: (state) => state.orderForm
}
const mutations = {
    handleSetOrderForm(state, payload) {
        state.orderForm = payload
    },
    handleClearOrderForm(state, payload) {
        state.orderForm = {}
    }

}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
}