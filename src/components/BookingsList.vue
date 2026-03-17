<template>
  <div class="bookings-list">
    <h2>Список бронирований</h2>
    
    <div v-if="loading" class="loading">Загрузка...</div>
    
    <div v-if="error" class="error">{{ error }}</div>
    
    <table v-if="!loading && bookings.data?.length" class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Коворкинг</th>
          <th>Пользователь</th>
          <th>Начало</th>
          <th>Конец</th>
          <th>Период с</th>
          <th>Период по</th>
          <th>День недели</th>
          <th>Тип</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in bookings.data" :key="booking.id">
          <td>{{ booking.id }}</td>
          <td>{{ booking.kovorking?.name || '—' }}</td>
          <td>{{ booking.user?.name || '—' }}</td>
          <td>{{ formatDate(booking.start_time) }}</td>
          <td>{{ formatDate(booking.end_time) }}</td>
          <td>{{ booking.period_start_at || '—' }}</td>
          <td>{{ booking.period_end_at || '—' }}</td>
          <td>{{ booking.day_of_week || '—' }}</td>
          <td>{{ booking.type || '—' }}</td>
        </tr>
      </tbody>
    </table>
    
    <div v-else-if="!loading && !bookings.data?.length" class="empty">
      Нет бронирований
    </div>
    
    <div v-if="bookings.links" class="pagination">
      <button 
        v-for="link in bookings.links" 
        :key="link.label"
        @click="fetchPage(link.url)"
        :disabled="!link.url || link.active"
        v-html="link.label"
      >
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_API_URL || import.meta.env.VUE_APP_BACKEND_URL || 'http://127.0.0.1:8000/api'
const debug = import.meta.env.VITE_APP_DEBUG === 'true'

if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = backendUrl
  console.log(backendUrl);
}

const bookings = ref({ data: [] })
const loading = ref(false)
const error = ref(null)

const fetchBookings = async (url = '/bookings') => {
  loading.value = true
  error.value = null
  
  try {
    if (debug) console.log('Fetching bookings from:', url)
    
    const response = await axios.get(url)
    
    if (debug) console.log('Bookings response:', response.data)
    
    bookings.value = response.data
  } catch (err) {
    error.value = 'Ошибка при загрузке бронирований'
    console.error('Error fetching bookings:', err)
    
    if (debug && err.response) {
      console.error('Error details:', {
        status: err.response.status,
        data: err.response.data,
        headers: err.response.headers
      })
    }
  } finally {
    loading.value = false
  }
}

const fetchPage = (url) => {
  if (url) {
    const urlObj = new URL(url)
    const pageParam = urlObj.searchParams.get('page')
    if (pageParam) {
      fetchBookings(`/bookings?page=${pageParam}`)
    } else {
      fetchBookings()
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('ru-RU')
}

onMounted(() => {
  fetchBookings()
})
</script>

<style scoped>
.bookings-list {
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #1a1a1a;
  min-height: 100vh;
  color: #ffffff;
}

.bookings-list h2 {
  color: #ffffff;
  margin-bottom: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #000000;
  color: #ffffff;
  border: 1px solid #333333;
}

.table th,
.table td {
  border: 1px solid #333333;
  padding: 12px 8px;
  text-align: left;
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

.loading,
.error,
.empty {
  padding: 20px;
  text-align: center;
  font-size: 16px;
}

.loading {
  color: #ffffff;
}

.error {
  color: #ff6b6b;
}

.empty {
  color: #999999;
}

.pagination {
  margin-top: 20px;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.pagination button {
  padding: 8px 12px;
  border: 1px solid #333333;
  background: #000000;
  color: #ffffff;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #1a1a1a;
  border-color: #666666;
}

.pagination button:disabled {
  background: #222222;
  cursor: not-allowed;
  color: #666666;
  border-color: #333333;
}

/* Стили для активной страницы пагинации */
.pagination button[disabled] {
  background: #333333;
  color: #ffffff;
  font-weight: bold;
}
</style>