import { defineStore } from 'pinia';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    errorMessage: "",
  }),
  
  actions: {
    setAuthHeader() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    },

    async login(credentials) {
      this.errorMessage = "";
      
      try {
        const response = await axios.post(
        backendUrl +"/login",
          credentials
        );
        
        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        localStorage.setItem('token', response.data.token);
        
      } catch (error) {
        if (error.response) {
          this.errorMessage = error.response.data.message;
          console.log(error);
        } else if (error.request) {
          this.errorMessage = error.message;
          console.log(error);
        } else {
          console.log(error);
        }
      }
    },

    async getUser() {
      this.errorMessage = "";
      try {
        const response = await axios.get(backendUrl + '/user', {
          headers: {
            Authorization: 'Bearer ' + this.token
          }
        });
        this.user = response.data;
      } catch (error) {
        if (error.response) {
          this.errorMessage = error.response.data.message;
          console.log(error);
        } else if (error.request) {
          this.errorMessage = error.message;
          console.log(error);
        } else {
          console.log(error);
        }
      }
    },
    
    async logout() {
      try {
        this.setAuthHeader();

        const response = await axios.post(backendUrl + '/logout', {
          headers: {
            Authorization: 'Bearer ' + this.token
          }
        });
        this.errorCode = response.data.code;   
        this.errorMessage = response.data.message;
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
      } catch (error) {
        if (error.response) {
          this.errorCode = 1;
          this.errorMessage = error.response.data.message;
          console.log(error);
        } else if (error.request) {
          this.errorCode = 2;
          this.errorMessage = error.message;
          console.log(error);
        } else {
          this.errorCode = 3;
          console.log(error);
        }
      }
    }
  }
});