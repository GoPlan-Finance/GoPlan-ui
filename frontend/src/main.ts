import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import DashboardLayout from "./layouts/DashboardLayout.vue";
import EmptyLayout from "./layouts/EmptyLayout.vue";


const app = createApp(App);

app.component('default-layout', DashboardLayout);
app.component('empty-layout', EmptyLayout);

app.use(router);
app.mount('#app');
