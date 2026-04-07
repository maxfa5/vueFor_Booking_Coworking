<template>
  <DataTable
    :value="dataStore.bookings"
    :lazy="true"
    :loading="dataStore.loading"
    :paginator="true"
    :rows="perpage"
    :rowsPerPageOptions="[2, 5, 10]"
    :totalRecords="dataStore.bookings_total"
    @page="onPageChange"
    responsive-layout="scroll"
    :first="offset"
    data-key="id"
  >
    <Column field="id" header="№" />
    <Column field="kovorking.name" header="Коворкинг" />
    <Column field="start_time" header="Дата начала">
      <template #body="{ data }">
        {{ formatDate(data.start_time) }}
      </template>
    </Column>
    <Column field="user.email" header="Пользователь (Email)">
      <template #body="{ data }">
        {{ data.user?.email || '—' }}
      </template>
    </Column>  </DataTable>
</template>

<script>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useDataStore } from "@/stores/dataStore";

export default {
  name: "BookingsList",
  components: { DataTable, Column },
  
  setup() {
    const dataStore = useDataStore();
    return { dataStore };
  },
  
  data() {
    return {
      perpage: 5,
      offset: 0,
    };
  },
  
  mounted() {
    console.log("Bookings component MOUNTED!");
    this.dataStore.get_bookings(1, this.perpage);
    this.dataStore.get_bookings_total();
  },
  
  methods: {
    onPageChange(event) {
      this.offset = event.first;
      this.perpage = event.rows;
      const page = event.first / event.rows + 1;
      this.dataStore.get_bookings(page, this.perpage);
    },
    
    formatDate(dateString) {
      if (!dateString) return '—';
      try {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return dateString;
      }
    }
  }
};
</script>

<style scoped>
</style>