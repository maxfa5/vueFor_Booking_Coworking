<template>
  <div class="kovorking-form-dark">
    <h2>{{ isEdit ? 'Редактирование коворкинга' : 'Создание коворкинга' }}</h2>

    <div v-if="loadingBuildings" class="info">Загрузка списка зданий...</div>
    <div v-if="loadingData" class="info">Загрузка данных коворкинга...</div>

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
  <button type="button" class="remove-btn" @click="removeImage">
    <i class="pi pi-trash"></i>
  </button>
</div>
<div v-else-if="isEdit && form.picture_url" class="preview">
  <img :src="form.picture_url" width="100" />
  <button type="button" class="remove-btn" @click="removeExistingImage">
    <i class="pi pi-trash"></i>
  </button>
</div>
      </div>

      <div class="actions">
        <button type="button" class="cancel-btn" @click="cancel">Отмена</button>
        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Создать') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'

const backendUrl = import.meta.env.VITE_API_URL
axios.defaults.baseURL = backendUrl

const router = useRouter()
const route = useRoute()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)

const buildings = ref([])
const loadingBuildings = ref(false)
const loadingData = ref(false)
const submitting = ref(false)
const imagePreview = ref(null)

const form = ref({
  id: null,
  name: '',
  building_id: null,
  floor_number: null,
  capacity: null,
  from_at: null,
  to_at: null,
  description: '',
  picture_url: null,
  image: null
})

const showApiError = (error, defaultMessage = 'Не удалось выполнить действие') => {
  const status = error.response?.status
  const data = error.response?.data

  console.log('API Error:', status, data)

  if (status === 422) {
    if (data?.errors && typeof data.errors === 'object') {
      const firstField = Object.keys(data.errors)[0]
      const firstMessage = data.errors[firstField]?.[0]
      toast.add({
        severity: 'error',
        summary: 'Ошибка валидации',
        detail: firstMessage || 'Проверьте заполнение полей',
        life: 5000,
      })
      return
    }
    if (data?.message) {
      toast.add({
        severity: 'error',
        summary: 'Ошибка валидации',
        detail: data.message,
        life: 5000,
      })
      return
    }
    toast.add({
      severity: 'error',
      summary: 'Ошибка валидации',
      detail: 'Неверные данные формы',
      life: 5000,
    })
    return
  }

  switch (status) {
    case 400:
      toast.add({ severity: 'error', summary: 'Ошибка запроса', detail: data?.message || 'Некорректные данные', life: 5000 })
      return
    case 401:
      toast.add({ severity: 'error', summary: 'Не авторизован', detail: 'Пожалуйста, войдите снова', life: 5000 })
      return
    case 403:
      toast.add({ severity: 'error', summary: 'Доступ запрещён', detail: 'У вас нет прав для этого действия', life: 5000 })
      return
    case 404:
      toast.add({ severity: 'error', summary: 'Не найдено', detail: 'Ресурс не обнаружен', life: 5000 })
      return
    case 500:
      toast.add({ severity: 'error', summary: 'Ошибка сервера', detail: 'Попробуйте позже', life: 5000 })
      return
  }

  if (data?.message) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: data.message, life: 5000 })
    return
  }

  toast.add({ severity: 'error', summary: 'Ошибка', detail: defaultMessage, life: 5000 })
}

const loadBuildings = async () => {
  loadingBuildings.value = true
  try {
    const res = await axios.get('/buildings')
    buildings.value = res.data.data || res.data || []
  } catch (err) {
    showApiError(err, 'Не удалось загрузить список зданий')
    console.error(err)
  } finally {
    loadingBuildings.value = false
  }
}

const loadKovorking = async () => {
  if (!isEdit.value) return
  
  loadingData.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`/kovorkings/${route.params.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    const data = response.data.data || response.data
    form.value = {
      id: data.id,
      name: data.name || '',
      building_id: data.building_id || null,
      floor_number: data.floor_number || null,
      capacity: data.capacity || null,
      from_at: data.from_at || null,
      to_at: data.to_at || null,
      description: data.description || '',
      picture_url: data.picture_url || null,
      image: null
    }
  } catch (err) {
    showApiError(err, 'Не удалось загрузить данные коворкинга')
    router.push('/kovorkings')
  } finally {
    loadingData.value = false
  }
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Размер файла не должен превышать 5MB',
        life: 4000
      })
      e.target.value = ''
      return
    }
    
    if (!file.type.startsWith('image/')) {
      toast.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Можно загружать только изображения',
        life: 4000
      })
      e.target.value = ''
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
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
}

const removeExistingImage = () => {
  form.value.picture_url = null
  form.value.image = null
}

const cancel = () => {
  router.push('/kovorkings')
}

const submitForm = async () => {
  if (!form.value.name) {
    toast.add({
      severity: 'warn',
      summary: 'Проверьте форму',
      detail: 'Заполните название коворкинга',
      life: 4000
    })
    return
  }
  
  if (!form.value.building_id) {
    toast.add({
      severity: 'warn',
      summary: 'Проверьте форму',
      detail: 'Выберите здание',
      life: 4000
    })
    return
  }

  submitting.value = true

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
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
    
    let response
    if (isEdit.value) {
      fd.append('_method', 'POST')
      response = await axios.post(`/kovorkings/${form.value.id}`, fd, { headers })
    } else {
      // POST запрос для создания
      response = await axios.post('/kovorkings', fd, { headers })
    }
    
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: isEdit.value 
        ? `Коворкинг "${form.value.name}" успешно обновлён!`
        : `Коворкинг "${form.value.name}" успешно создан!`,
      life: 4000
    })
    
    router.push('/kovorkings')
    
  } catch (err) {
    console.error('Submit error:', err)
    showApiError(err, isEdit.value ? 'Не удалось обновить коворкинг' : 'Не удалось создать коворкинг')
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
.kovorking-form-dark {
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

.info {
  color: #b0b0b0;
  font-style: italic;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .kovorking-form-dark {
    margin: 10px;
    padding: 16px;
  }
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>