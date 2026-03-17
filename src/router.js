import { createRouter, createWebHistory } from 'vue-router'
import BookingsList from './components/BookingsList.vue'
import KovorkingsList from './components/KovorkingList.vue'
import BuildingDetail from './components/BuildingDetail.vue'
import UserList from './components/UserList.vue'
import UserDetail from './components/UserDetail.vue'
import BuildingList from './components/BuildingList.vue' 
import BuildingEdit from './components/BuildingEdit.vue'
const routes = [
  {
    path: '/',
    redirect: '/bookings'
  },
  {
    path: '/bookings',
    name: 'bookings',
    component: BookingsList
  },
  {
    path: '/kovorkings',
    name: 'kovorkings',
    component: KovorkingsList
  },
  {
    path: '/buildings/:id',
    name: 'building-detail',
    component: BuildingDetail
  },
  {
    path: '/buildings',
    name: 'buildings',
    component: BuildingList
  },
  {
    path: '/users',
    name: 'users',
    component: UserList
  },
  
  {
    path: '/user/:id',
    name: 'user-detail',
    component: UserDetail
  },
  {
    path: '/buildings/:id/edit',
    name: 'user-detail',
    component: BuildingEdit
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router