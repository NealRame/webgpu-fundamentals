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

const IconsPlugin = {
    install: (application: App) => {
        application
            .component("IconAngleRight", AngleRight)
    }
}

export default IconsPlugin
