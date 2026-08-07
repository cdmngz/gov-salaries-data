# Contributing to Gov Salaries Data

Thank you for your interest in contributing to this open data project! 🎉

We welcome new data submissions, corrections, and improvements from the community.

---

## 📂 Data Structure

All data is organized by **country** and **year** in the **data** folder, the only files you need to create/update are:

```
/data/<country>/<year>/data.json
/data/<country>/<year>/economics.json
```

✅ Example:

```
/data/es/2025/data.json
/data/es/2025/economics.json
```

---

## 🧾 Data Format

Each `data.json` should follow this structure:

- Salaries should represent **annual gross** and **annual net** numeric amounts
- Every file must contain `baseCurrency`, `royalty`, `executive`, `ministers`,
  `deputies`, `senate`, `officials`, and `parties`.
- Keep personnel sections as arrays and `parties` as an object. When a country has
  no entries for a section, keep its key and use an empty array (`[]`) or empty
  object (`{}`) instead of omitting it.
- Every `economics.json` must contain `baseCurrency`, `GDP`, `GDPPerCapita`,
  `minAnnualSalary`, and `timestamp`.

You can view the expected format here:  
➡️ [`templates/data-template.json`](templates/data-template.json)

The corresponding economics format is documented in
[`templates/economics-template.json`](templates/economics-template.json).

This template serves as the reference for how your `data.json` files should be structured. Please validate your JSON against this format before submitting a pull request.

---

## 🛠 Auto-indexing

After your pull request is merged, the repository will automatically update the `index.json` files for each country.

```markdown
You **do not** need to edit the index.json files manually, these files are automatically updated.
```

---

## ✅ Quick Checklist Before You PR

- [ ] Place the file in the correct path
- [ ] Ensure the JSON is valid (no trailing commas!)
- [ ] Preserve all required keys, using empty collections for sections without data
- [ ] Confirm salaries are numeric

---

## 🤝 License Reminder

By contributing, you agree to release your data contributions under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), meaning no rights are reserved.

---

Thank you for helping build transparent public salary data for everyone! 🌍

## Validate data locally

Before committing or pushing data changes, run the repository verifier:

```bash
python3 scripts/verify-data.py
```

The command automatically discovers and validates every four-digit year under the
country data directories. To validate only selected years, pass them explicitly,
for example `python3 scripts/verify-data.py 2025 2026`.

Pull requests and every branch push run the same validation in GitHub Actions. The
workflow must be configured as a required status check in the repository's branch
protection rules to prevent merging invalid data.
