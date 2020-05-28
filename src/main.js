import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'


import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置一个拦截器 在挂载之前
axios.interceptors.request.use(config => {
  console.log(config);
  // 为请求头对象添加上 token 验证的 authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 固定写法 必须 return config
  return config
})

// 全局挂载
// 这样每个vue组件都可以直接通过 this 访问到 $http ，从而直接发送ajax请求
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
