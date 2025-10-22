// scripts/build-world.js

const path = require("path");
const fs = require("fs");
const { isDirectory } = require("./lib/io");
const { buildWorldForYear } = require("./lib/world");

const dataDir = process.env.GOV_SALARIES_DATA_DIR
  ? path.resolve(process.env.GOV_SALARIES_DATA_DIR)
  : path.join(__dirname, "..", "data");

if (require.main === module) {
  // Back-compat default: build all years
  const years = [];
  const countries = fs
    .readdirSync(dataDir)
    .filter((cc) => /^[a-z]{2}$/i.test(cc))
    .filter((cc) => isDirectory(path.join(dataDir, cc)));

  countries.forEach((country) => {
    const countryPath = path.join(dataDir, country);
    const ys = fs
      .readdirSync(countryPath)
      .filter(
        (y) => /^\d{4}$/.test(y) && isDirectory(path.join(countryPath, y))
      )
      .map(Number);
    ys.forEach((y) => years.push(y));
  });

  Array.from(new Set(years))
    .sort((a, b) => a - b)
    .forEach(buildWorldForYear);
}

// export for matrix jobs and build-world-year.js
module.exports = { buildWorldForYear };
