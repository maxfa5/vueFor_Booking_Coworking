import { createRouter, createWebHistory } from 'vue-router'
import BookingsList from './components/BookingsList.vue'
import KovorkingsList from './components/KovorkingList.vue'
import KovorkingForm from './components/KovorkingForm.vue'
import BuildingDetail from './components/BuildingDetail.vue'
import UserList from './components/UserList.vue'
import UserDetail from './components/UserDetail.vue'
import BuildingList from './components/BuildingList.vue' 
import BuildingEdit from './components/BuildingEdit.vue'
import HomePage from '@/components/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage            
  },
  {
    path: '/bookings',
    name: 'bookings',
    component: BookingsList
  },
  {
    path: '/kovorkings/create',
    name: 'kovorking-create',
    component: KovorkingForm
  },
  {
    path: '/kovorkings/edit/:id',
    name: 'kovorking-edit',
    component: KovorkingForm
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
    name: 'building-edit',     
    component: BuildingEdit
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router