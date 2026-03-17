<template>
  <div class="users-list">
    <h2>Список пользователей</h2>
    
    <div v-if="loading" class="loading">Загрузка пользователей...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <table v-if="!loading && users.length" class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Имя</th>
          <th>Email</th>
          <th>Дата создания</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name || '—' }}</td>
          <td>{{ user.email || '—' }}</td>
          <td>{{ formatDate(user.created_at) }}</td>
          <td>
            <button @click="viewUser(user.id)" class="btn-view">Просмотр</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-else-if="!loading && !users.length" class="empty">
      Пользователи не найдены
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_API_URL || import.meta.env.VUE_APP_BACKEND_URL || 'http://127.0.0.1:8000/api'
axios.defaults.baseURL = backendUrl

const router = useRouter()
const users = ref([])
const loading = ref(false)
const error = ref(null)

const getToken = () => {
  return localStorage.getItem('token')
}

const fetchUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = getToken()
    
    if (!token) {
      error.value = 'Необходима авторизация'
      router.push('/login')
      return
    }
    
    const response = await axios.get('/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    users.value = response.data.data || response.data
  } catch (err) {
    error.value = 'Ошибка при загрузке пользователей'
    console.error(err)
    
    if (err.response?.status === 401) {
      error.value = 'Сессия истекла. Пожалуйста, войдите снова'
      localStorage.removeItem('token')
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

const viewUser = (userId) => {
  router.push(`/user/${userId}`)
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('ru-RU')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-list {
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #1a1a1a;
  min-height: 100vh;
}

.users-list h2 {
  color: #ffffff;
  margin-bottom: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #000000;
  border: 1px solid #333333;
}

.table th,
.table td {
  border: 1px solid #333333;
  padding: 12px 8px;
  text-align: left;
  color: #ffffff;
}

.table th {
  background-color: #000000;
  font-weight: bold;
  color: #ffffff;
  border-bottom: 2px solid #444444;
}

.table td {
  background-color: #000000;
  color: #ffffff;
}

.table tr:nth-child(even) td {
  background-color: #0a0a0a;
}

.table tr:hover td {
  background-color: #1a1a1a;
}

.btn-view {
  padding: 6px 12px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-view:hover {
  background-color: #34495e;
}

.loading {
  padding: 20px;
  text-align: center;
  font-size: 16px;
  color: #ffffff;
}

.error {
  padding: 20px;
  text-align: center;
  font-size: 16px;
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
}

.empty {
  padding: 40px;
  text-align: center;
  font-size: 16px;
  color: #999999;
}
</style>