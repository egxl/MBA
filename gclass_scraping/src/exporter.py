import csv
import json
from pathlib import Path
from typing import Any

from .config import OUTPUT_DIR


def export_all(items: list[dict[str, Any]], output_dir: Path | None = None) -> dict[str, Path]:
    """Exports scraped items to JSON, CSVs (links + schedules), and Markdown catalog.

    All artifacts are strictly routed to output_dir (defaults to gclass_scraping/output/).
    Zero binary files downloaded.
    """
    out_dir = output_dir or OUTPUT_DIR
    out_dir.mkdir(parents=True, exist_ok=True)

    json_path = out_dir / "classroom_materials.json"
    csv_links_path = out_dir / "classroom_links.csv"
    csv_tasks_path = out_dir / "classroom_schedules_and_tasks.csv"
    md_path = out_dir / "classroom_catalog.md"

    # 1. Export JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)

    # 2. Export CSV: Flat Attachment / Drive Links Ledger
    with open(csv_links_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "course_name",
                "course_id",
                "course_section",
                "topic",
                "item_type",
                "item_title",
                "posted_timestamp",
                "due_date",
                "file_name",
                "link_type",
                "action_taken",
                "url",
                "scraped_at",
            ]
        )

        for item in items:
            attachments = item.get("attachments", [])
            if not attachments:
                writer.writerow(
                    [
                        item.get("course_name", ""),
                        item.get("course_id", ""),
                        item.get("course_section", ""),
                        item.get("topic", ""),
                        item.get("item_type", ""),
                        item.get("item_title", ""),
                        item.get("posted_timestamp", ""),
                        item.get("due_date", ""),
                        "",
                        "none",
                        "no_attachment",
                        item.get("item_url", ""),
                        item.get("scraped_at", ""),
                    ]
                )
            else:
                for att in attachments:
                    writer.writerow(
                        [
                            item.get("course_name", ""),
                            item.get("course_id", ""),
                            item.get("course_section", ""),
                            item.get("topic", ""),
                            item.get("item_type", ""),
                            item.get("item_title", ""),
                            item.get("posted_timestamp", ""),
                            item.get("due_date", ""),
                            att.get("file_name", ""),
                            att.get("link_type", ""),
                            att.get("action_taken", ""),
                            att.get("url", ""),
                            item.get("scraped_at", ""),
                        ]
                    )

    # 3. Export CSV: Schedules, Tasks, and Deadlines
    with open(csv_tasks_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "course_name",
                "topic",
                "item_type",
                "work_type",
                "item_title",
                "due_date",
                "max_points",
                "posted_timestamp",
                "attachments_count",
                "url",
            ]
        )

        for item in items:
            # Include assignments, announcements with schedules, or any item with due date
            if item.get("item_type") == "assignment" or item.get("due_date") or item.get("item_type") == "announcement":
                writer.writerow(
                    [
                        item.get("course_name", ""),
                        item.get("topic", "General"),
                        item.get("item_type", ""),
                        item.get("work_type", "-"),
                        item.get("item_title", ""),
                        item.get("due_date") or "-",
                        item.get("max_points") or "-",
                        item.get("posted_timestamp", ""),
                        len(item.get("attachments", [])),
                        item.get("item_url", ""),
                    ]
                )

    # 4. Export Markdown Catalog
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# Google Classroom Schedules, Tasks & Materials Catalog\n\n")
        f.write("> Logged automatically. Zero files downloaded; folder links saved without opening.\n\n")

        # Section A: Deadlines & Tasks Overview
        deadlines = [it for it in items if it.get("due_date")]
        if deadlines:
            # Sort by due_date string
            deadlines.sort(key=lambda x: str(x.get("due_date") or ""))
            f.write("## Upcoming Deadlines & Tasks\n\n")
            f.write("| Due Date | Course | Task Title | Type | Attachments | Link |\n")
            f.write("| :--- | :--- | :--- | :--- | :--- | :--- |\n")
            for d in deadlines:
                att_count = len(d.get("attachments", []))
                f.write(
                    f"| **{d.get('due_date')}** | {d.get('course_name')} | {d.get('item_title')} | `{d.get('item_type')}` | {att_count} file(s) | [Open Task]({d.get('item_url', '#')}) |\n"
                )
            f.write("\n---\n\n")

        # Section B: Course & Topic Catalog
        courses: dict[str, list[dict[str, Any]]] = {}
        for item in items:
            cname = item.get("course_name") or "Unknown Course"
            courses.setdefault(cname, []).append(item)

        for cname, c_items in courses.items():
            f.write(f"## Course: {cname}\n\n")

            # Group by topic
            topics: dict[str, list[dict[str, Any]]] = {}
            for item in c_items:
                top = item.get("topic") or "General"
                topics.setdefault(top, []).append(item)

            for topic_name, t_items in topics.items():
                f.write(f"### Topic: {topic_name}\n\n")
                f.write("| Item / Post Title | Type | Due / Posted | Attachment / Resource | Type | Resource Link |\n")
                f.write("| :--- | :--- | :--- | :--- | :--- | :--- |\n")

                for it in t_items:
                    title = it.get("item_title", "-")
                    itype = it.get("item_type", "material")
                    timestamp = it.get("due_date") or it.get("posted_timestamp") or "-"
                    atts = it.get("attachments", [])

                    if not atts:
                        f.write(f"| {title} | `{itype}` | {timestamp} | _(None)_ | - | [View Post]({it.get('item_url', '#')}) |\n")
                    else:
                        for idx, att in enumerate(atts):
                            fname = att.get("file_name", "Attachment")
                            ltype = att.get("link_type", "link")
                            url = att.get("url", "#")
                            row_title = title if idx == 0 else "->"
                            row_type = f"`{itype}`" if idx == 0 else ""
                            row_time = timestamp if idx == 0 else ""
                            f.write(f"| {row_title} | {row_type} | {row_time} | {fname} | `{ltype}` | [Open Link]({url}) |\n")

                f.write("\n")

    return {
        "json": json_path,
        "csv": csv_links_path,
        "csv_links": csv_links_path,
        "csv_tasks": csv_tasks_path,
        "md": md_path,
    }
