// clean-import-extensions.ts
import fs from "fs";
import path from "path";

const directory = "./src";

function walk(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, callback);
    } else if (fullPath.endsWith(".ts")) {
      callback(fullPath);
    }
  });
}

function cleanJsExtensions(filePath: string) {
  const original = fs.readFileSync(filePath, "utf8");
  const cleaned = original.replace(/from\s+['"](.+?)\.js(['"])/g, 'from "$1$2');

  if (original !== cleaned) {
    fs.writeFileSync(filePath, cleaned, "utf8");
    console.log(`✅ Cleaned imports in: ${filePath}`);
  }
}

walk(directory, cleanJsExtensions);
