/* scripts/build-world.js */
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const worldDir = path.join(dataDir, "world");
const globalIndex = {};

function isDirectory(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}
function isFile(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
}
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}
function readJSON(file) {
  if (!isFile(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return null;
  }
}
function writeJSON(file, obj) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), "utf-8");
}
function toNumber(n) {
  if (typeof n === "number") return Number.isFinite(n) ? n : 0;
  if (typeof n === "string") {
    const cleaned = n.replace(/[,_\s]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
}
function amountToUSDInteger(amount, currency, worldRates) {
  const amt = toNumber(amount);
  if (!worldRates || !worldRates.rates || !currency) return Math.round(amt);
  if (currency.toUpperCase() === "USD") return Math.round(amt);
  const rate = worldRates.rates[currency.toUpperCase()];
  if (!rate || !isFinite(rate) || rate === 0) return Math.round(amt);
  return Math.round(amt / rate);
}
function buildWorldEntry(countryCode, year, dataPath, ratesPath, worldRates) {
  const data = readJSON(dataPath) || {};
  const rates = readJSON(ratesPath) || {};
  const ministersArr = Array.isArray(data.ministers) ? data.ministers : [];
  const congressArr = Array.isArray(data.congress) ? data.congress : [];
  const senateArr = Array.isArray(data.senate) ? data.senate : [];
  const quantity = ministersArr.length;
  const localCurrency =
    typeof rates.baseCurrency === "string" ? rates.baseCurrency : "USD";
  const totalBudgetLocal = ministersArr.reduce((sum, m) => {
    const b =
      m && typeof m === "object"
        ? toNumber(m.budget ?? (m.salary && m.salary.budget))
        : 0;
    return sum + b;
  }, 0);
  const budgetUSD = amountToUSDInteger(
    totalBudgetLocal,
    localCurrency,
    worldRates
  );
  const gdpUSD = amountToUSDInteger(rates.GDP, localCurrency, worldRates);
  return {
    GDP: gdpUSD,
    ministers: { quantity, budget: budgetUSD },
    congress: { quantity: congressArr.length },
    senate: { quantity: senateArr.length },
  };
}
function generateIndexesAndWorld() {
  ensureDir(worldDir);
  const countries = fs
    .readdirSync(dataDir)
    .filter((country) => /^[a-z]{2}$/i.test(country))
    .filter((country) => isDirectory(path.join(dataDir, country)));
  const yearsSeen = new Set();
  countries.forEach((country) => {
    const countryPath = path.join(dataDir, country);
    const years = fs
      .readdirSync(countryPath)
      .filter((year) => /^\d{4}$/.test(year))
      .filter((year) => isDirectory(path.join(countryPath, year)));
    const yearsCollected = [];
    years.forEach((year) => {
      const yearPath = path.join(countryPath, year);
      const dataPath = path.join(yearPath, "data.json");
      const ratesPath = path.join(yearPath, "rates.json");
      if (!isFile(dataPath) || !isFile(ratesPath)) return;
      yearsCollected.push(Number(year));
      yearsSeen.add(year);
      const worldYearDir = path.join(worldDir, year);
      const worldYearFile = path.join(worldYearDir, "data.json");
      const worldRatesFile = path.join(worldYearDir, "rates.json");
      const worldData = readJSON(worldYearFile) || {};
      const worldRates = readJSON(worldRatesFile) || null;
      const entry = buildWorldEntry(
        country,
        Number(year),
        dataPath,
        ratesPath,
        worldRates
      );
      worldData[country] = entry;
      writeJSON(worldYearFile, worldData);
    });
    if (yearsCollected.length > 0) {
      const yearsOnly = Array.from(new Set(yearsCollected)).sort(
        (a, b) => a - b
      );
      globalIndex[country] = yearsOnly;
      writeJSON(path.join(countryPath, "index.json"), yearsOnly);
    }
  });
  writeJSON(path.join(dataDir, "index.json"), globalIndex);
  const yearsArr = Array.from(yearsSeen)
    .map((y) => Number(y))
    .sort((a, b) => a - b);
  writeJSON(path.join(worldDir, "index.json"), yearsArr);
  console.log(
    "updated indexes and world files for years:",
    yearsArr.join(", ")
  );
}
if (require.main === module) {
  generateIndexesAndWorld();
}
