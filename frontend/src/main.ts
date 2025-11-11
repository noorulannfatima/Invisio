import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@fortawesome/fontawesome-free/css/all.css'


import "./assets/styles/base.scss"; //  global styles

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);   // Pinia for state management
app.use(router);  
app.mount("#app");