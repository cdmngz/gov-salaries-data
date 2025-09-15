// scripts/lib/world.js

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
} = require("../lib/io");
const { countPartyRanges } = require("./stats");

const dataDir = path.join(__dirname, "..", "..", "data");
const worldDir = path.join(dataDir, "world");

function pctGrowth(curr, prev) {
  const c = toNumber(curr),
    p = toNumber(prev);
  if (p === 0) return null;
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

  // NEW: party range popularity (handles optional party safely)
  const partyRangeStats = countPartyRanges(data);

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

  const minAnnualSalary = amountToUSDInteger(
    rates.minAnnualSalary,
    localCurrency,
    worldRates
  );

  const GDPGrowthYoY = prevCountryEntry
    ? pctGrowth(GDP, prevCountryEntry.GDP)
    : null;
  const GDPPerCapitaGrowthYoY = prevCountryEntry
    ? pctGrowth(GDPPerCapita, prevCountryEntry.GDPPerCapita)
    : null;
  const minAnnualSalaryGrowthYoY = prevCountryEntry
    ? pctGrowth(minAnnualSalary, prevCountryEntry.minAnnualSalary)
    : null;

  const ministersBudgetPctOfGDP = safePct(ministersBudget, GDP);

  return {
    GDP,
    GDPPerCapita,
    GDPGrowthYoY,
    GDPPerCapitaGrowthYoY,
    minAnnualSalary,
    minAnnualSalaryGrowthYoY,
    ministersBudgetPctOfGDP,
    ministers: { quantity: ministersArr.length, budget: ministersBudget },
    deputies: { quantity: deputiesArr.length },
    senate: { quantity: senateArr.length },

    // NEW
    partyRangeStats,
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

module.exports = {
  buildWorldEntry,
  buildWorldForYear,
};
