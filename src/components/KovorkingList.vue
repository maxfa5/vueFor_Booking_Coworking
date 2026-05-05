<template>
  <div class="kovorkings-list">
    <div class="header">
      <h2>Коворкинги</h2>
      <div class="header-actions">
        <div class="search-container">
          <i class="pi pi-search search-icon"></i>
          <InputText 
            v-model="searchQuery" 
            placeholder="Поиск по названию..." 
            class="search-input"
            @keyup.enter="performSearch"
            @input="onSearchInput"
          />
          <Button 
            v-if="searchQuery" 
            icon="pi pi-times" 
            class="clear-search-btn" 
            text 
            @click="clearSearch"
          />
        </div>
        <Button 
          label="Создать коворкинг" 
          icon="pi pi-plus" 
          @click="goToCreate"
          class="p-button-primary"
        />
      </div>
    </div>
    
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <!-- Результаты поиска -->
    <div v-if="searchQuery && !loading && !error" class="search-info">
      <i class="pi pi-info-circle"></i>
      Результаты поиска по запросу: <strong>"{{ searchQuery }}"</strong>
      <span> (найдено: {{ kovorkings_total }})</span>
    </div>
    
    <DataTable
      v-if="!loading && kovorkings.length"
      :value="kovorkings"
      :lazy="true"
      :paginator="true"
      :rows="perpage"
      :rowsPerPageOptions="[2, 5, 10]"
      :totalRecords="kovorkings_total"
      @page="onPageChange"
      :first="offset"
      data-key="id"
      class="kovorkings-table"
    >
      <Column field="id" header="ID" style="width: 80px" />
      
      <Column field="picture_url" header="Изображение" style="width: 80px">
        <template #body="{ data }">
          <img 
            v-if="data.picture_url" 
            :src="data.picture_url" 
            class="preview-img" 
            alt="коворкинг"
          />
          <span v-else class="no-img">—</span>
        </template>
      </Column>
      
      <Column field="name" header="Название" />
      <Column field="building.name" header="Здание" />
      <Column field="floor_number" header="Этаж" />
      <Column field="capacity" header="Вместимость">
        <template #body="{ data }">
          {{ data.capacity || '—' }} чел.
        </template>
      </Column>
      <Column field="from_at" header="Время работы">
        <template #body="{ data }">
          {{ data.from_at || '—' }} - {{ data.to_at || '—' }}
        </template>
      </Column>
     
      <Column header="Действия" style="width: 120px">
        <template #body="{ data }">
          <Button 
            icon="pi pi-pencil" 
            class="p-button-rounded p-button-text p-button-info" 
            @click="editKovorking(data.id)"
          />
          <Button 
            icon="pi pi-trash" 
            class="p-button-rounded p-button-text p-button-danger" 
            @click="deleteKovorking(data)"
          />
        </template>
      </Column>
    </DataTable>
    
    <div v-else-if="!loading && !kovorkings.length && !error" class="empty">
      <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc;"></i>
      <p v-if="searchQuery">Ничего не найдено по запросу "{{ searchQuery }}"</p>
      <p v-else>Нет доступных коворкингов</p>
      <Button 
        v-if="searchQuery" 
        label="Очистить поиск" 
        icon="pi pi-times" 
        @click="clearSearch"
        class="p-button-outlined"
      />
      <Button 
        v-else 
        label="Создать первый коворкинг" 
        icon="pi pi-plus" 
        @click="goToCreate"
        class="p-button-primary p-button-outlined"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_API_URL
axios.defaults.baseURL = backendUrl

const router = useRouter()
const toast = useToast()

const kovorkings = ref([])
const kovorkings_total = ref(0)
const loading = ref(false)
const error = ref(null)
const perpage = ref(10)
const offset = ref(0)
const searchQuery = ref('')
let searchTimeout = null

