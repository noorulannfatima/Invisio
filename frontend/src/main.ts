import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import "./assets/styles/base.scss"; // optional global styles

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);   // ✅ Add Pinia for state management
app.use(router);  // ✅ Add router
app.mount("#app");