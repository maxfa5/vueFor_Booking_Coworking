<template>
  <div class="kovorking-edit-dark">
    <h2>Редактирование коворкинга</h2>

    <div v-if="loading" class="info">Загрузка данных...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <form @submit.prevent="submitForm" class="simple-form" v-if="!loading">
      <div class="form-group">
        <label>Название *</label>
        <input v-model="form.name" type="text" required />
      </div>

      <div class="form-group">
        <label>Здание *</label>
        <select v-model="form.building_id" required>
          <option :value="null">-- Выберите здание --</option>
          <option v-for="b in buildings" :key="b.id" :value="b.id">
            {{ b.name }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Этаж</label>
          <input v-model.number="form.floor_number" type="number" />
        </div>
        <div class="form-group">
          <label>Вместимость (чел)</label>
          <input v-model.number="form.capacity" type="number" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Время открытия</label>
          <input v-model="form.from_at" type="time" />
        </div>
        <div class="form-group">
          <label>Время закрытия</label>
          <input v-model="form.to_at" type="time" />
        </div>
      </div>

      <div class="form-group">
        <label>Описание</label>
        <textarea v-model="form.description" rows="3"></textarea>
      </div>

      <!-- Текущее изображение -->
      <div class="form-group" v-if="kovorking?.picture_url">
        <label>Текущее изображение</label>
        <div class="current-image">
          <img :src="kovorking.picture_url" width="120" />
        </div>
      </div>

      <div class="form-group">
        <label>Новое изображение (опционально)</label>
        <input type="file" @change="onFileChange" accept="image/*" />
        <div v-if="imagePreview" class="preview">
          <img :src="imagePreview" width="100" />
          <button type="button" class="remove-btn" @click="removeImage">🗑️</button>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="cancel-btn" @click="$router.push('/kovorkings')">Отмена</button>
        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_API_URL
axios.defaults.baseURL = backendUrl

const router = useRouter()
const route = useRoute()
const kovorkingId = route.params.id

const loading = ref(false)
const error = ref(null)
const submitting = ref(false)
const buildings = ref([])
const kovorking = ref(null)
const imagePreview = ref(null)

const form = ref({
  name: '',
  building_id: null,
  floor_number: null,
  capacity: null,
  from_at: null,
  to_at: null,
  description: '',
  image: null
})

// Загрузка списка зданий
const loadBuildings = async () => {
  try {
    const res = await axios.get('/buildings')
    buildings.value = res.data.data || res.data || []
  } catch (err) {
    console.error('Ошибка загрузки зданий', err)
  }
}

// Загрузка данных редактируемого коворкинга
const loadKovorking = async () => {
  loading.value = true
  try {
    const res = await axios.get(`/kovorking/${kovorkingId}`)
    kovorking.value = res.data

    // Преобразование времени из "HH:MM:SS" в "HH:MM" для input type="time"
    const formatTime = (timeStr) => {
      if (!timeStr) return null
      const parts = timeStr.split(':')
      return `${parts[0]}:${parts[1]}`
    }

    form.value = {
      name: kovorking.value.name || '',
      building_id: kovorking.value.building_id || null,
      floor_number: kovorking.value.floor_number || null,
      capacity: kovorking.value.capacity || null,
      from_at: formatTime(kovorking.value.from_at),
      to_at: formatTime(kovorking.value.to_at),
      description: kovorking.value.description || '',
      image: null
    }
  } catch (err) {
    error.value = 'Не удалось загрузить данные коворкинга'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Обработка выбора файла (новое изображение)
const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 20 * 1024 * 1024) {
      error.value = 'Размер файла не должен превышать 20MB'
      return
    }
    if (!file.type.startsWith('image/')) {
      error.value = 'Пожалуйста, выберите изображение'
      return
    }
    form.value.image = file
    const reader = new FileReader()
    reader.onload = (ev) => { imagePreview.value = ev.target.result }
    reader.readAsDataURL(file)
  } else {
    form.value.image = null
    imagePreview.value = null
  }
}

const removeImage = () => {
  form.value.image = null
  imagePreview.value = null
  document.querySelector('input[type="file"]').value = ''
}

// Отправка формы (PUT)
const submitForm = async () => {
  if (!form.value.name ) {
    error.value = 'Заполните название'
    return
  }

  submitting.value = true
  error.value = null

  const fd = new FormData()
  fd.append('name', form.value.name)
  fd.append('building_id', form.value.building_id)
  if (form.value.floor_number) fd.append('floor_number', form.value.floor_number)
  if (form.value.capacity) fd.append('capacity', form.value.capacity)
  if (form.value.from_at) fd.append('from_at', form.value.from_at)
  if (form.value.to_at) fd.append('to_at', form.value.to_at)
  if (form.value.description) fd.append('description', form.value.description)
  if (form.value.image) fd.append('image', form.value.image)
  fd.append('_method', 'PUT')   // Laravel spoofing

  try {
    const token = localStorage.getItem('token')
    await axios.post(`/kovorkings/${kovorkingId}`, fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    })
    router.push('/kovorkings')
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка обновления'
    console.error(err)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadBuildings()
  loadKovorking()
})
</script>

<style scoped>
/* Тёмная тема – полностью как в Create */
.kovorking-edit-dark {
  max-width: 700px;
  margin: 20px auto;
  background: #1e1e2f;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  color: #e0e0e0;
}

h2 {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 1.8rem;
  font-weight: 500;
  color: #ffffff;
  border-left: 4px solid #42a5f5;
  padding-left: 16px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #b0b0b0;
}

input, select, textarea {
  width: 100%;
  padding: 10px 12px;
  background: #2a2a3a;
  border: 1px solid #3a3a4a;
  border-radius: 8px;
  font-size: 14px;
  color: #f0f0f0;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #42a5f5;
  box-shadow: 0 0 0 2px rgba(66, 165, 245, 0.2);
}

select option {
  background: #2a2a3a;
  color: #f0f0f0;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

button:active {
  transform: scale(0.98);
}

.submit-btn {
  background: #42a5f5;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #1e88e5;
}

.submit-btn:disabled {
  background: #5c5c7a;
  cursor: not-allowed;
}

.cancel-btn {
  background: #3a3a4a;
  color: #e0e0e0;
}

.cancel-btn:hover {
  background: #4a4a5a;
}

.remove-btn {
  background: #c62828;
  color: white;
  padding: 6px 12px;
  font-size: 14px;
}

.remove-btn:hover {
  background: #b71c1c;
}

.current-image, .preview {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #2a2a3a;
  padding: 10px;
  border-radius: 8px;
  display: inline-flex;
}

.current-image img, .preview img {
  border-radius: 6px;
  border: 1px solid #4a4a5a;
}

.error {
  color: #ff8a80;
  background: #3a1a1a;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #f44336;
}

.info {
  color: #b0b0b0;
  font-style: italic;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .kovorking-edit-dark {
    margin: 10px;
    padding: 16px;
  }
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>