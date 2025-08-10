# Contributing to Gov Salaries Data

Thank you for your interest in contributing to this open data project! 🎉

We welcome new data submissions, corrections, and improvements from the community.

---

## 📂 Data Structure

All data is organized by **country** and **year** in the **data** folder, the only files you need to create/update are:

```
/data/<country>/<year>/data.json
/data/<country>/<year>/rates.json
```

✅ Example:

```
/data/es/2025/data.json
/data/es/2025/rates.json
```

---

## 🧾 Data Format

Each `data.json` should follow this structure:

- Salaries should represent **anual gross** and **anual net** numeric amounts

You can view the expected format here:  
➡️ [`templates/data-template.json`](templates/data-template.json)

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
- [ ] Confirm salaries are numeric

---

## 🤝 License Reminder

By contributing, you agree to release your data contributions under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), meaning no rights are reserved.

---

Thank you for helping build transparent public salary data for everyone! 🌍
