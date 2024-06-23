import {
    createApp,
    h,
} from "vue"

import App from "./components/App.vue"
import Icons from "./components/Icons.ts"

import Router from "./router"

(function () {
    const app = createApp({
        render: () => h(App),
    })
    app
        .use(Icons)
        .use(Router)
        .mount("#app")
})()

