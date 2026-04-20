import { defineStore } from 'pinia';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL;

export const useDataStore = defineStore('data', {
    state: () => ({
        bookings: [],
        bookings_total: 0,
        loading: false,
        items: [],
        kovorkings: [],
        kovorkings_total: 0,
        errorMessage: "",
        errorCode: ""
    }),
    
    actions: {
        async get_bookings(page = 1, perpage = 5) {
            this.loading = true;
            this.errorMessage = "";
            
            try {
                const response = await axios.get(`${backendUrl}/bookings`, {
                    params: {
                        page: page,
                        perpage: perpage 
                    },
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('API Response:', response.data);
                
                if (response.data && response.data.data) {
                    this.bookings = response.data.data;
                    this.bookings_total = response.data.total || response.data.data.length;
                } else if (Array.isArray(response.data)) {
                    this.bookings = response.data;
                    this.bookings_total = response.data.length;
                } else {
                    this.bookings = [];
                    this.bookings_total = 0;
                }
                
            } catch (error) {
                if (error.response) {
                    this.errorMessage = error.response.data.message || error.response.statusText;
                    console.error('Response error:', error.response.status, error.response.data);
                } else if (error.request) {
                    this.errorMessage = 'No response from server';
                    console.error('Request error:', error.request);
                } else {
                    this.errorMessage = error.message;
                    console.error('Error:', error.message);
                }
                this.bookings = [];
                this.bookings_total = 0;
            } finally {
                this.loading = false;
            }
        },
        
        async get_bookings_total() {
            this.errorMessage = "";
            
            try {
                const response = await axios.get(`${backendUrl}/bookings_total`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                this.bookings_total = typeof response.data === 'number' 
                    ? response.data 
                    : (response.data.total || response.data.count || 0);
                    
                console.log('Total bookings:', this.bookings_total);
                
            } catch (error) {
                if (error.response) {
                    this.errorMessage = error.response.data.message || error.response.statusText;
                    console.error('Total error:', error.response.status);
                } else if (error.request) {
                    this.errorMessage = 'No response from server';
                    console.error('Request error:', error.request);
                } else {
                    this.errorMessage = error.message;
                    console.error('Error:', error.message);
                }
                this.bookings_total = 0;
            }
        },
        
        async get_kovorkings(page = 1, perpage = 10) {
            this.loading = true;
            this.errorMessage = "";
            
            try {
                const response = await axios.get(`${backendUrl}/kovorkings`, {
                    params: { 
                        page: page, 
                        perpage: perpage 
                    },
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Kovorkings API Response:', response.data);
                
                if (response.data && response.data.data) {
                    this.kovorkings = response.data.data;
                    this.kovorkings_total = response.data.total || response.data.data.length;
                } else if (Array.isArray(response.data)) {
                    this.kovorkings = response.data;
                    this.kovorkings_total = response.data.length;
                } else {
                    this.kovorkings = [];
                    this.kovorkings_total = 0;
                }
            } catch (error) {
                this.errorMessage = error.response?.data?.message || error.message;
                console.error('Kovorkings error:', error);
                this.kovorkings = [];
                this.kovorkings_total = 0;
            } finally {
                this.loading = false;
            }
        },

        async get_kovorkings_total() {
            try {
                const response = await axios.get(`${backendUrl}/kovorkings_total`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                this.kovorkings_total = typeof response.data === 'number' 
                    ? response.data 
                    : (response.data.total || response.data.count || 0);
                    
                console.log('Total kovorkings:', this.kovorkings_total);
                
            } catch (error) {
                console.error('Kovorkings total error:', error);
                this.kovorkings_total = 0;
            }
        },
        async create_kovorking(formData) {
            this.errorMessage = "";
            this.errorCode = null;
            
            try {
                const token = localStorage.getItem('token');
                
                const response = await axios.post(`${backendUrl}/kovorkings`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                this.errorCode = response.data.code;
                this.errorMessage = response.data.message;
                
                if (response.data.code === 0) {
                    await this.get_kovorkings();
                    await this.get_kovorkings_total();
                }
                
                return response.data;
                
            } catch (error) {
                if (error.response) {
                    this.errorCode = error.response.data.code || 11;
                    this.errorMessage = error.response.data.message || error.response.statusText;
                    console.error('Response error:', error.response.status, error.response.data);
                } else if (error.request) {
                    this.errorCode = 12;
                    this.errorMessage = 'No response from server';
                    console.error('Request error:', error.request);
                } else {
                    this.errorCode = 13;
                    this.errorMessage = error.message;
                    console.error('Error:', error.message);
                }
                
                return {
                    code: this.errorCode,
                    message: this.errorMessage
                };
            }
        }
    }
});