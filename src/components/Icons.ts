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

const Close = defineComponent({
    setup: () => () => h("i", {
        class: "fa-solid fa-xmark",
    })
})

const Pause = defineComponent({
    setup: () => () => h("i", {
        class: "fa-solid fa-pause",
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
            .component("IconClose", Close)
            .component("IconPause", Pause)
            .component("IconSettings", Settings)
    }
}

export default IconsPlugin
