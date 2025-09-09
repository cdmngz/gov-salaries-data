const fs = require("fs");
const path = require("path");

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

module.exports = {
  isDirectory,
  isFile,
  ensureDir,
  readJSON,
  writeJSON,
  toNumber,
  amountToUSDInteger,
};
