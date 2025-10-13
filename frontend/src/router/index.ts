import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Dashboard from "@/views/Dashboard.vue";
import Login from "@/views/Login.vue";
import SignUp from "@/views/Register.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: SignUp },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
