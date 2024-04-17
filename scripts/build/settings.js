import esbuildPluginTsc from "esbuild-plugin-tsc"
import vuePlugin from "esbuild-plugin-vue3"
import { glsl } from "esbuild-plugin-glsl"

export default function (options) {
    return {
        entryPoints: ["src/main.ts"],
        outfile: "dist/app.js",
        bundle: true,
        plugins: [
            esbuildPluginTsc({
                force: true,
                tsconfig: "tsconfig.json",
            }),
            glsl({
                minify: true,
            }),
            vuePlugin(),
        ],
        ...options,
    }
}
