# Hybrid Expansion Protocol: Slide-to-Handbook Engine (`hybrid-expansion-protocol.md`)

This protocol defines the **Token-Efficient Hybrid Workflow** for ingesting slide-heavy course modules into the **P3MD MBA Knowledge Base**.

---

## 💡 Why the Hybrid Workflow Exists

1. **The Slide-Speak Problem**: PowerPoint and PDF slides are fundamentally terse, fragmented bullet points meant for live oral delivery. Ingesting raw slides directly into an LLM produces an over-simplified summary that loses the lecturer's depth.
2. **Token Economics**: Expanding a 60-slide deck into a comprehensive 5,000–8,000 word textbook-style chapter directly inside an IDE coding assistant (Antigravity) consumes massive context and token budgets.
3. **The Division of Labor**:
   - **External Web LLM (Gemini Advanced Web / ChatGPT Prism)**: Expands slides into an authoritative handbook chapter at zero Antigravity token cost (leveraging flat-rate subscriptions, 1M–2M context windows, and live web search).
   - **Antigravity**: Compiles the draft into the Quartz knowledge base (Mermaid rendering, atomic concept extraction, entity profiling, reading satellites, and zero-broken-link validation).

---

## 🌐 Format-Agnostic Ingestion Architecture

You do **not** need different prompts for different tools. Both frontier models automatically output in their native format:
- **Gemini Advanced Web / Claude**: Natively outputs **Markdown** (`handbook-draft.md`).
- **ChatGPT Prism**: Natively outputs **LaTeX** (`handbook-draft.tex`).

Antigravity natively accepts any draft format (`handbook-draft.md`, `handbook-draft.tex`, or `handbook-draft.txt`) in `raw/courses/mkX/week-YY/` and ingests it directly into Quartz Markdown without needing external scripts or transpilers.

---

## 📋 The Unified Slide-to-Handbook Master Prompt

Copy and paste this single prompt into **Gemini Advanced Web**, **ChatGPT Prism**, or **Claude** alongside your uploaded slides, transcripts, and readings:

```markdown
# Role & Purpose
You are a distinguished Professor of Management and Executive MBA Curriculum Author at a top global business school. 

You are given a raw slide deck (and/or video transcript/syllabus notes) from an Executive MBA course module. Slide decks are inherently terse, fragmented, and written in bullet points ("slide-speak").

Your task is to transform these raw materials into an exhaustive, masterclass-level **Executive Course Handbook Chapter**. It must read like an authoritative handbook or executive textbook chapter—providing all the comprehensive explanations, theoretical mechanisms, and analytical depth that a world-class professor would deliver in class.

---

## Non-Negotiable Operational Rules

### 1. Mandatory Web Search & Fact Grounding (CRITICAL)
Whenever an academic theory, framework, author, book, empirical study, statistical figure, or corporate case study is mentioned on the slides or transcript:
- **Active Web Grounding**: You MUST actively search the web to verify the exact definitions, original authors, publication years, underlying mathematical formulas, and historical context.
- **No Hallucination**: Do not guess or approximate academic citations or empirical metrics. Ensure that every framework (e.g. Little's Law, Porter's Five Forces, Ikigai, Theory of Constraints) is grounded in its authentic academic and empirical foundations.
- **Enrich with Real-World Context**: Search for authoritative facts regarding any company or executive mentioned (e.g., PT Kereta Api Indonesia, Heineken, Unilever, Bank Mandiri) to provide accurate operational data, timeline, and industry context.

### 2. Complete Visual Asset Preservation (CRITICAL)
Systematically preserve and reconstruct EVERY single visual asset (diagram, chart, graph, matrix, framework) in the materials. Do not skip or summarize any visual away:
- **Flowcharts & Process Maps**: Render as structured diagrams (e.g. Mermaid flowchart code blocks or clear structural pipelines).
- **2x2 Matrices & Quadrants**: Render as structured tables detailing the X and Y axes, quadrant names, criteria, and executive implications.
- **Data Charts & Quantitative Graphs**: Reconstruct the underlying data in a table, explicitly define the independent/dependent axes, state exact percentages/metrics, and explain the analytical takeaway.
- **Cycles & Flywheels**: Render as circular/cyclical process diagrams.
- **Complex Diagrams**: If an infographic cannot be rendered solely as code, provide an exhaustive structured description of its visual anatomy, components, and relationships.

### 3. Prohibited Patterns
- **NO Slide-Speak**: Never say "On this slide...", "Slide 4 shows...", "As shown here...", or regurgitate fragmented bullets. Write in full, coherent, analytical prose.
- **NO Dialogue or Roleplay**: Do not write conversational classroom chatter ("Good morning everyone", "Can you hear me?"). Write an authoritative reference handbook.
- **NO Superficial Summarization**: Explain all underlying variables, mechanics, trade-offs, and failure points.

### 4. Rigorous Theoretical & Diagnostic Depth
- **Mathematical Formulations**: State all formulas clearly with variables defined.
- **Complete Diagnostic Worksheets**: If the materials contain an exercise, diagnostic tool, or self-assessment (e.g. Life Journey Map, Wheel of Life, Service Blueprint), provide the complete, step-by-step instructions, scoring rubrics, and prompts so an executive can fully execute it.
- **Classroom Cold-Call & Debate Strategy**: Include multi-perspective debate analyses and preparation for in-class recitation.
- **Language**: Author entirely in canonical, high-level Academic English.

---

## Standard Chapter Structure

1. **Chapter Title & Executive Dilemma**:
   - The urgent boardroom hook, planning paradox, and strategic stakes.
2. **Core Theoretical Foundations & Mechanical Walkthrough**:
   - Detailed section-by-section breakdown of every topic and slide model.
   - All reconstructed diagrams, mathematical formulas, and 2x2 matrices.
3. **Managerial Crucibles & Organizational Friction**:
   - Real-world friction points, implementation barriers, and executive failure modes.
4. **Diagnostic Worksheets & Toolkits**:
   - Full step-by-step self-assessments, diagnostic prompts, and scoring guides.
5. **Executive Case Studies**:
   - In-depth examination of all corporate case examples and organizational crucibles.
6. **Classroom Cold-Call & Strategic Reflection**:
   - Key discussion questions, contrarian perspectives, and strategic takeaways.
```

---

## 🚀 Execution Checklist for the User

1. **Step 1**: Open your external LLM (**Gemini Advanced Web** or **ChatGPT Prism**).
2. **Step 2**: Upload your raw week slides and video transcript.
3. **Step 3**: Paste the **Unified Slide-to-Handbook Master Prompt** above.
4. **Step 4**: Save the generated text as:
   - `raw/courses/mkX/week-YY/handbook-draft.md` (if using Gemini Web), OR
   - `raw/courses/mkX/week-YY/handbook-draft.tex` (if using ChatGPT Prism).
5. **Step 5**: Tell Antigravity:
   > *"I've dropped the handbook draft for MK[X] Week [YY] into raw/. Please ingest and compile it."*
6. **Step 6**: Antigravity directly ingests the draft into Quartz Markdown, extracts atomic concepts, updates living entities, generates reading satellites, and verifies the Quartz static build.
