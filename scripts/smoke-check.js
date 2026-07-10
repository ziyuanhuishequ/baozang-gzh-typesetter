const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

const required = [
  "package.json",
  "src/main.js",
  "src/preload.js",
  "src/renderer/index.html",
  "src/renderer/app.js",
  "src/renderer/styles.css",
  "resources/skill/SKILL.md",
  "resources/skill/references/theme-index.md",
  "resources/skill/references/common-components.md"
];

for (const file of required) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) throw new Error(`Missing ${file}`);
}

for (const file of ["src/main.js", "src/preload.js", "src/renderer/app.js"]) {
  new Function(fs.readFileSync(path.join(root, file), "utf8"));
}

const refs = fs.readdirSync(path.join(root, "resources/skill/references"));
const themeCount = refs.filter((file) => /^theme-.+\.md$/.test(file) && !["theme-index.md", "theme-generator.md"].includes(file)).length;
if (themeCount < 6) throw new Error(`Expected at least 6 theme templates, got ${themeCount}`);

console.log(JSON.stringify({ ok: true, themeCount, references: refs.length }, null, 2));
