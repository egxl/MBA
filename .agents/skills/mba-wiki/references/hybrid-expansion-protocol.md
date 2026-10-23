# Hybrid Expansion Protocol: Optional Slide-to-Handbook Boost (`hybrid-expansion-protocol.md`)

This protocol defines how raw slides and optional pre-expanded handbook drafts are compiled into the **P3MD MBA Cohort Knowledge Base**.

---

## 💡 How Slide Expansion Works (Zero-Friction Default)

1. **Default One-Pass Ingestion (No External Step Required)**:
   - You can drop raw slides (`.pdf`, `.pptx`), case PDFs, and `.docx` files directly into `raw/courses/mkX/week-YY/` and ask Antigravity to ingest the week.
   - Antigravity runs `npm run raw:prep`, reads the slides and extracted notes directly, and writes a complete, textbook-grade **Master Lecture Hub (`index.md`)** in one pass.
   - **No Warning Banners**: Published pages never show yellow "Handbook Expansion Pending" banners to the cohort.

2. **Optional External LLM Boost (`handbook-draft.*`)**:
   - If a week has a massive 60-slide deck or you want to pre-expand the lecture using **Gemini Advanced Web**, **ChatGPT Prism**, or **Claude** to save IDE tokens, you can drop `handbook-draft.md` (or `.tex` / `.txt`) into `raw/courses/mkX/week-YY/`.
   - When `handbook-draft.*` is present in the folder, Antigravity automatically uses it as the primary narrative baseline for `index.md`.

---

## 📋 Optional Slide-to-Handbook Master Prompt (For External Web LLMs)

If you choose to pre-expand a week externally in **Gemini Advanced Web**, **ChatGPT Prism**, or **Claude**, paste this prompt alongside your uploaded slides, transcripts, and readings:

```markdown
# Role & Purpose
You are an Executive MBA professor and curriculum author writing for the P3MD MBA Cohort Portal.

Analyze all attached materials for this week. Use **[Main_Lecture_Slides.pdf]** as the primary curricular spine. Expand its slide points into a comprehensive, textbook-grade executive course chapter in Markdown.

Synthesize all attached supplementary files into the narrative:
- **Readings & Papers**: Weave theoretical frameworks, empirical citations, and author arguments directly into corresponding lecture topics.
- **Cases & Assignments**: Embed case dilemmas, operational data, tables, and decision options as real-world crucibles testing lecture models.
- **Transcripts & Notes**: Integrate lecturer insights, local Indonesian BUMN context, and debate nuances.

Visual & Data Preservation Requirements:
- Render pure data tables in Markdown and quantitative formulas in LaTeX math ($...$).
- Use clean modular topic headings. Write continuous, rigorous analytical prose with zero slide-speak ("On slide 5...").
```
