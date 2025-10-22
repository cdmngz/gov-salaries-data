# Gov Salaries Data

📊 A public, structured dataset of government officials’ salaries — open, versioned, and community-driven.

This project provides structured JSON files listing salaries by country and year. The goal is to improve transparency and empower civic tech, journalists, and researchers.

---

## 🔗 Public API (GitHub Pages)

All JSON data is publicly available at:

**https://cdmngz.github.io/gov-salaries-data/data**

### Example URLs:

- [`/es/2025/data.json`](https://cdmngz.github.io/gov-salaries-data/data/es/2025/data.json) – officials, parties, base currency, etc.
- [`/es/2025/economics.json`](https://cdmngz.github.io/gov-salaries-data/data/es/2025/economics.json) – macro indicators for the local currency
- [`/es/index.json`](https://cdmngz.github.io/gov-salaries-data/data/es/index.json) – available years per country
- [`/index.json`](https://cdmngz.github.io/gov-salaries-data/data/index.json) – all available countries years

---

## 📂 Data Structure

Each dataset is organized by:

`/<country>/<year>/data.json`
`/<country>/<year>/economics.json`

### Example:

`/es/2025/data.json`
`/es/2025/economics.json`

- `data.json` contains official records, metadata, and the country `baseCurrency` field.
- `economics.json` stores macroeconomic indicators (GDP, GDP per capita, minimum annual salary, timestamp) in the local `baseCurrency`.

---

## 💱 Currency & Rates

- Every `data.json` includes a `baseCurrency` (e.g. `"USD"`).
- Each country's macro data is stored in `economics.json`; conversions are normalized through the shared world file at `/data/world/<year>/rates.json`, which lists 12 core currencies.
- Currency conversions are performed relative to the `baseCurrency` using the world rates during the build step.

---

## 🤝 Contributing

We welcome your help! To contribute:

1. **Fork the repo**
2. **Add or update a `data.json` file** in the correct folder (`/data/<country>/<year>/data.json`)
3. **Add or update an `economics.json` file** in the correct folder (`/data/<country>/<year>/economics.json`)
4. **Follow the expected JSON format** — see the template below
5. **Submit a Pull Request**

✅ `index.json` files (used to track available periods) are auto-generated on each push.

---

## 🧾 Data Template

Please make sure your `data.json` and `economics.json` files follows the structure shown in:

➡️ [`templates/data-template.json`](templates/data-template.json)

➡️ [`templates/economics-template.json`](templates/economics-template.json)

---

## 🤖 API response structure

In order to see the full structure of the json response, you can take a look to the openapi documentation

📚 [openapi.yaml en Swagger UI](https://petstore.swagger.io/?url=https://raw.githubusercontent.com/cdmngz/gov-salaries-data/main/openapi/openapi.yaml)

---

## 📜 License

No rights are reserved.

This license applies to all data files in this repository, including those under /ar/, /es/, and similar country folders.

Community contributions and updates to this dataset are welcome.
