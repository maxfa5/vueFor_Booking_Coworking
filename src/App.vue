<template>
  <div class="app-container">
    <Menubar :model="items" class="app-menubar">
      <template #start>
        <div class="logo-container">
          <router-link to="/" class="logo">
            <i class="pi pi-building"></i>
            <span>Coworking Booking</span>
          </router-link>
        </div>
      </template>

      <template #item="{ item, props }">
        <router-link 
          v-if="item.route" 
          :to="item.route" 
          class="p-menubar-item-link"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </router-link>
        <a 
          v-else 
          :href="item.url" 
          class="p-menubar-item-link"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </a>
      </template>

      <template #end>
        <div class="auth-section">
          <div v-if="isAuthenticated && user" class="user-info">
            <i class="pi pi-user"></i>
            <span class="user-name">{{ user.name }}</span>
            <Button 
              @click="logout" 
              label="Выйти" 
              icon="pi pi-sign-out" 
            />
          </div>
          <div v-else class="login-form">
            <form @submit.prevent="login" class="auth-form">
              <InputText 
                v-model="email" 
                type="email" 
                placeholder="email"
                required 
              />
              <InputText 
                v-model="password" 
                type="password" 
                placeholder="Пароль"
                required 
              />
              <Button 
                type="submit" 
                label="Войти" 
                icon="pi pi-sign-in"
              />
              <div> <small v-if="authError" class="error">{{ authError }}</small></div>
            </form>
          </div>
        </div>
      </template>
    </Menubar>
    
    <main class="main-content">
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

<style scoped>
* {
  box-sizing: border-box;
}

.app-container {
  font-family: Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.logo a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 1rem;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  text-decoration: none;
  color: white;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
}

.nav-link:hover {
  background-color: rgba(255,255,255,0.2);
}

.router-link-active {
  background-color: rgba(255,255,255,0.3);
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn {
  background: none;
  border: 1px solid white;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: rgba(255,255,255,0.2);
}

.login-form {
  background-color: rgba(255,255,255,0.1);
  padding: 0.5rem;
  border-radius: 4px;
}

.auth-form {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.auth-form input {
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.auth-form button {
  background-color: #3498db;
  border: none;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}

.auth-form button:hover {
  background-color: #2980b9;
}

.error {
  color: #e74c3c;
  margin: 0;
  font-size: 0.9rem;
}

.main-content {
  flex: 1;
  padding: 1rem;
  background-color: #ecf0f1;
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }
  .nav-menu {
    flex-direction: column;
    gap: 0.5rem;
  }
  .auth-form {
    justify-content: center;
  }
}
</style>