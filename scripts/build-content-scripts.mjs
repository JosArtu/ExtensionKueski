import { build } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const entries = [
  { input: "src/content/amazon.ts", output: "content.js" },
  { input: "src/content/costco.ts", output: "costco.js" },
];

for (const { input, output } of entries) {
  await build({
    configFile: false,
    build: {
      outDir: resolve(root, "dist"),
      emptyOutDir: false,
      lib: {
        entry: resolve(root, input),
        formats: ["iife"],
        name: "KueskiContent",
        fileName: () => output,
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  });
}
