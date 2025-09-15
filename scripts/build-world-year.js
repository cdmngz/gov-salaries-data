// scripts/build-world-year.js

const { buildWorldForYear } = require("./build-world");

const yearArg = process.argv[2];
if (!yearArg || !/^\d{4}$/.test(yearArg)) {
  console.error("Usage: node scripts/build-world-year.js <YYYY>");
  process.exit(1);
}
buildWorldForYear(Number(yearArg));
