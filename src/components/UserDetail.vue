<template>
  <div class="user-detail">
    <button @click="goBack" class="back-button">← Назад к списку</button>
    
    <div v-if="loading" class="loading">Загрузка данных пользователя...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="!loading && user" class="content">
      <h1>{{ user.name || 'Пользователь' }}</h1>
      
      <div class="info-card">
        <h2>Основная информация</h2>
        <p><strong>ID:</strong> {{ user.id }}</p>
        <p><strong>Имя:</strong> {{ user.name || '—' }}</p>
        <p><strong>Email:</strong> {{ user.email || '—' }}</p>
        <p><strong>Дата регистрации:</strong> {{ formatDate(user.created_at) }}</p>
        <p><strong>Последнее обновление:</strong> {{ formatDate(user.updated_at) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_API_URL || import.meta.env.VUE_APP_BACKEND_URL || 'http://127.0.0.1:8000/api'
axios.defaults.baseURL = backendUrl

const route = useRoute()
const router = useRouter()
const user = ref(null)
const loading = ref(false)
const error = ref(null)

const getToken = () => {
  return localStorage.getItem('token')
}

const fetchUser = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = getToken()
    
    if (!token) {
      error.value = 'Необходима авторизация'
      setTimeout(() => router.push('/login'), 2000)
      return
    }
    
    const userId = route.params.id
    console.log('Fetching user with ID:', userId)
    
    const response = await axios.get(`/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('User response:', response.data)
    user.value = response.data.data || response.data
  } catch (err) {
    error.value = 'Ошибка при загрузке информации о пользователе'
    console.error('Error fetching user:', err)
    
    if (err.response?.status === 401) {
      error.value = 'Сессия истекла. Пожалуйста, войдите снова'
      localStorage.removeItem('token')
      setTimeout(() => router.push('/login'), 2000)
    } else if (err.response?.status === 404) {
      error.value = 'Пользователь не найден'
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('ru-RU')
}

onMounted(() => {
  console.log('UserDetail mounted with route params:', route.params)
  fetchUser()
})
</script>