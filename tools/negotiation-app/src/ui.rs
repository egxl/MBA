use std::io::{self, Write};
use colored::*;

use crate::model::{Answer, AssessmentState, NegotiationStyle, ProfileScores, Question};

pub fn print_banner() {
    println!("{}", "================================================================================".cyan());
    println!("{}", "         NEGOTIATION STYLES ANALYSIS - INTERACTIVE ASSESSMENT".bold().cyan());
    println!("{}", "              Thomas-Kilmann Conflict Mode Instrument (TKI)".cyan());
    println!("{}", "================================================================================".cyan());
    println!();
    println!("{}", "INSTRUCTIONS:".bold().yellow());
    println!("  Listed are 20 pairs of statements regarding negotiation behavior.");
    println!("  For each pair, distribute exactly {} between statements (a) and (b)", "5 points".bold().green());
    println!("  reflecting the extent to which each statement represents your natural behavior.");
    println!("  Examples: {} (strong a), {} (balanced), {} (strong b)", "5/0".bold(), "3/2".bold(), "0/5".bold());
    println!();
    println!("{}", "SHORTCUT COMMANDS at any prompt:".bold().yellow());
    println!("  - Type {} to set (a) to X; (b) is automatically (5 - X)", "a single number 0-5".green());
    println!("  - Type {} or {} to set both explicitly", "3 2".green(), "3/2".green());
    println!("  - Type {} or {} to return to the previous question", "b".yellow(), "prev".yellow());
    println!("  - Type {} or {} to see an overview table of all 20 answers", "r".yellow(), "review".yellow());
    println!("  - Type {} (e.g. j 14) to jump directly to a question", "j <number>".yellow());
    println!("  - Type {} or {} to save/load your progress from disk", "save".yellow(), "load".yellow());
    println!("  - Type {} to view help, or {} to exit", "help".yellow(), "q".red());
    println!("{}", "--------------------------------------------------------------------------------".dimmed());
    println!();
}

pub fn prompt_line(prompt: &str) -> String {
    print!("{}", prompt);
    let _ = io::stdout().flush();
    let mut buffer = String::new();
    let _ = io::stdin().read_line(&mut buffer);
    buffer.trim().to_string()
}

pub fn prompt_user_profile(state: &mut AssessmentState) {
    println!("{}", "[Step 1/2] Student Profile Information".bold().green());
    println!("(Press Enter to skip or keep default)\n");

    let current_name = if state.name.is_empty() { "Havergal Samosir".to_string() } else { state.name.clone() };
    let input_name = prompt_line(&format!("  Full Name [{}] : ", current_name.cyan()));
    if !input_name.is_empty() {
        state.name = input_name;
    } else if state.name.is_empty() {
        state.name = current_name;
    }

    let current_nim = if state.nim.is_empty() { "29124001".to_string() } else { state.nim.clone() };
    let input_nim = prompt_line(&format!("  Student ID / NIM [{}] : ", current_nim.cyan()));
    if !input_nim.is_empty() {
        state.nim = input_nim;
    } else if state.nim.is_empty() {
        state.nim = current_nim;
    }

    println!();
    println!("  Profile set: {} / {}", state.name.bold(), state.nim.bold());
    println!("{}", "--------------------------------------------------------------------------------".dimmed());
    println!();
}

pub fn display_question(q: &Question, current_ans: Option<Answer>, current_idx: usize, total: usize) {
    let pct = (current_idx as f64 / total as f64) * 100.0;
    println!();
    println!(
        "{} {} {} {}",
        format!("Question [{}/{}]", q.id, total).bold().cyan(),
        progress_bar(current_idx, total),
        format!("{:.0}%", pct).dimmed(),
        if let Some(ans) = current_ans {
            format!("(Current: a={}, b={})", ans.a, ans.b).green().to_string()
        } else {
            "(Unanswered)".yellow().to_string()
        }
    );
    println!("{}", "--------------------------------------------------------------------------------".dimmed());
    println!("  {}  {}", "[a]".bold().blue(), q.text_a);
    println!("  {}  {}", "[b]".bold().magenta(), q.text_b);
    println!("{}", "--------------------------------------------------------------------------------".dimmed());
}

fn progress_bar(completed: usize, total: usize) -> String {
    let width = 20;
    let filled = completed * width / total;
    let empty = width.saturating_sub(filled);
    format!("[{}{}]", "█".repeat(filled).cyan(), "░".repeat(empty).dimmed())
}

