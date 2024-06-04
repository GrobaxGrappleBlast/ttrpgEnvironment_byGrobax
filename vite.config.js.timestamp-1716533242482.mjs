// vite.config.js
import path from "path";
import { defineConfig } from "file:///C:/Users/Dnd/Documents/CodeProjects/ObsidianDndImporter/DndImporter/.obsidian/plugins/ttrpgEnvironment_byGrobax/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///C:/Users/Dnd/Documents/CodeProjects/ObsidianDndImporter/DndImporter/.obsidian/plugins/ttrpgEnvironment_byGrobax/node_modules/@sveltejs/vite-plugin-svelte/dist/index.js";
import autoPreprocess from "file:///C:/Users/Dnd/Documents/CodeProjects/ObsidianDndImporter/DndImporter/.obsidian/plugins/ttrpgEnvironment_byGrobax/node_modules/svelte-preprocess/dist/index.js";
import builtins from "file:///C:/Users/Dnd/Documents/CodeProjects/ObsidianDndImporter/DndImporter/.obsidian/plugins/ttrpgEnvironment_byGrobax/node_modules/builtin-modules/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Dnd\\Documents\\CodeProjects\\ObsidianDndImporter\\DndImporter\\.obsidian\\plugins\\ttrpgEnvironment_byGrobax";
var prod = process.argv[2] === "production";
var vite_config_default = defineConfig(() => {
  return {
    exclude: [
      "**/*.test.ts"
    ],
    plugins: [
      svelte({
        compilerOptions: { css: true },
        preprocess: autoPreprocess()
      })
    ],
    watch: !prod,
    build: {
      sourcemap: prod ? false : "inline",
      minify: prod,
      commonjsOptions: {
        ignoreTryCatch: false
      },
      lib: {
        entry: path.resolve(__vite_injected_original_dirname, "./src/Modules/ObsidianUI/app.ts"),
        formats: ["cjs"]
      },
      rollupOptions: {
        output: {
          entryFileNames: "main.js",
          assetFileNames: "styles.css"
        },
        external: [
          "obsidian",
          "electron",
          "codemirror",
          "@codemirror/autocomplete",
          "@codemirror/closebrackets",
          "@codemirror/collab",
          "@codemirror/commands",
          "@codemirror/comment",
          "@codemirror/fold",
          "@codemirror/gutter",
          "@codemirror/highlight",
          "@codemirror/history",
          "@codemirror/language",
          "@codemirror/lint",
          "@codemirror/matchbrackets",
          "@codemirror/panel",
          "@codemirror/rangeset",
          "@codemirror/rectangular-selection",
          "@codemirror/search",
          "@codemirror/state",
          "@codemirror/stream-parser",
          "@codemirror/text",
          "@codemirror/tooltip",
          "@codemirror/view",
          "@lezer/common",
          "@lezer/lr",
          "@lezer/highlight",
          ...builtins
        ]
      },
      emptyOutDir: false,
      outDir: "."
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxEbmRcXFxcRG9jdW1lbnRzXFxcXENvZGVQcm9qZWN0c1xcXFxPYnNpZGlhbkRuZEltcG9ydGVyXFxcXERuZEltcG9ydGVyXFxcXC5vYnNpZGlhblxcXFxwbHVnaW5zXFxcXHR0cnBnRW52aXJvbm1lbnRfYnlHcm9iYXhcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXERuZFxcXFxEb2N1bWVudHNcXFxcQ29kZVByb2plY3RzXFxcXE9ic2lkaWFuRG5kSW1wb3J0ZXJcXFxcRG5kSW1wb3J0ZXJcXFxcLm9ic2lkaWFuXFxcXHBsdWdpbnNcXFxcdHRycGdFbnZpcm9ubWVudF9ieUdyb2JheFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvRG5kL0RvY3VtZW50cy9Db2RlUHJvamVjdHMvT2JzaWRpYW5EbmRJbXBvcnRlci9EbmRJbXBvcnRlci8ub2JzaWRpYW4vcGx1Z2lucy90dHJwZ0Vudmlyb25tZW50X2J5R3JvYmF4L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyBzdmVsdGUgfSBmcm9tICdAc3ZlbHRlanMvdml0ZS1wbHVnaW4tc3ZlbHRlJztcclxuaW1wb3J0IGF1dG9QcmVwcm9jZXNzIGZyb20gJ3N2ZWx0ZS1wcmVwcm9jZXNzJztcclxuaW1wb3J0IGJ1aWx0aW5zIGZyb20gJ2J1aWx0aW4tbW9kdWxlcyc7IFxyXG5cclxuXHJcbmNvbnN0IHByb2QgPSAocHJvY2Vzcy5hcmd2WzJdID09PSAncHJvZHVjdGlvbicpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZXhjbHVkZTpbXHJcbiAgICAgICAgICAgICcqKi8qLnRlc3QudHMnXHJcbiAgICAgICAgXSxcclxuICAgICAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgICAgIHN2ZWx0ZSh7XHJcbiAgICAgICAgICAgICAgICBjb21waWxlck9wdGlvbnM6IHsgY3NzOiB0cnVlIH0sXHJcbiAgICAgICAgICAgICAgICBwcmVwcm9jZXNzOiBhdXRvUHJlcHJvY2VzcygpXHJcbiAgICAgICAgICAgIH0pIFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgd2F0Y2g6ICFwcm9kLFxyXG4gICAgICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgICAgIHNvdXJjZW1hcDogcHJvZCA/IGZhbHNlIDogJ2lubGluZScsXHJcbiAgICAgICAgICAgIG1pbmlmeTogcHJvZCxcclxuICAgICAgICAgICAgLy8gVXNlIFZpdGUgbGliIG1vZGUgaHR0cHM6Ly92aXRlanMuZGV2L2d1aWRlL2J1aWxkLmh0bWwjbGlicmFyeS1tb2RlXHJcbiAgICAgICAgICAgIGNvbW1vbmpzT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgaWdub3JlVHJ5Q2F0Y2g6IGZhbHNlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBsaWI6IHtcclxuICAgICAgICAgICAgICAgIC8vICAnLi9tb2R1bGVzL21haW5BcHAvc3RhcnRlckluZGV4LnRzJ1xyXG4gICAgICAgICAgICAgICAgZW50cnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9Nb2R1bGVzL09ic2lkaWFuVUkvYXBwLnRzJyksXHJcbiAgICAgICAgICAgICAgICBmb3JtYXRzOiBbJ2NqcyddLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPdmVyd3JpdGUgZGVmYXVsdCBWaXRlIG91dHB1dCBmaWxlTmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnbWFpbi5qcycsXHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdzdHlsZXMuY3NzJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogWydvYnNpZGlhbicsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2VsZWN0cm9uJyxcclxuICAgICAgICAgICAgICAgICAgICBcImNvZGVtaXJyb3JcIixcclxuICAgICAgICAgICAgICAgICAgICBcIkBjb2RlbWlycm9yL2F1dG9jb21wbGV0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGNvZGVtaXJyb3IvY2xvc2VicmFja2V0c1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGNvZGVtaXJyb3IvY29sbGFiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJAY29kZW1pcnJvci9jb21tYW5kc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGNvZGVtaXJyb3IvY29tbWVudFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGNvZGVtaXJyb3IvZm9sZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGNvZGVtaXJyb3IvZ3V0dGVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJAY29kZW1pcnJvci9oaWdobGlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICBcIkBjb2RlbWlycm9yL2hpc3RvcnlcIixcclxuICAgICAgICAgICAgICAgICAgICBcIkBjb2RlbWlycm9yL2xhbmd1YWdlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJAY29kZW1pcnJvci9saW50XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJAY29kZW1pcnJvci9tYXRjaGJyYWNrZXRzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJAY29kZW1pcnJvci9wYW5lbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGNvZGVtaXJyb3IvcmFuZ2VzZXRcIixcclxuICAgICAgICAgICAgICAgICAgICBcIkBjb2RlbWlycm9yL3JlY3Rhbmd1bGFyLXNlbGVjdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGNvZGVtaXJyb3Ivc2VhcmNoXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJAY29kZW1pcnJvci9zdGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGNvZGVtaXJyb3Ivc3RyZWFtLXBhcnNlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGNvZGVtaXJyb3IvdGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGNvZGVtaXJyb3IvdG9vbHRpcFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGNvZGVtaXJyb3Ivdmlld1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGxlemVyL2NvbW1vblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQGxlemVyL2xyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJAbGV6ZXIvaGlnaGxpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLi4uYnVpbHRpbnMsXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyBVc2Ugcm9vdCBhcyB0aGUgb3V0cHV0IGRpclxyXG4gICAgICAgICAgICBlbXB0eU91dERpcjogZmFsc2UsXHJcbiAgICAgICAgICAgIG91dERpcjogJy4nLFxyXG4gICAgICAgIH0sXHJcbiAgICB9XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1oQixPQUFPLFVBQVU7QUFDcGlCLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsY0FBYztBQUN2QixPQUFPLG9CQUFvQjtBQUMzQixPQUFPLGNBQWM7QUFKckIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTSxPQUFRLFFBQVEsS0FBSyxPQUFPO0FBRWxDLElBQU8sc0JBQVEsYUFBYSxNQUFNO0FBQzlCLFNBQU87QUFBQSxJQUNILFNBQVE7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ0wsT0FBTztBQUFBLFFBQ0gsaUJBQWlCLEVBQUUsS0FBSyxLQUFLO0FBQUEsUUFDN0IsWUFBWSxlQUFlO0FBQUEsTUFDL0IsQ0FBQztBQUFBLElBQ0w7QUFBQSxJQUNBLE9BQU8sQ0FBQztBQUFBLElBQ1IsT0FBTztBQUFBLE1BQ0gsV0FBVyxPQUFPLFFBQVE7QUFBQSxNQUMxQixRQUFRO0FBQUEsTUFFUixpQkFBaUI7QUFBQSxRQUNiLGdCQUFnQjtBQUFBLE1BQ3BCO0FBQUEsTUFDQSxLQUFLO0FBQUEsUUFFRCxPQUFPLEtBQUssUUFBUSxrQ0FBVyxpQ0FBaUM7QUFBQSxRQUNoRSxTQUFTLENBQUMsS0FBSztBQUFBLE1BQ25CO0FBQUEsTUFDQSxlQUFlO0FBQUEsUUFDWCxRQUFRO0FBQUEsVUFFSixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxRQUNwQjtBQUFBLFFBQ0EsVUFBVTtBQUFBLFVBQUM7QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0EsR0FBRztBQUFBLFFBQ1A7QUFBQSxNQUNKO0FBQUEsTUFFQSxhQUFhO0FBQUEsTUFDYixRQUFRO0FBQUEsSUFDWjtBQUFBLEVBQ0o7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
