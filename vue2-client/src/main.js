// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'

import App from './App'
import Home from './components/Home'
import Random from './components/Random'
import Tokens from './components/Tokens'

Vue.use(VueRouter)
Vue.use(VueResource)

const routes = [
  { path: '/home', component: Home },
  { path: '/random', component: Random },
  { path: '/tokens', component: Tokens }
]

const router = new VueRouter({
  routes: routes
})

/* eslint-disable no-new */
new Vue({
  router,
  el: '#app',
  template: '<App/>',
  components: { App }
})
