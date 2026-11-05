use crate::model::{AssessmentState, NegotiationStyle, ProfileScores};

pub fn generate_markdown_report(state: &AssessmentState, scores: &ProfileScores) -> String {
    let ranked = scores.ranked();
    let (dominant, dom_score) = scores.dominant_style();
    let (secondary, sec_score) = scores.secondary_style();
    let (least, least_score) = scores.least_preferred_style();

    let mut out = String::new();
    out.push_str("# Negotiation Styles Analysis Report\n\n");
    out.push_str(&format!("**Student Name:** {}\n", if state.name.is_empty() { "Not specified" } else { &state.name }));
    out.push_str(&format!("**Student ID / NIM:** {}\n\n", if state.nim.is_empty() { "Not specified" } else { &state.nim }));
    out.push_str("Based on the Thomas-Kilmann Conflict Mode Instrument (TKI) adapted for Executive MBA Negotiation & Decision Making.\n\n");

    out.push_str("## Executive Summary of Scores\n\n");
    out.push_str("| Negotiation Style | Score (Max 40) | Share of Total (%) | Behavioral Focus |\n");
    out.push_str("| :--- | :---: | :---: | :--- |\n");

    for (style, score) in &ranked {
        let is_dom = *style == dominant;
        let mark = if is_dom { " **(Primary)**" } else if *style == secondary { " *(Secondary)*" } else { "" };
        out.push_str(&format!(
            "| **{}{}** | **{}** | {:.1}% | {} |\n",
            style.name(),
            mark,
            score,
            (*score as f64 / 100.0) * 100.0,
            style.focus()
        ));
    }
    out.push_str("| **Total Points** | **100** | 100.0% | 20 pairs evaluated |\n\n");

    out.push_str("## Style Distribution Visual Profile\n\n");
    out.push_str("```text\n");
    for (style, score) in &ranked {
        let bar_len = (*score as usize) * 35 / 40;
        let bar: String = "█".repeat(bar_len) + &"░".repeat(35 - bar_len);
        let tag = if *style == dominant {
            " [PRIMARY DOMINANT]"
        } else if *style == secondary {
            " [SECONDARY]"
        } else {
            ""
        };
        out.push_str(&format!("{:<15} [{:>2}/40] |{}| {:>5.1}%{}\n", style.name(), score, bar, (*score as f64 / 40.0) * 100.0, tag));
    }
    out.push_str("```\n\n");

    out.push_str("## Behavioral Matrix (Dual-Concern Framework)\n\n");
    out.push_str("The assessment evaluates your default posture across two fundamental dimensions:\n");
    out.push_str("1. **Assertiveness:** The extent to which you attempt to satisfy your own concerns.\n");
    out.push_str("2. **Cooperativeness:** The extent to which you attempt to satisfy the other party's concerns.\n\n");

    out.push_str("```text\n");
    out.push_str("  ASSERTIVENESS\n");
    out.push_str("   (Focus on My Needs)\n");
    out.push_str("       ▲\n");
    out.push_str("  HIGH │   [COMPETING]                      [COLLABORATING]\n");
    out.push_str("       │   (Score: ");
    out.push_str(&format!("{:>2}", scores.competing));
    out.push_str(")                         (Score: ");
    out.push_str(&format!("{:>2}", scores.collaborating));
    out.push_str(")\n");
    out.push_str("       │\n");
    out.push_str("       │                    [COMPROMISING]\n");
    out.push_str("  MED  │                     (Score: ");
    out.push_str(&format!("{:>2}", scores.compromising));
    out.push_str(")\n");
    out.push_str("       │\n");
    out.push_str("       │   [AVOIDING]                       [ACCOMMODATING]\n");
    out.push_str("  LOW  │   (Score: ");
    out.push_str(&format!("{:>2}", scores.avoiding));
    out.push_str(")                         (Score: ");
    out.push_str(&format!("{:>2}", scores.accommodating));
    out.push_str(")\n");
    out.push_str("       └────────────────────────────────────────────────────────►\n");
    out.push_str("          LOW                           MED                         HIGH\n");
    out.push_str("                                COOPERATIVENESS\n");
    out.push_str("                          (Focus on Other's Needs)\n");
    out.push_str("```\n\n");

    out.push_str("## Diagnostic Interpretation & Strategic Recommendations\n\n");

    out.push_str(&format!("### 1. Primary Dominant Style: {} (Score: {}/40)\n\n", dominant.title(), dom_score));
    out.push_str(&style_detailed_analysis(dominant, true));
    out.push_str("\n\n");

    out.push_str(&format!("### 2. Secondary Supporting Style: {} (Score: {}/40)\n\n", secondary.title(), sec_score));
    out.push_str(&style_detailed_analysis(secondary, false));
    out.push_str("\n\n");

    out.push_str(&format!("### 3. Least Preferred Style: {} (Score: {}/40)\n\n", least.title(), least_score));
    out.push_str(&format!(
        "Your lowest score is in **{}**. This represents a behavioral blind spot or under-utilized mode. {}\n\n",
        least.name(),
        style_underuse_analysis(least)
    ));

    out.push_str("## Detailed Answers per Pair (Questions 1 to 20)\n\n");
    out.push_str("| Q# | Statement (a) | Pts (a) | Statement (b) | Pts (b) |\n");
    out.push_str("| :-: | :--- | :-: | :--- | :-: |\n");
    for q in &crate::model::QUESTIONS {
        if let Some(ans) = state.get_answer(q.id) {
            out.push_str(&format!(
                "| {} | {} | **{}** | {} | **{}** |\n",
                q.id, q.text_a, ans.a, q.text_b, ans.b
            ));
        }
    }
    out.push_str("\n---\n*Report compiled via Standalone Negotiation Styles Analysis Engine (Rust).*\n");

    out
}

