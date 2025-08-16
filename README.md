# Gov Salaries Data

📊 A public, structured dataset of government officials’ salaries — open, versioned, and community-driven.

This project provides structured JSON files listing salaries by country and year. The goal is to improve transparency and empower civic tech, journalists, and researchers.

---

## 🔗 Public API (GitHub Pages)

All JSON data is publicly available at:

**https://cdmngz.github.io/gov-salaries-data/data**

### Example URLs:

- [`/es/2025/data.json`](https://cdmngz.github.io/gov-salaries-data/data/es/2025/data.json) – officials, parties, base currency, etc.
- [`/es/2025/rates.json`](https://cdmngz.github.io/gov-salaries-data/data/es/2025/rates.json) – exchange rates for currency conversion
- [`/es/index.json`](https://cdmngz.github.io/gov-salaries-data/data/es/index.json) – available years per country
- [`/index.json`](https://cdmngz.github.io/gov-salaries-data/data/index.json) – all available countries years

---

## 📂 Data Structure

Each dataset is organized by:

`/<country>/<year>/data.json`
`/<country>/<year>/rates.json`

### Example:

`/es/2025/data.json`
`/es/2025/rates.json`

- `data.json` contains official records, metadata, and the country `baseCurrency` field.
- `rates.json` contains conversion rates **relative to that baseCurrency**, including both fiat and selected cryptocurrencies.

---

## 💱 Currency & Rates

- Every `data.json` includes a `baseCurrency` (e.g. `"USD"`)
- Each `rates.json` provides conversion rates for:
  - Major world currencies (EUR, GBP, JPY, etc.)
  - Cryptocurrencies (BTC, ETH)
- Currencies are expressed as:  
  `1 baseCurrency = X targetCurrency`

---

## 🌍 Supported Countries

- 🇦🇷 Argentina (`/ar`)
- 🇪🇸 Spain (`/es`)
- 🇫🇷 France (`/fr`)
- 🇺🇸 United States (`/us`)
- _(More can be added via pull requests)_

---

## 🤝 Contributing

We welcome your help! To contribute:

1. **Fork the repo**
2. **Add or update a `data.json` file** in the correct folder (`/data/<country>/<year>/data.json`)
3. **Add or update a `rates.json` file** in the correct folder (`/data/<country>/<year>/rates.json`)
4. **Follow the expected JSON format** — see the template below
5. **Submit a Pull Request**

✅ `index.json` files (used to track available periods) are auto-generated on each push.

---

## 🧾 Data Template

Please make sure your `data.json` and `rates.json` files follows the structure shown in:

➡️ [`templates/data-template.json`](templates/data-template.json)
➡️ [`templates/rates-template.json`](templates/rates-template.json)

## 🤖 API response structure

In order to see the full structure of the json response, you can take a look to the openapi documentation

📚 [`openapi/openapi.yaml`](openapi/openapi.yaml)

## 📜 License

No rights are reserved.

This license applies to all data files in this repository, including those under /ar/, /es/, and similar country folders.

Community contributions and updates to this dataset are welcome.
