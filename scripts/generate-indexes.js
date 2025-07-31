const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..");
const globalIndex = {};

function isDirectory(p) {
  return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

function dataFileExists(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function generateIndexes() {
  const countries = fs
    .readdirSync(dataDir)
    .filter((country) => isDirectory(path.join(dataDir, country)));

  countries.forEach((country) => {
    const countryPath = path.join(dataDir, country);
    const periods = [];

    const years = fs
      .readdirSync(countryPath)
      .filter((year) => isDirectory(path.join(countryPath, year)));

    years.forEach((year) => {
      const yearPath = path.join(countryPath, year);
      const semesters = fs
        .readdirSync(yearPath)
        .filter((sem) => dataFileExists(path.join(yearPath, sem, "data.json")));

      semesters.forEach((semester) => {
        periods.push({
          year: Number(year),
          semester: Number(semester),
        });
      });
    });

    if (periods.length > 0) {
      globalIndex[country] = periods;

      // Write country-level index
      fs.writeFileSync(
        path.join(countryPath, "index.json"),
        JSON.stringify(periods, null, 2),
        "utf-8"
      );
    }
  });

  // Write global index
  fs.writeFileSync(
    path.join(dataDir, "index.json"),
    JSON.stringify(globalIndex, null, 2),
    "utf-8"
  );

  console.log("✅ index.json files generated");
}

generateIndexes();
