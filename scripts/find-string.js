const fs = require("fs");
const path = require("path");

const root = process.argv[2] ?? ".";
const needle = process.argv[3];

if (!needle) {
  console.error("Usage: node scripts/find-string.js <dir> <needle>");
  process.exit(1);
}

const ignore = new Set(["node_modules", ".next", ".git"]);

const results = [];

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    try {
      const content = fs.readFileSync(full, "utf8");
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        if (line.includes(needle)) {
          results.push(`${full}:${idx + 1}:${line.trim()}`);
        }
      });
    } catch (error) {
      // ignore binary files
    }
  }
};

walk(root);

console.log(results.join("\n"));
