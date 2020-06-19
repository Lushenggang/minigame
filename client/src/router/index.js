import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/five-in-a-row',
    name: 'FiveInARow',
    component: () => import('@/games/five-in-a-row'),
    children: [
      {
        path: '',
        redirect: 'list'
      },
      {
        path: 'list',
        name: 'FiveInARowList',
        component: () => import('@/games/five-in-a-row/game-list')
      },
      {
        path: 'game/:id',
        name: 'FiveInARowGame',
        component: () => import('@/games/five-in-a-row/game')
      }
    ]
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
