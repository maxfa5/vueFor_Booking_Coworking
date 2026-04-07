<template>
  <div class="kovorkings-list">
    <h2>Коворкинги</h2>
    
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <DataTable
      v-if="!loading && kovorkings.length"
      :value="kovorkings"
      :lazy="true"
      :loading="loading"
      :paginator="true"
      :rows="perpage"
      :rowsPerPageOptions="[2, 5, 10]"
      :totalRecords="kovorkings_total"
      @page="onPageChange"
      responsive-layout="scroll"
      :first="offset"
      data-key="id"
      class="kovorkings-table"
    >
      <Column field="id" header="ID" style="width: 80px" />
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
     
      <Column header="Действия" style="width: 100px">
        <template #body="{ data }">
        </template>
      </Column>
    </DataTable>
    
    <div v-else-if="!loading && !kovorkings.length" class="empty">
      Нет доступных коворкингов
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_API_URL
axios.defaults.baseURL = backendUrl

const router = useRouter()
const kovorkings = ref([])
const kovorkings_total = ref(0)
const loading = ref(false)
const error = ref(null)
const perpage = ref(10)
const offset = ref(0)

const fetchKovorkings = async (page = 1, perPage = 10) => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get('/kovorkings', {
      params: {
        page: page,
        perpage: perPage
      }
    })
    
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

const fetchKovorkingsTotal = async () => {
  try {
    const response = await axios.get('/kovorkings_total')
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
  fetchKovorkings(page, event.rows)
}

const selectKovorking = (kovorking) => {
  router.push(`/kovorkings/${kovorking.id}`)
}

onMounted(() => {
  fetchKovorkings(1, perpage.value)
  fetchKovorkingsTotal()
})
</script>

<style scoped>
</style>