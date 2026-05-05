import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice' 
import './style.css';

const app = createApp(App);

app.use(ToastService);
app.use(createPinia());
app.use(router);
app.use(ConfirmationService);
app.use(PrimeVue, {
    theme: {
        preset: Aura,     
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    }
});

app.mount('#app');