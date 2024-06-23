import {
    createRouter,
    createWebHistory,
    RouteRecordRaw,
} from "vue-router"

import Home from "./components/Home.vue"
import Lesson from "./components/Lesson.vue"

const routes: Array<RouteRecordRaw> = [{
    path: "/",
    name: "home",
    component: Home,
}, {
    path: "/lesson/:id",
    name: "lesson",
    component: Lesson,
    props: true,
}]

const Router = createRouter({
    history: createWebHistory("/"),
    routes,
})

export default Router
