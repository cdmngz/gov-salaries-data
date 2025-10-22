const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

function writeJSON(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function loadWorldModule(dataDir) {
  const worldPath = require.resolve('../world');
  delete require.cache[worldPath];
  process.env.GOV_SALARIES_DATA_DIR = dataDir;
  return require('../world');
}

test('buildWorldForYear builds aggregates when a new dataset appears', async (t) => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'world-builder-'));
  const prevEnv = process.env.GOV_SALARIES_DATA_DIR;
  t.after(() => {
    if (prevEnv === undefined) {
      delete process.env.GOV_SALARIES_DATA_DIR;
    } else {
      process.env.GOV_SALARIES_DATA_DIR = prevEnv;
    }
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    delete require.cache[require.resolve('../world')];
  });

  const dataRoot = path.join(tmpRoot, 'data');
  const us2024 = path.join(dataRoot, 'us', '2024');
  writeJSON(path.join(us2024, 'data.json'), {
    parties: {
      A: { range: 2 },
      B: { range: 4 },
    },
    ministers: [
      { name: 'Alice', party: 'A', salary: { budget: 100000 } },
      { name: 'Bob', party: 'B', salary: { budget: 200000 } },
    ],
    deputies: [
      { name: 'Carol', party: 'A' },
      { name: 'Unaffiliated' },
    ],
  });
  writeJSON(path.join(us2024, 'economics.json'), {
    baseCurrency: 'USD',
    GDP: 1_000_000,
    GDPPerCapita: 20_000,
    minAnnualSalary: 10_000,
  });

  writeJSON(path.join(dataRoot, 'world', '2024', 'rates.json'), {
    baseCurrency: 'USD',
    timestamp: 1_700_000_000,
    rates: { USD: 1, EUR: 0.9 },
  });

  const { buildWorldForYear } = loadWorldModule(dataRoot);
  buildWorldForYear(2024);

  const worldFile = path.join(dataRoot, 'world', '2024', 'data.json');
  assert.ok(fs.existsSync(worldFile), 'world aggregate was created');
  const worldData = JSON.parse(fs.readFileSync(worldFile, 'utf-8'));

  assert.deepStrictEqual(Object.keys(worldData), ['us']);
  const usEntry = worldData.us;

  assert.strictEqual(usEntry.GDP, 1_000_000);
  assert.strictEqual(usEntry.GDPPerCapita, 20_000);
  assert.strictEqual(usEntry.minAnnualSalary, 10_000);
  assert.strictEqual(usEntry.ministers.budget, 300_000);
  assert.strictEqual(usEntry.ministers.quantity, 2);
  assert.strictEqual(usEntry.deputies.quantity, 2);
  assert.strictEqual(usEntry.senate.quantity, 0);
  assert.strictEqual(usEntry.ministersBudgetPctOfGDP, 30);
  assert.strictEqual(usEntry.GDPGrowthYoY, null);
  assert.strictEqual(usEntry.GDPPerCapitaGrowthYoY, null);
  assert.strictEqual(usEntry.minAnnualSalaryGrowthYoY, null);

  assert.deepStrictEqual(usEntry.partyRangeStats.counts, {
    1: 0,
    2: 2,
    3: 0,
    4: 1,
    5: 0,
  });
  assert.deepStrictEqual(usEntry.partyRangeStats.mostPopularRanges, [2]);
  assert.strictEqual(usEntry.partyRangeStats.mostPopularCount, 2);
  assert.strictEqual(usEntry.partyRangeStats.totalCountedOfficials, 3);
  assert.strictEqual(usEntry.partyRangeStats.unaffiliatedCount, 1);
  assert.strictEqual(usEntry.partyRangeStats.unmappedPartyCount, 0);

  assert.deepStrictEqual(usEntry.partyRangeStatsSplit.executive.counts, {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  assert.deepStrictEqual(usEntry.partyRangeStatsSplit.rest.counts, {
    1: 0,
    2: 2,
    3: 0,
    4: 1,
    5: 0,
  });

  const indexPath = path.join(dataRoot, 'world', 'index.json');
  const years = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  assert.deepStrictEqual(years, [2024]);
});

