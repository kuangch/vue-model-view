import Vue from 'vue'
import App from './App.vue'
import ModelView from '../../../lib'

Vue.config.productionTip = false

Vue.use(ModelView)

new Vue({
  render: h => h(App)
}).$mount('#app')
