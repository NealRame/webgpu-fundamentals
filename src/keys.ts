import {
    type InjectionKey,
    type Ref,
} from "vue"

import {
    type IRenderApp,
} from "./lessons"

export const KCurrentRenderApp: InjectionKey<Ref<IRenderApp | null>> = Symbol("currentRenderApp")
