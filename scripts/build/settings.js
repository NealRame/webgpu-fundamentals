import esbuildPluginTsc from "esbuild-plugin-tsc"
import vuePlugin from "esbuild-plugin-vue3"
import { copy } from 'esbuild-plugin-copy'
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
            copy({
                resolveFrom: "cwd",
                assets: {
                    from: ["public/*"],
                    to: ["dist/assets"],
                }
            }),
            vuePlugin(),
        ],
        ...options,
    }
}
