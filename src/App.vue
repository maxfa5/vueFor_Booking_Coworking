<template>
  <div class="min-h-screen flex flex-col font-sans bg-gray-900">
    <Menubar :model="items" class="!bg-gray-800 !border-none rounded-none px-4 py-2">
      <!-- Левая часть: логотип -->
      <template #start>
        <div class="flex items-center">
          <router-link to="/" class="flex items-center gap-2 text-white font-bold text-lg no-underline hover:opacity-90">
            <i class="pi pi-building text-xl"></i>
            <span>Coworking Booking</span>
          </router-link>        </div>
      </template>

      <template #item="{ item }">
        <router-link 
          v-if="item.route" 
          :to="item.route" 
          class="flex items-center gap-2 text-white px-3 py-2 rounded-md no-underline hover:bg-white/20"
          active-class="bg-white/30 font-bold"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </template>

      <template #end>
        <div class="flex items-center">
          <div v-if="isAuthenticated && user" class="flex items-center gap-3">
            <i class="pi pi-user text-white"></i>
            <span class="text-white font-medium">{{ user.name }}</span>
            <Button 
              @click="logout" 
              label="Выйти" 
              icon="pi pi-sign-out" 
              variant="text"
              class="!text-white hover:!bg-white/20"
            />
          </div>
          
          <div v-else class="bg-white/10 rounded-md p-2">
            <form @submit.prevent="login" class="flex flex-row gap-2">
              <InputText 
                v-model="email" 
                type="email" 
                placeholder="email"
                class="!px-2 !py-1 !rounded !border !border-gray-600 !bg-gray-700 !text-white"
                required 
              />
              <InputText 
                v-model="password" 
                type="password" 
                placeholder="Пароль"
                class="!px-2 !py-1 !rounded !border !border-gray-600 !bg-gray-700 !text-white"
                required 
              />
              <Button 
                type="submit" 
                label="Войти" 
                icon="pi pi-sign-in"
                class="!bg-blue-500 !border-none !text-white !px-3 !py-1 hover:!bg-blue-600"
              />
              <div v-if="authError">
                <small class="!text-red-400">{{ authError }}</small>
              </div>
            </form>
          </div>
        </div>
      </template>
    </Menubar>
    
    <main class="flex-1 p-4 bg-gray-900">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';
import Button from 'primevue/button';
import Menubar from 'primevue/menubar';
import InputText from 'primevue/inputtext';

export default {
  name: 'App',
  
  components: { 
    Button, 
    Menubar, 
    InputText 
  },
  
  data() {
    return {
      email: '',
      password: '',
      authStore: useAuthStore(),
      items: [
        {
          label: 'Бронирования',
          icon: 'pi pi-calendar',
          route: '/bookings'
        },
        {
          label: 'Коворкинги',
          icon: 'pi pi-building',
          route: '/kovorkings'
        },
        {
          label: 'Пользователи',
          icon: 'pi pi-users',
          route: '/users'
        },
        {
          label: 'Адреса',
          icon: 'pi pi-map-marker',
          route: '/buildings'
        }
      ]
    };
  },
  
  computed: {
    isAuthenticated() {
      return this.authStore.isAuthenticated;
    },
    user() {
      return this.authStore.user;
    },
    authError() {
      return this.authStore.errorMessage;
    },
  },
  
  methods: {
    logout() {
      this.authStore.logout();
    },
    login() {
      this.authStore.login({ email: this.email, password: this.password });
    },
  },
  
  mounted() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authStore.isAuthenticated = true;
      this.authStore.getUser();
    }
  },
};
</script>