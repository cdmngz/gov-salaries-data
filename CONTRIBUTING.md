# Contributing to Gov Salaries Data

Thank you for your interest in contributing to this open data project! 🎉

We welcome new data submissions, corrections, and improvements from the community.

---

## 📂 Data Structure

All data is organized by **country**, **year**, and **semester**:

```
/<country>/<year>/<semester>/data.json
```

✅ Example:

```
/ar/2025/1/data.json
```

---

## 🧾 Data Format

Each `data.json` should follow this structure:

```json
{
  "president": {
    "name": "Full Name",
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
  ],
  "senators": [
    {
      "name": "Senator 1",
      "salary": {
        "gross": 1234,
        "net": 1000
      }
    }
  ]
}
```

- Use numeric values without currency symbols
- Salaries should represent **monthly gross salary** (unless noted otherwise)
- Names can be anonymized if necessary

---

## 🛠 Auto-indexing

After your pull request is merged, the repository will automatically update the `index.json` files for each country.

You **do not** need to edit them manually.

---

## ✅ Quick Checklist Before You PR

- [ ] Place the file in the correct path
- [ ] Ensure the JSON is valid (no trailing commas!)
- [ ] Confirm salaries are numeric
- [ ] Include only publicly available or verified data

---

## 🤝 License Reminder

By contributing, you agree to release your data contributions under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), meaning no rights are reserved.

---

Thank you for helping build transparent public salary data for everyone! 🌍
