// scripts/build-world.js

const path = require("path");
const fs = require("fs");
const {
  isDirectory,
  isFile,
  ensureDir,
  readJSON,
  writeJSON,
  toNumber,
  amountToUSDInteger,
} = require("./lib/io");

const dataDir = path.join(__dirname, "..", "data");
const worldDir = path.join(dataDir, "world");

function pctGrowth(curr, prev) {
  const c = toNumber(curr),
    p = toNumber(prev);
  if (p === 0) return null; // no baseline
  return Number((((c - p) / p) * 100).toFixed(2));
}

function safePct(numerator, denominator) {
  const n = toNumber(numerator),
    d = toNumber(denominator);
  if (d === 0) return null;
  return Number(((n / d) * 100).toFixed(2));
}

function buildWorldEntry(dataPath, ratesPath, worldRates, prevCountryEntry) {
  const data = readJSON(dataPath) || {};
  const rates = readJSON(ratesPath) || {};

  const ministersArr = Array.isArray(data.ministers) ? data.ministers : [];
  const deputiesArr = Array.isArray(data.deputies) ? data.deputies : [];
  const senateArr = Array.isArray(data.senate) ? data.senate : [];

  const localCurrency =
    typeof rates.baseCurrency === "string" ? rates.baseCurrency : "USD";

  const totalBudgetLocal = ministersArr.reduce((sum, m) => {
    const b =
      m && typeof m === "object"
        ? toNumber(m.budget ?? (m.salary && m.salary.budget))
        : 0;
    return sum + b;
  }, 0);

  const GDP = amountToUSDInteger(rates.GDP, localCurrency, worldRates);
  const GDPPerCapita = amountToUSDInteger(
    rates.GDPPerCapita,
    localCurrency,
    worldRates
  );
  const ministersBudget = amountToUSDInteger(
    totalBudgetLocal,
    localCurrency,
    worldRates
  );

  const minSalaryLocal =
    rates.minAnualSalary !== undefined
      ? rates.minAnualSalary
      : rates.minAnnualSalary;
  const MinAnnualSalary = amountToUSDInteger(
    minSalaryLocal,
    localCurrency,
    worldRates
  );

  const GDPGrowthYoY = prevCountryEntry
    ? pctGrowth(GDP, prevCountryEntry.GDP)
    : null;
  const GDPPerCapitaGrowthYoY = prevCountryEntry
    ? pctGrowth(GDPPerCapita, prevCountryEntry.GDPPerCapita)
    : null;
  const MinAnnualSalaryGrowthYoY = prevCountryEntry
    ? pctGrowth(MinAnnualSalary, prevCountryEntry.MinAnnualSalary)
    : null;

  const MinistersBudgetPctOfGDP = safePct(ministersBudget, GDP);

  return {
    GDP,
    GDPPerCapita,
    GDPGrowthYoY,
    GDPPerCapitaGrowthYoY,
    MinAnnualSalary,
    MinAnnualSalaryGrowthYoY,
    MinistersBudgetPctOfGDP,
    ministers: { quantity: ministersArr.length, budget: ministersBudget },
    deputies: { quantity: deputiesArr.length },
    senate: { quantity: senateArr.length },
  };
}

function buildWorldForYear(year) {
  ensureDir(worldDir);
  const worldYearDir = path.join(worldDir, String(year));
  const worldYearFile = path.join(worldYearDir, "data.json");
  const worldRatesFile = path.join(worldYearDir, "rates.json");
  const worldRates = readJSON(worldRatesFile) || null;
  const prevWorld =
    readJSON(path.join(worldDir, String(year - 1), "data.json")) || {};
  const next = {};

  // iterate countries/years
  const countries = fs
    .readdirSync(dataDir)
    .filter((cc) => /^[a-z]{2}$/i.test(cc))
    .filter((cc) => isDirectory(path.join(dataDir, cc)));

  countries.forEach((country) => {
    const dataPath = path.join(dataDir, country, String(year), "data.json");
    const ratesPath = path.join(dataDir, country, String(year), "rates.json");
    if (!isFile(dataPath) || !isFile(ratesPath)) return;

    const prevEntry =
      prevWorld && typeof prevWorld === "object" ? prevWorld[country] : null;
    next[country] = buildWorldEntry(dataPath, ratesPath, worldRates, prevEntry);
  });

  // Write the year file and update world/index.json
  writeJSON(worldYearFile, next);

  // Update index (sorted)
  const worldIndexPath = path.join(worldDir, "index.json");
  const existingYears = readJSON(worldIndexPath) || [];
  const yearsSet = new Set(existingYears.concat([Number(year)]));
  const sorted = Array.from(yearsSet)
    .map(Number)
    .sort((a, b) => a - b);
  writeJSON(worldIndexPath, sorted);

  console.log(
    `built world for ${year} with ${Object.keys(next).length} countries`
  );
}

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

// export a CLI param to build a single year in matrix jobs
module.exports = { buildWorldForYear };
