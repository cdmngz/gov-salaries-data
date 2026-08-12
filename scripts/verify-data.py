#!/usr/bin/env python3
import argparse
import json
import pathlib
import sys
from collections import defaultdict


ROOT = pathlib.Path(__file__).resolve().parents[1]

people_sections = ["royalty", "executive", "ministers", "deputies", "senate", "officials"]
required_data_keys = ["baseCurrency", *people_sections, "parties"]
required_econ_keys = ["baseCurrency", "GDP", "GDPPerCapita", "minAnnualSalary", "timestamp"]


def parse_args():
    parser = argparse.ArgumentParser(description="Verify country salary data by year")
    parser.add_argument(
        "years",
        metavar="YEAR",
        nargs="*",
        type=int,
        help="years to verify (default: every detected year)",
    )
    return parser.parse_args()


def read_json(path, country, issues, summary):
    try:
        return json.loads(path.read_text())
    except FileNotFoundError:
        issues.append((country, path, "missing file"))
        summary["missing_files"] += 1
    except (json.JSONDecodeError, OSError) as error:
        issues.append((country, path, f"invalid JSON: {error}"))
        summary["invalid_json"] += 1
    return None


def find_years():
    return sorted(
        {
            int(year_dir.name)
            for country_dir in (ROOT / "data").iterdir()
            if country_dir.is_dir()
            and len(country_dir.name) == 2
            and country_dir.name.isalpha()
            for year_dir in country_dir.iterdir()
            if year_dir.is_dir() and year_dir.name.isdigit() and len(year_dir.name) == 4
        }
    )


def find_country_dirs():
    """Return every directory that represents a country dataset."""
    return sorted(
        path
        for path in (ROOT / "data").iterdir()
        if path.is_dir() and len(path.name) == 2 and path.name.isalpha()
    )


def find_country_codes():
    """Use the global index as a manifest so a deleted country is not skipped."""
    country_codes = {path.name for path in find_country_dirs()}
    try:
        global_index = json.loads((ROOT / "data" / "index.json").read_text())
    except (json.JSONDecodeError, OSError):
        return sorted(country_codes)
    if isinstance(global_index, dict):
        country_codes.update(global_index)
    return sorted(country_codes)


def verify_year(year):
    issues = []
    summary = defaultdict(int)

    country_codes = find_country_codes()
    summary["countries_expected"] = len(country_codes)

    for country in country_codes:
        country_dir = ROOT / "data" / country
        year_dir = country_dir / str(year)
        if not year_dir.is_dir():
            issues.append((country, year_dir, "missing year directory"))
            summary["missing_year_directories"] += 1
            continue

        summary["countries"] += 1
        data_path = year_dir / "data.json"
        data = read_json(data_path, country, issues, summary)
        econ_path = year_dir / "economics.json"
        economics = read_json(econ_path, country, issues, summary)

        if data is not None and not isinstance(data, dict):
            issues.append((country, data_path, "top-level JSON value should be an object"))
            summary["invalid_data_format"] += 1
        elif data is not None:
            for key in required_data_keys:
                if key not in data:
                    issues.append((country, data_path, f"missing key `{key}`"))
                    summary[f"missing_data_{key}"] += 1

            for section in people_sections:
                values = data.get(section)
                if values is not None and not isinstance(values, list):
                    issues.append((country, data_path, f"`{section}` should be a list"))
                    summary["invalid_people_sections"] += 1

            if "parties" in data and not isinstance(data["parties"], dict):
                issues.append((country, data_path, "`parties` should be an object"))
                summary["invalid_parties"] += 1

        if economics is not None and not isinstance(economics, dict):
            issues.append((country, econ_path, "top-level JSON value should be an object"))
            summary["invalid_economics_format"] += 1
        elif economics is not None:
            for key in required_econ_keys:
                if key not in economics:
                    issues.append((country, econ_path, f"missing key `{key}`"))
                    summary[f"missing_econ_{key}"] += 1

        if (
            isinstance(data, dict)
            and isinstance(economics, dict)
            and "baseCurrency" in data
            and "baseCurrency" in economics
            and data["baseCurrency"] != economics["baseCurrency"]
        ):
            issues.append(
                (
                    country,
                    econ_path,
                    "baseCurrency mismatch "
                    f"data={data['baseCurrency']} economics={economics['baseCurrency']}",
                )
            )
            summary["base_currency_mismatch"] += 1

    print(f"{year} dataset verification")
    print(f"Countries expected: {summary['countries_expected']}")
    print(f"Countries scanned: {summary['countries']}")
    print(f"Issues found: {len(issues)}")
    for key in sorted(summary):
        if key not in {"countries", "countries_expected"}:
            print(f"- {key}: {summary[key]}")

    if issues:
        print("\nDetailed issues:")
        for country, path, message in issues:
            print(f"- {country}: {path.relative_to(ROOT)} -> {message}")

    return issues


def main():
    args = parse_args()
    years = args.years or find_years()
    if not years:
        print("No country data years found", file=sys.stderr)
        return 1

    issue_count = 0
    for index, year in enumerate(years):
        if index:
            print()
        issue_count += len(verify_year(year))
    return 1 if issue_count else 0


if __name__ == "__main__":
    sys.exit(main())
