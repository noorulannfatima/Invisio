import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "./assets/styles/base.scss"; // optional global styles

const app = createApp(App);

app.use(router);  // ✅ Add router
app.mount("#app");
