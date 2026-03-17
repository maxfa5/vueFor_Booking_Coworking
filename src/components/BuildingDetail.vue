<template>
  <div class="building-detail">
    <button @click="goBack" class="back-button">← Назад</button>
    
    <div v-if="loading" class="loading">Загрузка данных о здании...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="!loading && building" class="content">
      <h1>{{ building.name }}</h1>
      
      <div class="info-card">
        <h2>Основная информация</h2>
        <p><strong>Адрес:</strong> {{ building.address || '—' }}</p>
        <p><strong>Город:</strong> {{ building.city?.name || '—' }}</p>
        <p><strong>Количество этажей:</strong> {{ building.count_floor || '—' }}</p>
        <p><strong>Время работы:</strong> {{ building.open_at || '—' }} - {{ building.close_at || '—' }}</p>
        <p><strong>Часовой пояс:</strong> {{ building.timezone || '—' }}</p>
      </div>
      
      <div v-if="building.kovorkings?.length" class="kovorkings-section">
        <h2>Коворкинги в этом здании</h2>
        
        <div class="kovorkings-grid">
          <div 
            v-for="kovorking in building.kovorkings" 
            :key="kovorking.id" 
            class="kovorking-card"
            @click="goToKovorking(kovorking.id)"
          >
            <h3>{{ kovorking.name }}</h3>
            <p><strong>Этаж:</strong> {{ kovorking.floor_number || '—' }}</p>
            <p><strong>Вместимость:</strong> {{ kovorking.capacity || '—' }} чел.</p>
            <p><strong>Время работы:</strong> 
              {{ kovorking.from_at || '—' }} - {{ kovorking.to_at || '—' }}
            </p>
          </div>
        </div>
      </div>
      
      <div v-else class="empty">
        В этом здании нет коворкингов
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
const building = ref(null)
const loading = ref(false)
const error = ref(null)

const getToken = () => {
  return localStorage.getItem('token')
}

const fetchBuilding = async () => {
  loading.value = true
  error.value = null
  
  try {
    const buildingId = route.params.id
    
    if (!buildingId) {
      error.value = 'ID здания не указан'
      return
    }
    
    console.log('Fetching building with ID:', buildingId)
    
    const token = getToken()
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    
    const response = await axios.get(`/buildings/${buildingId}?with=kovorkings`, { headers })
    
    console.log('Building response:', response.data)
    building.value = response.data.data || response.data
    
  } catch (err) {
    console.error('Error fetching building:', err)
    
    if (err.response?.status === 401) {
      error.value = 'Необходима авторизация'
      setTimeout(() => router.push('/login'), 2000)
    } else if (err.response?.status === 403) {
      error.value = 'Нет доступа к информации об этом здании'
    } else if (err.response?.status === 404) {
      error.value = 'Здание не найдено'
    } else if (err.response?.status === 500) {
      error.value = 'Ошибка сервера'
    } else {
      error.value = 'Ошибка при загрузке информации о здании'
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const goToKovorking = (kovorkingId) => {
  router.push(`/kovorkings/${kovorkingId}`)
}

onMounted(() => {
  console.log('BuildingDetail mounted with params:', route.params)
  fetchBuilding()
})
</script>

<style scoped>
.building-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #1a1a1a;
  min-height: 100vh;
  color: #ffffff;
}

.back-button {
  padding: 8px 16px;
  margin-bottom: 20px;
  border: none;
  background: #000000;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid #333333;
}

.back-button:hover {
  background: #1a1a1a;
}

.content {
  background: #000000;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid #333333;
}

.content h1 {
  color: #ffffff;
  margin-bottom: 20px;
}

.info-card {
  background: #0a0a0a;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #333333;
}

.info-card h2 {
  color: #ffffff;
  margin-bottom: 15px;
  font-size: 18px;
}

.info-card p {
  margin: 12px 0;
  line-height: 1.5;
  color: #cccccc;
}

.info-card p strong {
  color: #ffffff;
  min-width: 150px;
  display: inline-block;
}

.kovorkings-section {
  margin-top: 30px;
}

.kovorkings-section h2 {
  color: #ffffff;
  margin-bottom: 20px;
}

.kovorkings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.kovorking-card {
  border: 1px solid #333333;
  border-radius: 8px;
  padding: 16px;
  background-color: #000000;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kovorking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
  background-color: #0a0a0a;
}

.kovorking-card h3 {
  margin: 0 0 10px 0;
  color: #ffffff;
  font-size: 16px;
}

.kovorking-card p {
  margin: 8px 0;
  color: #cccccc;
  font-size: 14px;
}

.kovorking-card p strong {
  color: #ffffff;
}

.loading {
  padding: 40px;
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
  margin: 20px 0;
  border: 1px solid #ff6b6b;
}

.empty {
  padding: 40px;
  text-align: center;
  font-size: 16px;
  color: #999999;
  background: #0a0a0a;
  border-radius: 4px;
  margin-top: 20px;
  border: 1px solid #333333;
}
</style>