# Gov Salaries Data

📊 A public, structured dataset of government officials’ salaries — open, versioned, and community-driven.

This project provides structured JSON files listing salaries by country, year, and semester. The goal is to improve transparency and empower civic tech, journalists, and researchers.

---

## 🔗 Public API (GitHub Pages)

All JSON data is publicly available at:

**https://cdmngz.github.io/gov-salaries-data/**

Example URLs:

- https://cdmngz.github.io/gov-salaries-data/es/2025/1/data.json
- https://cdmngz.github.io/gov-salaries-data/es/index.json
- https://cdmngz.github.io/gov-salaries-data/index.json

You can use these URLs directly in your frontend, scripts, or external tools.

---

## 📂 Data Structure

Each data file lives under the following path format:

`/<country>/<year>/<semester>/data.json`

**Example:**

`/es/2025/1/data.json`

You can access the raw data via GitHub Pages:

https://cdmngz.github.io/gov-salaries-data/ar/2025/1/data.json

---

## 🌍 Supported Countries

- 🇦🇷 Argentina (`/ar`)
- 🇪🇸 Spain (`/es`)
- _(More can be added via pull requests)_

---

## 🤝 Contributing

We welcome your help! To contribute:

1. Fork the repo
2. Add or update `data.json` in the correct folder
3. Make sure it's valid JSON with this format:

```json
{
  "president": {
    "name": "Name",
    "salary": {
      "gross": 1234,
      "net": 1000
    }
  },
  "congress": [
    {
      "name": "Member 1",
      "salary": {
        "gross": 1234,
        "net": 1000
      }
    },
    {
      "name": "Member 2",
      "salary": {
        "gross": 1234,
        "net": 1000
      }
    }
  ]
}
```

4. Submit a Pull Request

✅ The index.json files (used to track available periods) are auto-generated on each push.

## 📜 License

No rights are reserved.

This license applies to all data files in this repository, including those under /ar/, /es/, and similar country folders.

Community contributions and updates to this dataset are welcome.
