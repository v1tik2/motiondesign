// Bundles the web preview (preview/dist) and writes its asset manifest.
// The artifact host only serves whitelisted extensions, so .glb/.hdr are
// published with an extra .wasm suffix.
import { build } from "esbuild";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

// The light reel uses 2D skin renders only; 3D models/textures and the v1 fonts/music stay out.
const SKIP = [/^textures\//, /^models\//, /^environment\.hdr$/, /^fonts\/(unbounded|inter)-/, /^sfx\/music\.wav$/, /OFL/];
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk("public")
  .map((f) => relative("public", f))
  .filter((f) => !SKIP.some((r) => r.test(f)))
  .sort();
const manifest = Object.fromEntries(files.map((f) => [f, /\.(glb|hdr)$/.test(f) ? `${f}.wasm` : f]));
writeFileSync("preview/manifest.json", JSON.stringify(manifest, null, 1));

await build({
  entryPoints: ["preview/main.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  outfile: "preview/dist/app.js",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});
console.log(`preview built, ${files.length} assets`);
