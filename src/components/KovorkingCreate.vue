<template>
  <div class="kovorking-create-dark">
    <h2>Создание коворкинга</h2>

    <div v-if="loadingBuildings" class="info">Загрузка списка зданий...</div>
    
    <div v-if="error" class="error">
      <strong>Ошибка:</strong> {{ error }}
    </div>
    
    <div v-if="serverErrors.length" class="error-list">
      <strong>Не удалось создать коворкинг:</strong>
      <ul>
        <li v-for="(err, idx) in serverErrors" :key="idx">{{ err }}</li>
      </ul>
    </div>

    <form @submit.prevent="submitForm" class="simple-form">
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

      <div class="form-group">
        <label>Изображение</label>
        <input type="file" @change="onFileChange" accept="image/*" />
        <div v-if="imagePreview" class="preview">
          <img :src="imagePreview" width="100" />
          <button type="button" class="remove-btn" @click="removeImage">🗑️</button>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="cancel-btn" @click="cancel">Отмена</button>
        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? 'Сохранение...' : 'Создать' }}
        </button>
      </div>
    </form>
    
    <!-- Блок результата создания (без перехода) -->
    <div v-if="createSuccess" class="success">
      Коворкинг "{{ createdKovorkingName }}" успешно создан!
      <button class="success-btn" @click="resetForm">Создать ещё</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_API_URL
axios.defaults.baseURL = backendUrl

const router = useRouter()

const buildings = ref([])
const loadingBuildings = ref(false)
const error = ref(null)
const serverErrors = ref([])
const submitting = ref(false)
const imagePreview = ref(null)
const createSuccess = ref(false)
const createdKovorkingName = ref('')

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

const loadBuildings = async () => {
  loadingBuildings.value = true
  try {
    const res = await axios.get('/buildings')
    buildings.value = res.data.data || res.data || []
  } catch (err) {
    error.value = 'Не удалось загрузить здания'
    console.error(err)
  } finally {
    loadingBuildings.value = false
  }
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
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
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
}

const resetForm = () => {
  createSuccess.value = false
  createdKovorkingName.value = ''
  form.value = {
    name: '',
    building_id: null,
    floor_number: null,
    capacity: null,
    from_at: null,
    to_at: null,
    description: '',
    image: null
  }
  imagePreview.value = null
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
  serverErrors.value = []
  error.value = null
}

const cancel = () => {
  router.push('/kovorkings')
}

const submitForm = async () => {
  // Валидация
  if (!form.value.name) {
    error.value = 'Заполните название'
    return
  }
  
  if (!form.value.building_id) {
    error.value = 'Выберите здание'
    return
  }

  submitting.value = true
  error.value = null
  serverErrors.value = []
  createSuccess.value = false

  const fd = new FormData()
  fd.append('name', form.value.name)
  fd.append('building_id', form.value.building_id)
  if (form.value.floor_number) fd.append('floor_number', form.value.floor_number)
  if (form.value.capacity) fd.append('capacity', form.value.capacity)
  if (form.value.from_at) fd.append('from_at', form.value.from_at)
  if (form.value.to_at) fd.append('to_at', form.value.to_at)
  if (form.value.description) fd.append('description', form.value.description)
  if (form.value.image) fd.append('image', form.value.image)

  try {
    const token = localStorage.getItem('token')
    const response = await axios.post('/kovorkings', fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    })
    
    createSuccess.value = true
    createdKovorkingName.value = form.value.name
    
    form.value = {
      name: '',
      building_id: null,
      floor_number: null,
      capacity: null,
      from_at: null,
      to_at: null,
      description: '',
      image: null
    }
    imagePreview.value = null
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.value = ''
    
  } catch (err) {
    console.error('Create error:', err)
    
    if (err.response?.data) {
      const data = err.response.data
      
      if (data.errors && typeof data.errors === 'object') {
        const errors = []
        for (const field in data.errors) {
          if (Array.isArray(data.errors[field])) {
            errors.push(`${field}: ${data.errors[field].join(', ')}`)
          } else {
            errors.push(`${field}: ${data.errors[field]}`)
          }
        }
        serverErrors.value = errors
      } 
      else if (data.message) {
        error.value = data.message
      }
      else if (typeof data === 'string') {
        error.value = data
      }
      else {
        error.value = 'Ошибка создания коворкинга'
      }
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = 'Неизвестная ошибка'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadBuildings()
})
</script>

<style scoped>
.kovorking-create-dark {
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

.preview {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #2a2a3a;
  padding: 10px;
  border-radius: 8px;
  display: inline-flex;
}

.preview img {
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

.error-list {
  color: #ff8a80;
  background: #3a1a1a;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #f44336;
}

.error-list ul {
  margin: 8px 0 0 20px;
  padding: 0;
}

.error-list li {
  margin: 4px 0;
}

.success {
  color: #a5d6a7;
  background: #1a3a1a;
  padding: 12px;
  border-radius: 8px;
  margin-top: 20px;
  border-left: 4px solid #4caf50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.success-btn {
  background: #4caf50;
  color: white;
  padding: 6px 12px;
  font-size: 13px;
}

.success-btn:hover {
  background: #388e3c;
}

.info {
  color: #b0b0b0;
  font-style: italic;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .kovorking-create-dark {
    margin: 10px;
    padding: 16px;
  }
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>