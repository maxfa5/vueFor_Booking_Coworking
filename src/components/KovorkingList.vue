<template>
  <div class="kovorkings-list">
    <h2>Коворкинги</h2>
    
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <table v-if="!loading && kovorkings.length" class="kovorkings-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Название</th>
          <th>Здание</th>
          <th>Этаж</th>
          <th>Вместимость</th>
          <th>Время работы</th>
          <th>Тип</th>
          <th>Часовой пояс</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="kovorking in kovorkings" 
          :key="kovorking.id"
          @click="selectKovorking(kovorking)"
          class="clickable-row"
        >
          <td>{{ kovorking.id }}</td>
          <td>{{ kovorking.name }}</td>
          <td>{{ kovorking.building?.name || '—' }}</td>
          <td>{{ kovorking.floor_number || '—' }}</td>
          <td>{{ kovorking.capacity || '—' }} чел.</td>
          <td>{{ kovorking.from_at || '—' }} - {{ kovorking.to_at || '—' }}</td>
          <td>{{ kovorking.type_id || '—' }}</td>
          <td>{{ kovorking.timezone || '—' }}</td>
        </tr>
      </tbody>
    </table>
    
    <div v-else-if="!loading && !kovorkings.length" class="empty">
      Нет доступных коворкингов
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const backendUrl = import.meta.env.VITE_API_URL || import.meta.env.VUE_APP_BACKEND_URL || 'http://127.0.0.1:8000/api'
axios.defaults.baseURL = backendUrl

const router = useRouter()
const kovorkings = ref([])
const loading = ref(false)
const error = ref(null)

const fetchKovorkings = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get('/kovorkings')
    kovorkings.value = response.data.data || response.data
  } catch (err) {
    error.value = 'Ошибка при загрузке коворкингов'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const selectKovorking = (kovorking) => {
  router.push(`/kovorkings/${kovorking.id}`)
}

onMounted(() => {
  fetchKovorkings()
})
</script>

<style scoped>
.kovorkings-list {
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #1a1a1a;
  min-height: 100vh;
  color: #ffffff;
}

.kovorkings-list h2 {
  color: #ffffff;
  margin-bottom: 20px;
}

.kovorkings-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #000000;
  border: 1px solid #333333;
}

.kovorkings-table th,
.kovorkings-table td {
  border: 1px solid #333333;
  padding: 12px 8px;
  text-align: left;
  color: #ffffff;
}

.kovorkings-table th {
  background-color: #000000;
  font-weight: bold;
  color: #ffffff;
  border-bottom: 2px solid #444444;
}

.kovorkings-table td {
  background-color: #000000;
  color: #ffffff;
}

.kovorkings-table tr:nth-child(even) td {
  background-color: #0a0a0a;
}

.kovorkings-table tr:hover td {
  background-color: #1a1a1a;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
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