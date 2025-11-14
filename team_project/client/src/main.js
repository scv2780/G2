import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import store from './store';
import router from './router';
import './assets/css/nucleo-icons.css';
import './assets/css/nucleo-svg.css';
import MaterialDashboard from './material-dashboard';
import { useAuthStore } from './store/authLogin';

const appInstance = createApp(App);
const pinia = createPinia();

appInstance.use(pinia);
appInstance.use(store);
appInstance.use(router);
appInstance.use(MaterialDashboard);
appInstance.mount('#app');

const piniaLogin = useAuthStore();
piniaLogin.reload();
