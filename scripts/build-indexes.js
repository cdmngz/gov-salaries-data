// scripts/build-indexes.js

const path = require("path");
const fs = require("fs");
const { isDirectory, isFile, writeJSON } = require("./lib/io");

const dataDir = path.join(__dirname, "..", "data");
const globalIndex = {};

function buildIndexes() {
  const countries = fs
    .readdirSync(dataDir)
    .filter((cc) => /^[a-z]{2}$/i.test(cc))
    .filter((cc) => isDirectory(path.join(dataDir, cc)));

  countries.forEach((country) => {
    const countryPath = path.join(dataDir, country);
    const years = fs
      .readdirSync(countryPath)
      .filter((y) => /^\d{4}$/.test(y))
      .filter((y) => isDirectory(path.join(countryPath, y)))
      .filter(
        (y) =>
          // keep only years that actually have both files
          isFile(path.join(countryPath, y, "data.json")) &&
          isFile(path.join(countryPath, y, "economics.json"))
      )
      .map(Number)
      .sort((a, b) => a - b);

    if (years.length > 0) {
      globalIndex[country] = years;
      writeJSON(path.join(countryPath, "index.json"), years);
    }
  });

  writeJSON(path.join(dataDir, "index.json"), globalIndex);
  console.log("updated country indexes and global data/index.json");
}

if (require.main === module) {
  buildIndexes();
}
