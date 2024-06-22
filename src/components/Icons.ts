import {
    type App,
    defineComponent,
    h,
} from "vue"

const AngleRight = defineComponent({
    setup: () => () => h("i", {
        class: "fa-solid fa-angle-right",
    })
})

const Settings = defineComponent({
    setup: () => () => h("i", {
        class: "fa-solid fa-gear",
    })
})

const IconsPlugin = {
    install: (application: App) => {
        application
            .component("IconAngleRight", AngleRight)
            .component("IconSettings", Settings)
    }
}

export default IconsPlugin