test('buildWorldForYear refreshes aggregates after dataset updates', async (t) => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'world-builder-update-'));
  const prevEnv = process.env.GOV_SALARIES_DATA_DIR;
  t.after(() => {
    if (prevEnv === undefined) {
      delete process.env.GOV_SALARIES_DATA_DIR;
    } else {
      process.env.GOV_SALARIES_DATA_DIR = prevEnv;
    }
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    delete require.cache[require.resolve('../world')];
  });

  const dataRoot = path.join(tmpRoot, 'data');
  const us2024 = path.join(dataRoot, 'us', '2024');

  writeJSON(path.join(dataRoot, 'world', '2023', 'data.json'), {
    us: {
      GDP: 800_000,
      GDPPerCapita: 18_000,
      minAnnualSalary: 9_000,
    },
  });

  writeJSON(path.join(us2024, 'data.json'), {
    parties: {
      A: { range: 2 },
      B: { range: 4 },
    },
    ministers: [
      { name: 'Alice', party: 'A', salary: { budget: 100000 } },
      { name: 'Bob', party: 'B', salary: { budget: 200000 } },
    ],
    deputies: [
      { name: 'Carol', party: 'A' },
      { name: 'Unaffiliated' },
    ],
  });
  writeJSON(path.join(us2024, 'economics.json'), {
    baseCurrency: 'USD',
    GDP: 1_000_000,
    GDPPerCapita: 20_000,
    minAnnualSalary: 10_000,
  });

  writeJSON(path.join(dataRoot, 'world', '2024', 'rates.json'), {
    baseCurrency: 'USD',
    rates: { USD: 1, EUR: 0.9 },
  });

  let worldModule = loadWorldModule(dataRoot);
  worldModule.buildWorldForYear(2024);

  const worldFile = path.join(dataRoot, 'world', '2024', 'data.json');
  const initialEntry = JSON.parse(fs.readFileSync(worldFile, 'utf-8')).us;

  // Update the source dataset
  writeJSON(path.join(us2024, 'data.json'), {
    parties: {
      A: { range: 2 },
      B: { range: 4 },
      C: { range: 1 },
    },
    ministers: [
      { name: 'Alice', party: 'A', salary: { budget: 150000 } },
      { name: 'Bob', party: 'B', salary: { budget: 150000 } },
      { name: 'Eve', party: 'C', salary: { budget: 100000 } },
    ],
    deputies: [
      { name: 'Carol', party: 'A' },
      { name: 'Dan', party: 'C' },
    ],
    senate: [
      { name: 'Zoe', party: 'B' },
    ],
  });
  writeJSON(path.join(us2024, 'economics.json'), {
    baseCurrency: 'USD',
    GDP: 2_000_000,
    GDPPerCapita: 25_000,
    minAnnualSalary: 12_000,
  });

  worldModule = loadWorldModule(dataRoot);
  worldModule.buildWorldForYear(2024);

  const updatedEntry = JSON.parse(fs.readFileSync(worldFile, 'utf-8')).us;

  assert.notStrictEqual(
    updatedEntry.ministers.budget,
    initialEntry.ministers.budget
  );
  assert.strictEqual(updatedEntry.GDP, 2_000_000);
  assert.strictEqual(updatedEntry.GDPPerCapita, 25_000);
  assert.strictEqual(updatedEntry.minAnnualSalary, 12_000);
  assert.strictEqual(updatedEntry.ministers.budget, 400_000);
  assert.strictEqual(updatedEntry.ministers.quantity, 3);
  assert.strictEqual(updatedEntry.deputies.quantity, 2);
  assert.strictEqual(updatedEntry.senate.quantity, 1);
  assert.strictEqual(updatedEntry.ministersBudgetPctOfGDP, 20);

  assert.strictEqual(updatedEntry.GDPGrowthYoY, 150);
  assert.strictEqual(updatedEntry.GDPPerCapitaGrowthYoY, 38.89);
  assert.strictEqual(updatedEntry.minAnnualSalaryGrowthYoY, 33.33);

  assert.deepStrictEqual(updatedEntry.partyRangeStats.counts, {
    1: 2,
    2: 2,
    3: 0,
    4: 2,
    5: 0,
  });
  assert.deepStrictEqual(updatedEntry.partyRangeStats.mostPopularRanges, [1, 2, 4]);
  assert.strictEqual(updatedEntry.partyRangeStats.mostPopularCount, 2);
  assert.strictEqual(updatedEntry.partyRangeStats.totalCountedOfficials, 6);
  assert.strictEqual(updatedEntry.partyRangeStats.unaffiliatedCount, 0);
  assert.strictEqual(updatedEntry.partyRangeStats.unmappedPartyCount, 0);

  assert.deepStrictEqual(updatedEntry.partyRangeStatsSplit.executive.counts, {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  assert.deepStrictEqual(updatedEntry.partyRangeStatsSplit.rest.counts, {
    1: 2,
    2: 2,
    3: 0,
    4: 2,
    5: 0,
  });
});
