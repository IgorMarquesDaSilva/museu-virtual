import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/css/styles.css';
import './assets/css/navigation.css';

createApp(App).use(router).mount('#app');
