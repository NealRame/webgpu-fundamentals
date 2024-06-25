import {
    type App,
} from "vue"

import AppInspector from "./AppInspector.vue"

export * from "./keys"

export const AppInspectorPlugin = {
    install: (application: App) => {
        application.component("AppInspector", AppInspector)
    }
}

export default AppInspectorPlugin
