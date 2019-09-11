import Vue from 'vue'
import App from './App.vue'
import '@leanix/reporting'
import '@/assets/css/tailwind.css'

/* global lx */
Vue.prototype.$lx = lx

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
