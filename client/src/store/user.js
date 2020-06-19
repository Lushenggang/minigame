export default {
  namespaced: true,
  state: {
    user: null
  },
  mutations: {
    setInfo (state, info) {
      state.user = info
    }
  },
  getters: {
    info (state) {
      return state.user
    }
  }
}