pub fn display_review_table(state: &AssessmentState) {
    println!();
    println!("{}", "================================================================================".cyan());
    println!("{}", "                          CURRENT ASSESSMENT OVERVIEW                           ".bold().cyan());
    println!("{}", "================================================================================".cyan());
    println!();

    // 2-column layout: 1..10 and 11..20
    println!(" {:<39} | {:<39}", "Questions 1 - 10", "Questions 11 - 20");
    println!(" {} | {}", "-".repeat(39), "-".repeat(39));

    for i in 1..=10 {
        let left_q = i;
        let right_q = i + 10;

        let left_str = format_answer_summary(left_q, state.get_answer(left_q));
        let right_str = format_answer_summary(right_q, state.get_answer(right_q));

        println!(" {:<39} | {:<39}", left_str, right_str);
    }

    println!();
    let completed = state.completed_count();
    println!(
        "  Progress: {} of 20 questions completed. ({} remaining)",
        completed.to_string().bold().green(),
        (20 - completed).to_string().bold().yellow()
    );

    if state.is_complete() {
        if let Ok(scores) = state.calculate_scores() {
            println!();
            display_scores_bar_chart(&scores);
        }
    }
    println!("{}", "================================================================================".cyan());
    println!();
}

fn format_answer_summary(q_id: usize, ans: Option<Answer>) -> String {
    match ans {
        Some(a) => format!("Q{:02}: [a: {}, b: {}] (5 pts)", q_id, a.a.to_string().blue(), a.b.to_string().magenta()),
        None => format!("Q{:02}: [PENDING...]", q_id),
    }
}

pub fn display_scores_bar_chart(scores: &ProfileScores) {
    println!("{}", "--- Real-Time Negotiation Styles Profile ---".bold().yellow());
    let ranked = scores.ranked();
    let dominant = ranked[0].0;

    for (style, score) in &ranked {
        let bar_len = (*score as usize) * 30 / 40;
        let empty_len = 30usize.saturating_sub(bar_len);
        let bar_str = format!("{}{}", "█".repeat(bar_len), "░".repeat(empty_len));

        let colored_bar = match style {
            NegotiationStyle::Collaborating => bar_str.green(),
            NegotiationStyle::Competing => bar_str.red(),
            NegotiationStyle::Compromising => bar_str.yellow(),
            NegotiationStyle::Accommodating => bar_str.blue(),
            NegotiationStyle::Avoiding => bar_str.magenta(),
        };

        let tag = if *style == dominant {
            " <== PRIMARY DOMINANT".bold().green().to_string()
        } else {
            String::new()
        };

        println!(
            "  {:<14} [{:>2}/40] |{}| {:>4.1}%{}",
            style.name().bold(),
            score,
            colored_bar,
            (*score as f64 / 40.0) * 100.0,
            tag
        );
    }
    println!();
}

pub fn display_final_report_terminal(state: &AssessmentState, scores: &ProfileScores) {
    println!();
    println!("{}", "================================================================================".cyan());
    println!("{}", "                    FINAL NEGOTIATION PROFILE ASSESSMENT                        ".bold().green());
    println!("{}", "================================================================================".cyan());
    println!("  Student : {} (NIM: {})", state.name.bold(), state.nim.bold());
    println!();

    display_scores_bar_chart(scores);

    let (dominant, dom_score) = scores.dominant_style();
    let (secondary, sec_score) = scores.secondary_style();
    let (least, least_score) = scores.least_preferred_style();

    println!("{}", "DIAGNOSTIC SUMMARY:".bold().yellow());
    println!("  1. Dominant Style   : {} [{}/40]", dominant.title().bold().green(), dom_score);
    println!("     Focus            : {}", dominant.focus().dimmed());
    println!("     Profile          : {}", dominant.description());
    println!();
    println!("  2. Secondary Style  : {} [{}/40]", secondary.title().bold().cyan(), sec_score);
    println!("     Focus            : {}", secondary.focus().dimmed());
    println!("     Profile          : {}", secondary.description());
    println!();
    println!("  3. Underused Style  : {} [{}/40]", least.title().bold().yellow(), least_score);
    println!("     Note             : This represents your least frequent default mode.");
    println!("{}", "================================================================================".cyan());
    println!();
}
