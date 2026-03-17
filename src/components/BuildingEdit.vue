<template>
  <div class="building-edit">
    <button @click="goBack" class="back-button">← Назад</button>
    
    <h2>{{ isEditMode ? 'Редактирование здания' : 'Создание нового здания' }}</h2>
    
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <form v-if="!loading && formReady" @submit.prevent="saveBuilding" class="edit-form">
      <div class="form-group">
        <label for="name">Название здания *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="Введите название здания"
        />
      </div>
      
      <div class="form-group">
        <label for="city_id">Город *</label>
        <select id="city_id" v-model="form.city_id" required>
          <option value="" disabled>Выберите город</option>
          <option v-for="city in cities" :key="city.id" :value="city.id">
            {{ city.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="address">Адрес *</label>
        <input
          id="address"
          v-model="form.address"
          type="text"
          required
          placeholder="Введите адрес"
        />
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="count_floor">Количество этажей</label>
          <input
            id="count_floor"
            v-model="form.count_floor"
            type="number"
            min="1"
            max="1000"
            placeholder="Например: 5"
          />
        </div>
        
        <div class="form-group">
          <label for="timezone">Часовой пояс</label>
          <input
            id="timezone"
            v-model="form.timezone"
            type="text"
            placeholder="Например: Europe/Moscow"
          />
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="open_at">Время открытия *</label>
          <input
            id="open_at"
            v-model="form.open_at"
            type="time"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="close_at">Время закрытия *</label>
          <input
            id="close_at"
            v-model="form.close_at"
            type="time"
            required
          />
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="goBack" class="btn-cancel">Отмена</button>
        <button type="submit" class="btn-save" :disabled="saving">
          {{ saving ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Создать здание') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_API_URL || import.meta.env.VUE_APP_BACKEND_URL || 'http://127.0.0.1:8000/api'
axios.defaults.baseURL = backendUrl

const route = useRoute()
const router = useRouter()
const buildingId = route.params.id

const isEditMode = computed(() => buildingId && buildingId !== 'create')

const form = reactive({
  name: '',
  city_id: '',
  address: '',
  count_floor: '',
  timezone: '',
  open_at: '',
  close_at: ''
})

const cities = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const formReady = ref(false)

const getToken = () => {
  return localStorage.getItem('token')
}

const fetchCities = async () => {
  try {
    const response = await axios.get('/cities')
    cities.value = response.data.data || response.data
  } catch (err) {
    console.error('Error fetching cities:', err)
    error.value = 'Ошибка при загрузке списка городов'
  }
}

const fetchBuilding = async () => {
  if (!isEditMode.value) {
    formReady.value = true
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const token = getToken()
    
    if (!token) {
      error.value = 'Необходима авторизация'
      setTimeout(() => router.push('/login'), 2000)
      return
    }
    
    const response = await axios.get(`/buildings/${buildingId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    const building = response.data.data || response.data
    
    // Заполняем форму данными здания
    form.name = building.name || ''
    form.city_id = building.city_id || ''
    form.address = building.address || ''
    form.count_floor = building.count_floor || ''
    form.timezone = building.timezone || ''
    form.open_at = building.open_at || ''
    form.close_at = building.close_at || ''
    
    formReady.value = true
  } catch (err) {
    console.error('Error fetching building:', err)
    
    if (err.response?.status === 401) {
      error.value = 'Сессия истекла. Пожалуйста, войдите снова'
      setTimeout(() => router.push('/login'), 2000)
    } else if (err.response?.status === 404) {
      error.value = 'Здание не найдено'
    } else {
      error.value = 'Ошибка при загрузке данных здания'
    }
  } finally {
    loading.value = false
  }
}

const saveBuilding = async () => {
  saving.value = true
  error.value = null
  
  try {
    const token = getToken()
    
    if (!token) {
      error.value = 'Необходима авторизация'
      setTimeout(() => router.push('/login'), 2000)
      return
    }
    
    const headers = { 'Authorization': `Bearer ${token}` }
    
    if (isEditMode.value) {
      // Обновление существующего здания
      await axios.put(`/building/${buildingId}`, form, { headers })
      alert('Здание успешно обновлено')
    } else {
      // Создание нового здания
      await axios.post('/buildings', form, { headers })
      alert('Здание успешно создано')
    }
    
    // Возвращаемся к списку зданий
    router.push('/buildings')
  } catch (err) {
    console.error('Error saving building:', err)
    
    if (err.response?.status === 422) {
      // Ошибки валидации
      const errors = err.response.data.errors
      const errorMessages = Object.values(errors).flat().join('\n')
      error.value = errorMessages
    } else if (err.response?.status === 401) {
      error.value = 'Необходима авторизация'
      setTimeout(() => router.push('/login'), 2000)
    } else if (err.response?.status === 403) {
      error.value = 'Нет прав для выполнения этого действия'
    } else {
      error.value = 'Ошибка при сохранении здания'
    }
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  await fetchCities()
  await fetchBuilding()
})
</script>

<style scoped>
.building-edit {
  max-width: 800px;
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

h2 {
  color: #ffffff;
  margin-bottom: 20px;
}

.edit-form {
  background: #000000;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #333333;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #ffffff;
  font-weight: bold;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #333333;
  border-radius: 4px;
  font-size: 14px;
  background-color: #1a1a1a;
  color: #ffffff;
}

input:focus, select:focus {
  outline: none;
  border-color: #4CAF50;
}

input::placeholder {
  color: #666666;
}

select option {
  background-color: #1a1a1a;
  color: #ffffff;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-cancel, .btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-cancel {
  background-color: #666666;
  color: white;
}

.btn-cancel:hover {
  background-color: #777777;
}

.btn-save {
  background-color: #4CAF50;
  color: white;
}

.btn-save:hover {
  background-color: #45a049;
}

.btn-save:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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
  white-space: pre-line;
}
</style>