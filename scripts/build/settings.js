import tailwindcss from "tailwindcss"
import autoprefixer from "autoprefixer"

import esbuildPluginTsc from "esbuild-plugin-tsc"
import postCssPlugin from "esbuild-style-plugin"
import vuePlugin from "esbuild-plugin-vue3"
import { copy } from "esbuild-plugin-copy"
import { glsl } from "esbuild-plugin-glsl"

export default function (options) {
    return {
        entryPoints: [
            "src/main.ts",
            "src/style.css"
        ],
        outdir: "dist",
        bundle: true,
        plugins: [
            esbuildPluginTsc({
                force: true,
                tsconfig: "tsconfig.json",
            }),
            postCssPlugin({
                postcss: {
                    plugins: [tailwindcss, autoprefixer]
                }
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
