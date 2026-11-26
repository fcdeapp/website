/* eslint-disable @typescript-eslint/no-require-imports */
// Rebuild vendor assets from the sibling app's locked dependencies; installs nothing.
const fs = require("node:fs"),
  path = require("node:path");
const website = path.resolve(__dirname, "../../../..");
const app = path.resolve(
  process.argv[2] || path.join(website, "../daewanggorae"),
);
const { buildSync } = require(path.join(app, "node_modules/esbuild"));
const target = path.join(website, "public/daewanggorae/runtime");
fs.mkdirSync(target, { recursive: true });
buildSync({
  entryPoints: [path.join(__dirname, "text-renderer.js")],
  nodePaths: [path.join(app, "node_modules")],
  bundle: true,
  minify: true,
  format: "iife",
  outfile: path.join(target, "text.js"),
  loader: { ".woff": "dataurl", ".woff2": "dataurl", ".ttf": "dataurl" },
});
const js = buildSync({
  entryPoints: [path.join(__dirname, "viewer.js")],
  nodePaths: [path.join(app, "node_modules")],
  bundle: true,
  minify: true,
  format: "iife",
  write: false,
}).outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
fs.writeFileSync(
  path.join(target, "viewer.html"),
  `<!doctype html><html lang="ko"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none';script-src 'unsafe-inline';style-src 'unsafe-inline';img-src data: blob:;connect-src 'none'"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}canvas{display:block;touch-action:none}</style></head><body><script>${js}</script></body></html>`,
);
fs.cpSync(path.join(app, "generated/models"), path.join(target, "models"), {
  recursive: true,
});
fs.copyFileSync(
  path.join(app, "generated/models.json"),
  path.join(target, "models.json"),
);
fs.copyFileSync(
  path.join(app, "assets/Daewanggorae.png"),
  path.join(target, "Daewanggorae.png"),
);
const licenses = [];
for (const name of [
  "three",
  "katex",
  "markdown-it",
  "entities",
  "linkify-it",
  "mdurl",
  "uc.micro",
  "punycode.js",
]) {
  const dir = path.join(app, "node_modules", name);
  if (!fs.existsSync(dir)) continue;
  const file = fs.readdirSync(dir).find((n) => /^license(?:\.|$)/i.test(n));
  if (file)
    licenses.push(`${name}\n${fs.readFileSync(path.join(dir, file), "utf8")}`);
}
fs.writeFileSync(
  path.join(target, "THIRD_PARTY_LICENSES.txt"),
  licenses.join("\n\n---\n\n"),
);
console.log("Prepared text, 3D viewer, model assets and license notices.");
