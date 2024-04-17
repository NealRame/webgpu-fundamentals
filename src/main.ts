// 
import {
    createApp,
    h,
} from "vue"

import App from "./components/App.vue"
import Icons from "./components/Icons.ts"

import "./assets/css/style.css"

(function () {
    const app = createApp({
        render: () => h(App),
    })
    app
        .use(Icons)
        .mount("#app")
})()