const fetchKovorkings = async (page = 1, perPage = 10, search = '') => {
  loading.value = true
  error.value = null
  
  try {
    const params = {
      page: page,
      perpage: perPage
    }
    
    if (search) {
      params.search = search
    }
    
    const response = await axios.get('/kovorkings', { params })
    
    console.log('Kovorkings API Response:', response.data)
    
    if (response.data && response.data.data) {
      kovorkings.value = response.data.data
      kovorkings_total.value = response.data.total || response.data.data.length
    } else if (Array.isArray(response.data)) {
      kovorkings.value = response.data
      kovorkings_total.value = response.data.length
    } else {
      kovorkings.value = []
      kovorkings_total.value = 0
    }
  } catch (err) {
    error.value = 'Ошибка при загрузке коворкингов'
    console.error(err)
    kovorkings.value = []
    kovorkings_total.value = 0
  } finally {
    loading.value = false
  }
}

const fetchKovorkingsTotal = async (search = '') => {
  try {
    const params = {}
    if (search) {
      params.search = search
    }
    const response = await axios.get('/kovorkings_total', { params })
    kovorkings_total.value = typeof response.data === 'number' 
      ? response.data 
      : (response.data.total || 0)
  } catch (err) {
    console.error('Error fetching total:', err)
    kovorkings_total.value = 0
  }
}

const onPageChange = (event) => {
  offset.value = event.first
  perpage.value = event.rows
  const page = event.first / event.rows + 1
  fetchKovorkings(page, event.rows, searchQuery.value)
}

const performSearch = () => {
  offset.value = 0
  fetchKovorkings(1, perpage.value, searchQuery.value)
  fetchKovorkingsTotal(searchQuery.value)
}

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    performSearch()
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  performSearch()
}

const goToCreate = () => {
  router.push('/kovorkings/create')
}

const editKovorking = (id) => {
  router.push(`/kovorkings/edit/${id}`)
}

const showDeleteSuccess = (name) => {
  toast.add({
    severity: 'success',
    summary: 'Успешно',
    detail: `Коворкинг "${name}" успешно удалён!`,
    life: 4000,
    closable: true
  })
}

const showDeleteError = (message) => {
  toast.add({
    severity: 'error',
    summary: 'Ошибка удаления',
    detail: message || 'Не удалось удалить коворкинг',
    life: 5000,
    closable: true
  })
}

const deleteKovorking = async (kovorking) => {
  const id = kovorking.id
  const name = kovorking.name || 'Коворкинг'
  
  if (window.confirm(`Вы уверены, что хотите удалить коворкинг "${name}"?`)) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/kovorkings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: `Коворкинг "${name}" успешно удалён!`,
        life: 4000
      })
      fetchKovorkings(1, perpage.value, searchQuery.value)
      fetchKovorkingsTotal(searchQuery.value)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ошибка при удалении'
      toast.add({
        severity: 'error',
        summary: 'Ошибка удаления',
        detail: errorMessage,
        life: 5000
      })
      console.error(err)
    }
  }
}

// Сброс поиска при монтировании
onMounted(() => {
  fetchKovorkings(1, perpage.value)
  fetchKovorkingsTotal()
})
</script>

<style scoped>
.kovorkings-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #999;
  font-size: 14px;
}

.search-input {
  padding-left: 36px !important;
  padding-right: 36px !important;
  width: 250px;
}

.clear-search-btn {
  position: absolute;
  right: 4px;
  color: #999;
}

.clear-search-btn:hover {
  color: #333;
}

.search-info {
  background-color: #e3f2fd;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #1565c0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #f44336;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty i {
  display: block;
  margin-bottom: 16px;
}

.empty p {
  margin-bottom: 20px;
}

.preview-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
}

.no-img {
  display: inline-block;
  width: 50px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .kovorkings-list {
    padding: 12px;
  }
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
    flex-direction: column;
  }
  .search-container {
    width: 100%;
  }
  .search-input {
    width: 100%;
  }
  .preview-img {
    width: 40px;
    height: 40px;
  }
}
</style>