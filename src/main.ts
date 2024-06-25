import {
    createApp,
    h,
} from "vue"

import App from "./components/App.vue"
import AppInspector from "./components/AppInspector"
import Icons from "./components/Icons.ts"

import Router from "./router"

(function () {
    const app = createApp({
        render: () => h(App),
    })
    app
        .use(AppInspector)
        .use(Icons)
        .use(Router)
        .mount("#app")
})()