fn style_detailed_analysis(style: NegotiationStyle, is_primary: bool) -> String {
    match style {
        NegotiationStyle::Collaborating => {
            let role = if is_primary { "Your primary orientation is integrative value creation." } else { "As a secondary mode, collaboration allows you to explore win-win expansions." };
            format!(
                "{}\n\n\
                * **Core Strengths:** You seek solutions that satisfy all parties fully. You encourage transparent information sharing, trust building, and creative problem solving.\n\
                * **When to Deploy:** Multi-issue negotiations, high-stakes strategic partnerships, joint ventures, and situations where ongoing trust and relationship capital are critical.\n\
                * **Potential Pitfalls:** High transaction costs. It requires substantial time and cognitive effort. Risk of vulnerability if the counterpart is strictly distributive/competitive and withholds reciprocity.",
                role
            )
        }
        NegotiationStyle::Competing => {
            let role = if is_primary { "Your primary orientation is assertive value claiming." } else { "As a secondary mode, you possess strong teeth to defend against predatory tactics." };
            format!(
                "{}\n\n\
                * **Core Strengths:** Decisive, firm, and goal-oriented. You press logical advantages and protect your organization's bottom line against concessions.\n\
                * **When to Deploy:** One-shot transactions, zero-sum distributive bargaining, defending against unprincipled exploitation, urgent emergencies requiring decisive command.\n\
                * **Potential Pitfalls:** Can damage relationships, trigger retaliation or deadlock, and obscure integrative trade-offs by turning negotiations into personal battlefields.",
                role
            )
        }
        NegotiationStyle::Compromising => {
            let role = if is_primary { "Your primary orientation is pragmatic settlement." } else { "As a secondary mode, compromising gives you a practical fallback to close deals." };
            format!(
                "{}\n\n\
                * **Core Strengths:** Highly practical, efficient, and fair-minded. You avoid deadlocks by splitting differences and exchanging reciprocal concessions.\n\
                * **When to Deploy:** When time is constrained, when parties hold equal power and have mutually exclusive goals, or as a temporary bridge to maintain momentum.\n\
                * **Potential Pitfalls:** Can settle too early without expanding the pie. 'Splitting the difference' often produces sub-optimal compromises that leave substantial value on the table.",
                role
            )
        }
        NegotiationStyle::Accommodating => {
            let role = if is_primary { "Your primary orientation is relationship preservation and goodwill." } else { "As a secondary mode, accommodation fosters goodwill and builds social capital." };
            format!(
                "{}\n\n\
                * **Core Strengths:** Empathetic, supportive, and relationship-centric. You defuse hostile situations and invest in long-term partner loyalty.\n\
                * **When to Deploy:** When the relationship is vastly more valuable than the issue at hand, when you are in a weak bargaining position, or to correct a prior mistake.\n\
                * **Potential Pitfalls:** Susceptible to exploitation by aggressive competitors. You risk chronically giving away economic value without securing reciprocal commitments.",
                role
            )
        }
        NegotiationStyle::Avoiding => {
            let role = if is_primary { "Your primary orientation is diplomatic detachment and tension reduction." } else { "As a secondary mode, avoidance allows you to avoid unnecessary friction." };
            format!(
                "{}\n\n\
                * **Core Strengths:** Patient, low-drama, and selective. You refuse to get dragged into petty conflicts and know when issues are better postponed.\n\
                * **When to Deploy:** Low-stakes/trivial matters, cooling off inflamed emotions, buying time to gather market intelligence, or when other channels can resolve the issue better.\n\
                * **Potential Pitfalls:** Chronic procrastination can allow small issues to metastasize into major crises. Others may perceive you as indecisive, evasive, or indifferent.",
                role
            )
        }
    }
}

fn style_underuse_analysis(style: NegotiationStyle) -> &'static str {
    match style {
        NegotiationStyle::Competing => "You may find it difficult to stand your ground against domineering counterparts, potentially making premature concessions without extracting equivalent returns.",
        NegotiationStyle::Accommodating => "You may struggle to concede minor points to preserve strategic relationships, occasionally escalating trivial battles into relational standoffs.",
        NegotiationStyle::Collaborating => "You may miss opportunities to expand the pie through complementary interests, defaulting to distributive zero-sum bargaining or rapid compromise.",
        NegotiationStyle::Avoiding => "You may jump into every disagreement even when postponing or letting the matter resolve itself would yield superior strategic outcomes.",
        NegotiationStyle::Compromising => "You may resist practical midpoint settlements when perfectionism or stubborn adherence to principle creates prolonged deadlocks.",
    }
}
