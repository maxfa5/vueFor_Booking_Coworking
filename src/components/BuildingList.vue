<template>
  <div class="buildings-list">
    <h2>Список зданий</h2>
    
    <div class="search-box">
      <input 
        v-model="searchQuery" 
        @input="searchBuildings"
        placeholder="Поиск по названию или адресу..."
        class="search-input"
      />
    </div>
    
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <table v-if="!loading && buildings.length" class="buildings-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Название</th>
          <th>Город</th>
          <th>Адрес</th>
          <th>Этажей</th>
          <th>Время работы</th>
          <th v-if="isAuthenticated">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="building in buildings" :key="building.id">
          <td>{{ building.id }}</td>
          <td>{{ building.name }}</td>
          <td>{{ building.city?.name || '—' }}</td>
          <td>{{ building.address || '—' }}</td>
          <td>{{ building.count_floor || '—' }}</td>
          <td>{{ building.open_at || '—' }} - {{ building.close_at || '—' }}</td>
          <td v-if="isAuthenticated">
            <button @click="editBuilding(building.id)" class="btn-edit">Редактировать</button>
            <button @click="deleteBuilding(building.id)" class="btn-delete">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-else-if="!loading && !buildings.length" class="empty">
      Здания не найдены
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
const buildings = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const isAuthenticated = ref(false)

const getToken = () => {
  return localStorage.getItem('token')
}

const fetchBuildings = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = getToken()
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    
    const response = await axios.get('/buildings', { headers })
    buildings.value = response.data.data || response.data
  } catch (err) {
    error.value = 'Ошибка при загрузке зданий'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const searchBuildings = async () => {
  if (!searchQuery.value) {
    await fetchBuildings()
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const token = getToken()
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    
    const response = await axios.get(`/buildings/search?q=${searchQuery.value}`, { headers })
    buildings.value = response.data.data || response.data
  } catch (err) {
    error.value = 'Ошибка при поиске'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const deleteBuilding = async (id) => {
  if (!confirm('Удалить это здание?')) return
  
  try {
    const token = getToken()
    
    if (!token) {
      alert('Необходима авторизация')
      router.push('/login')
      return
    }
    
    await axios.delete(`/building/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    buildings.value = buildings.value.filter(b => b.id !== id)
    alert('Здание успешно удалено')
  } catch (err) {
    alert('Ошибка при удалении')
    console.error(err)
  }
}

const editBuilding = (id) => {
  if (!isAuthenticated.value) {
    alert('Необходима авторизация')
    router.push('/login')
    return
  }
  
  // Переход на страницу редактирования здания
  router.push(`/buildings/${id}/edit`)
  console.log('Redirecting to edit building:', id)
}

const checkAuth = () => {
  const token = localStorage.getItem('token')
  isAuthenticated.value = !!token
}

onMounted(() => {
  fetchBuildings()
  checkAuth()
})
</script>

<style scoped>
.buildings-list {
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #1a1a1a;
  min-height: 100vh;
  color: #ffffff;
}

.buildings-list h2 {
  color: #ffffff;
  margin-bottom: 20px;
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px;
  border: 1px solid #333333;
  border-radius: 4px;
  font-size: 14px;
  background-color: #000000;
  color: #ffffff;
}

.search-input::placeholder {
  color: #666666;
}

.buildings-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #000000;
  border: 1px solid #333333;
}

.buildings-table th,
.buildings-table td {
  border: 1px solid #333333;
  padding: 12px 8px;
  text-align: left;
  color: #ffffff;
}

.buildings-table th {
  background-color: #000000;
  font-weight: bold;
  color: #ffffff;
  border-bottom: 2px solid #444444;
}

.buildings-table td {
  background-color: #000000;
  color: #ffffff;
}

.buildings-table tr:nth-child(even) td {
  background-color: #0a0a0a;
}

.buildings-table tr:hover td {
  background-color: #1a1a1a;
}

.btn-edit, .btn-delete {
  padding: 6px 12px;
  margin: 0 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-edit {
  background-color: #2c3e50;
  color: white;
}

.btn-edit:hover {
  background-color: #34495e;
}

.btn-delete {
  background-color: #c0392b;
  color: white;
}

.btn-delete:hover {
  background-color: #e74c3c;
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