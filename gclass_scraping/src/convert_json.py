import argparse
import glob
import json
import re
import sys
from pathlib import Path
from typing import Any

# Add project root to sys.path
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
sys.path.insert(0, str(parent_dir))

from src.config import BASE_DIR, OUTPUT_DIR
from src.exporter import export_all


def clean_item(item: dict[str, Any]) -> dict[str, Any]:
    """Cleans up course name, topic, whitespace, and formatting."""
    cname = item.get("course_name", "") or ""
    # Strip leading 'Classroom\n' or 'Classroom' breadcrumbs
    cleaned_cname = re.sub(r"^Classroom\s*", "", cname, flags=re.IGNORECASE).strip()
    if not cleaned_cname or cleaned_cname.lower() in ("dashboard", "classroom", "classroom dashboard"):
        cleaned_cname = "Classroom Dashboard"
    item["course_name"] = cleaned_cname

    topic = item.get("topic", "") or ""
    cleaned_topic = re.sub(r"^Classroom\s*", "", topic, flags=re.IGNORECASE).strip()
    if not cleaned_topic or cleaned_topic == cleaned_cname or cleaned_topic.lower() in ("dashboard", "classroom", "classroom dashboard"):
        cleaned_topic = "General / Main Feed"
    item["topic"] = cleaned_topic

    return item


def merge_json_files(file_paths: list[Path]) -> list[dict[str, Any]]:
    """Loads and deduplicates items across multiple JSON export files."""
    seen_map: dict[tuple[str, str, str], dict[str, Any]] = {}

    for fp in file_paths:
        if not fp.exists():
            continue
        try:
            with open(fp, "r", encoding="utf-8") as f:
                data = json.load(f)
            if not isinstance(data, list):
                continue
            for raw_it in data:
                it = clean_item(raw_it)
                # Deduplication key: (course, title, topic)
                key = (
                    it.get("course_name", ""),
                    it.get("item_title", ""),
                    it.get("topic", ""),
                )
                if key not in seen_map:
                    seen_map[key] = it
                else:
                    # Merge attachments if newly discovered
                    existing_atts = seen_map[key].get("attachments", [])
                    new_atts = it.get("attachments", [])
                    existing_urls = {a.get("url") for a in existing_atts if a.get("url")}
                    for na in new_atts:
                        if na.get("url") not in existing_urls:
                            existing_atts.append(na)
                            existing_urls.add(na.get("url"))
                    seen_map[key]["attachments"] = existing_atts
        except Exception as e:
            print(f"[Warning] Failed to read {fp}: {e}")

    return list(seen_map.values())


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Merge and convert classroom_materials*.json into CSV and Markdown catalogs"
    )
    parser.add_argument(
        "files",
        nargs="*",
        default=[],
        help="Path(s) or glob pattern to classroom_materials*.json files",
    )
    args = parser.parse_args()

    input_paths: list[Path] = []

    # 1. Check explicit arguments
    if args.files:
        for arg in args.files:
            # Handle wildcards
            matched = glob.glob(arg)
            if matched:
                input_paths.extend([Path(m) for m in matched])
            else:
                input_paths.append(Path(arg))
    else:
        # Default: Search in output/ and in user Downloads
        out_target = OUTPUT_DIR / "classroom_materials.json"
        if out_target.exists():
            input_paths.append(out_target)

        user_downloads = Path.home() / "Downloads"
        download_matches = list(user_downloads.glob("classroom_materials*.json"))
        if download_matches:
            input_paths.extend(download_matches)

    # Resolve unique absolute paths
    unique_paths = []
    seen_paths = set()
    for p in input_paths:
        abs_p = p.resolve()
        if abs_p.exists() and abs_p not in seen_paths:
            seen_paths.add(abs_p)
            unique_paths.append(abs_p)

    if not unique_paths:
        print("[Error] No classroom_materials*.json files found.")
        print(f"Searched in: {OUTPUT_DIR} and {Path.home() / 'Downloads'}")
        return

    print(f"[Converter] Merging {len(unique_paths)} JSON file(s):")
    for p in sorted(unique_paths):
        print(f"  • {p.name}")

    merged_items = merge_json_files(unique_paths)

    if not merged_items:
        print("[Error] No items found in provided JSON file(s).")
        return

    # Count statistics
    total_attachments = sum(len(it.get("attachments", [])) for it in merged_items)
    courses = {it.get("course_name") for it in merged_items}

    out = export_all(merged_items)

    print("\n" + "=" * 60)
    print("CATALOG GENERATION & MERGE COMPLETE")
    print("=" * 60)
    print(f"Courses Discovered            : {len(courses)}")
    for c in sorted(courses):
        c_items = [it for it in merged_items if it.get("course_name") == c]
        c_atts = sum(len(it.get("attachments", [])) for it in c_items)
        print(f"  - {c}: {len(c_items)} posts, {c_atts} attachments")
    print("-" * 60)
    print(f"Total Unique Items            : {len(merged_items)}")
    print(f"Total Attachments Logged      : {total_attachments}")
    print(f"Master JSON Catalog           : {out['json']}")
    print(f"CSV Tasks & Schedules         : {out['csv_tasks']}")
    print(f"CSV Links & Attachments       : {out['csv_links']}")
    print(f"Markdown Catalog              : {out['md']}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
