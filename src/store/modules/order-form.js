const state = {
    orderForm: {
        vehicle_type: '',
        isnormel: '',
        axlecount: 0,
        orginal_fee: 0,
        real_fee: 0,
        owe_fee: 0,
        order_evidence:"",
        vehicleusertype: '',
        vehicleclass: ''
    }
}

const getters = {
    getOrderForm: (state) => state.orderForm
}
const mutations = {
    // 合并更新，并在费用相关字段变化时同步计算补缴费用
    handleSetOrderForm(state, payload = {}) {
        state.orderForm = {
            ...state.orderForm,
            ...payload,
        }
        const originalFee = Number(state.orderForm.orginal_fee) || 0
        const realFee = Number(state.orderForm.real_fee) || 0
        const diff = originalFee - realFee
        state.orderForm.owe_fee = diff > 0 ? diff : 0
    },
    handleClearOrderForm(state) {
        state.orderForm = {
            vehicle_type: '',
            isnormel: '',
            axlecount: 0,
            orginal_fee: 0,
            real_fee: 0,
            owe_fee: 0,
            vehicleusertype: '',
            vehicleclass: ''
        }
    }

}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
}