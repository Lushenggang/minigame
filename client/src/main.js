import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import socket from '@/socket'
import user from '@/components/user'

Vue.component('user', user)

Vue.prototype.socket = socket

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
