// scripts/add-js-extensions.js
import { promises as fs } from "fs";
import path from "path";
import { globby } from "globby";

async function run() {
  // 1. Find all .ts files under src/
  const files = await globby("src/**/*.ts");

  // 2. Regex to catch any ESM import that starts with ./ or ../ and lacks .js
  const importRe = /(from\s+['"]\.[^'"]+?)(?<!\.js)(['"])/g;

  for (const file of files) {
    const code = await fs.readFile(file, "utf8");
    const updated = code.replace(importRe, "$1.js$2");
    if (updated !== code) {
      await fs.writeFile(file, updated, "utf8");
      console.log(`✅ Updated imports in: ${file}`);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
