#!/usr/bin/env python3
import json, glob, pathlib
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parents[1]

required_data_keys = ["baseCurrency", "parties"]
required_econ_keys = ["baseCurrency", "GDP", "GDPPerCapita", "minAnnualSalary", "timestamp"]
people_sections = ["royalty", "executive", "ministers", "deputies", "senate", "officials"]

issues = []
summary = defaultdict(int)

for data_path in sorted(ROOT.glob('data/*/2026/data.json')):
    country = data_path.parts[-3]
    data = json.loads(data_path.read_text())
    econ_path = data_path.with_name('economics.json')
    econ = json.loads(econ_path.read_text()) if econ_path.exists() else None

    summary['countries'] += 1
    for key in required_data_keys:
        if key not in data:
            issues.append((country, data_path, f"missing key `{key}`"))
            summary[f'missing_data_{key}'] += 1

    for section in people_sections:
        values = data.get(section)
        if values is not None and not isinstance(values, list):
            issues.append((country, data_path, f"`{section}` should be a list"))
            summary['invalid_people_sections'] += 1

    if econ is None:
        issues.append((country, econ_path, "missing economics.json"))
        summary['missing_economics_file'] += 1
        continue

    for key in required_econ_keys:
        if key not in econ:
            issues.append((country, econ_path, f"missing key `{key}`"))
            summary[f'missing_econ_{key}'] += 1

    if 'baseCurrency' in data and 'baseCurrency' in econ and data['baseCurrency'] != econ['baseCurrency']:
        issues.append((country, econ_path, f"baseCurrency mismatch data={data['baseCurrency']} economics={econ['baseCurrency']}"))
        summary['base_currency_mismatch'] += 1

print('2026 dataset verification')
print(f"Countries scanned: {summary['countries']}")
print(f"Issues found: {len(issues)}")
for k in sorted(summary):
    if k == 'countries':
        continue
    print(f"- {k}: {summary[k]}")

if issues:
    print('\nDetailed issues:')
    for country, path, message in issues:
        print(f"- {country}: {path.relative_to(ROOT)} -> {message}")
