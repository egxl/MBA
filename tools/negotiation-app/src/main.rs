mod docx;
mod model;
mod report;
mod ui;

use std::env;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use colored::*;

use model::{AssessmentState, QUESTIONS};
use report::generate_markdown_report;
use ui::*;

fn print_help() {
    println!("{}", "NEGOTIATION STYLES ANALYSIS - STANDALONE DOCX FILLER".bold().cyan());
    println!("Usage:");
    println!("  negotiation-app [OPTIONS]");
    println!();
    println!("Options:");
    println!("  -n, --name <NAME>            Set student full name");
    println!("      --nim <NIM>              Set student ID / NIM");
    println!("  -i, --input <DOCX>           Custom template DOCX file path (default: embedded template)");
    println!("  -o, --output <DOCX>          Target output DOCX file path (default: Negotiation_Styles_Analysis_Filled.docx)");
    println!("  -p, --preset <PRESET>        Load preset answers: collaborative | competitive | compromising | accommodating | avoiding | balanced");
    println!("      --draft <JSON>           Load state from an existing JSON draft");
    println!("      --non-interactive        Run without interactive terminal prompts (requires complete preset or draft)");
    println!("  -h, --help                   Print this help menu");
    println!();
    println!("Examples:");
    println!("  negotiation-app");
    println!("  negotiation-app --name \"Havergal Samosir\" --nim \"29124001\"");
    println!("  negotiation-app --preset collaborative --non-interactive -o \"Collaborative_Analysis.docx\"");
}

struct CliArgs {
    name: Option<String>,
    nim: Option<String>,
    input: Option<PathBuf>,
    output: PathBuf,
    preset: Option<String>,
    draft: Option<PathBuf>,
    non_interactive: bool,
}

fn parse_cli_args() -> Result<CliArgs, String> {
    let args: Vec<String> = env::args().collect();
    let mut name = None;
    let mut nim = None;
    let mut input = None;
    let mut output = PathBuf::from("Negotiation_Styles_Analysis_Filled.docx");
    let mut preset = None;
    let mut draft = None;
    let mut non_interactive = false;

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "-h" | "--help" => {
                print_help();
                std::process::exit(0);
            }
            "-n" | "--name" => {
                i += 1;
                if i >= args.len() { return Err("--name requires a value".into()); }
                name = Some(args[i].clone());
            }
            "--nim" => {
                i += 1;
                if i >= args.len() { return Err("--nim requires a value".into()); }
                nim = Some(args[i].clone());
            }
            "-i" | "--input" => {
                i += 1;
                if i >= args.len() { return Err("--input requires a file path".into()); }
                input = Some(PathBuf::from(&args[i]));
            }
            "-o" | "--output" => {
                i += 1;
                if i >= args.len() { return Err("--output requires a file path".into()); }
                output = PathBuf::from(&args[i]);
            }
            "-p" | "--preset" => {
                i += 1;
                if i >= args.len() { return Err("--preset requires a preset name".into()); }
                preset = Some(args[i].clone());
            }
            "--draft" => {
                i += 1;
                if i >= args.len() { return Err("--draft requires a file path".into()); }
                draft = Some(PathBuf::from(&args[i]));
            }
            "--non-interactive" => {
                non_interactive = true;
            }
            other => {
                return Err(format!("Unknown option '{}'. Use --help for usage.", other));
            }
        }
        i += 1;
    }

    Ok(CliArgs {
        name,
        nim,
        input,
        output,
        preset,
        draft,
        non_interactive,
    })
}

fn main() {
    let args = match parse_cli_args() {
        Ok(a) => a,
        Err(e) => {
            eprintln!("{} {}", "Error:".bold().red(), e);
            std::process::exit(1);
        }
    };

    let mut state = AssessmentState::new();

    // 1. Load draft if specified
    if let Some(draft_path) = &args.draft {
        match fs::read_to_string(draft_path) {
            Ok(json_str) => match serde_json::from_str::<AssessmentState>(&json_str) {
                Ok(loaded) => {
                    println!("{} Loaded draft from '{:?}'", "✔".green(), draft_path);
                    state = loaded;
                }
                Err(e) => {
                    eprintln!("{} Failed to parse draft JSON: {}", "Error:".red(), e);
                    std::process::exit(1);
                }
            },
            Err(e) => {
                eprintln!("{} Failed to read draft file: {}", "Error:".red(), e);
                std::process::exit(1);
            }
        }
    }

    // 2. Apply name/nim overrides
    if let Some(n) = args.name {
        state.name = n;
    }
    if let Some(n) = args.nim {
        state.nim = n;
    }

    // 3. Apply preset if requested
    if let Some(p) = &args.preset {
        if state.apply_preset(p) {
            println!("{} Applied preset '{}'", "✔".green(), p);
        } else {
            eprintln!("{} Unknown preset '{}'. Available: collaborative, competitive, compromising, accommodating, avoiding, balanced", "Error:".red(), p);
            std::process::exit(1);
        }
    }

    // 4. Non-interactive path
    if args.non_interactive {
        if !state.is_complete() {
            eprintln!("{} Cannot run --non-interactive when assessment is incomplete ({} of 20 questions answered). Use --preset.", "Error:".red(), state.completed_count());
            std::process::exit(1);
        }
        execute_generation(&state, args.input.as_deref(), &args.output, false);
        return;
    }

    // 5. Interactive UI flow
    print_banner();

    if state.name.is_empty() || state.nim.is_empty() {
        prompt_user_profile(&mut state);
    } else {
        println!("  Active Profile: {} / {}", state.name.bold(), state.nim.bold());
        println!("{}", "--------------------------------------------------------------------------------".dimmed());
    }

    let mut current_q: usize = 1;
    let mut in_review = false;

    loop {
        if !in_review && current_q <= 20 {
            let q = &QUESTIONS[current_q - 1];
            let current_ans = state.get_answer(current_q);

            display_question(q, current_ans, current_q, 20);

            let default_hint = if let Some(ans) = current_ans {
                format!(" [Enter keeps {}/{}]", ans.a, ans.b)
            } else {
                "".to_string()
            };

            let input = prompt_line(&format!("  Your points for (a) [0-5]{} > ", default_hint.cyan()));

            if input.is_empty() {
                if current_ans.is_some() {
                    current_q += 1;
                    if current_q > 20 {
                        in_review = true;
                    }
                    continue;
                } else {
                    println!("  {}", "Please enter a score (0 to 5) or command. Type 'help' for options.".yellow());
                    continue;
                }
            }

            let trimmed = input.trim();
            let lower = trimmed.to_lowercase();

            // Command handling
            if lower == "b" || lower == "prev" || lower == "back" {
                if current_q > 1 {
                    current_q -= 1;
                } else {
                    println!("  {}", "Already at Question 1.".yellow());
                }
                continue;
            }

            if lower == "r" || lower == "review" || lower == "overview" {
                display_review_table(&state);
                continue;
            }

            if lower == "stats" || lower == "scores" {
                if let Ok(scores) = state.calculate_scores() {
                    display_scores_bar_chart(&scores);
                } else {
                    println!("  {}", "Answer all 20 questions to unlock the full score calculation.".yellow());
                }
                continue;
            }

            if lower.starts_with("j ") || lower.starts_with("jump ") {
                let parts: Vec<&str> = trimmed.split_whitespace().collect();
                if parts.len() >= 2 {
                    if let Ok(target) = parts[1].parse::<usize>() {
                        if (1..=20).contains(&target) {
                            current_q = target;
                            continue;
                        }
                    }
                }
                println!("  {}", "Invalid question number. Use 'j 1' to 'j 20'.".red());
                continue;
            }

            if lower.starts_with("preset ") || lower.starts_with("p ") {
                let parts: Vec<&str> = trimmed.split_whitespace().collect();
                if parts.len() >= 2 {
                    if state.apply_preset(parts[1]) {
                        println!("  {} Applied preset '{}'", "✔".green(), parts[1]);
                        display_review_table(&state);
                        in_review = true;
                        continue;
                    }
                }
                println!("  {}", "Invalid preset. Options: collaborative, competitive, compromising, accommodating, avoiding, balanced".red());
                continue;
            }

            if lower == "save" || lower.starts_with("save ") {
                let path = if lower.starts_with("save ") {
                    trimmed[5..].trim()
                } else {
                    "negotiation_draft.json"
                };
                match serde_json::to_string_pretty(&state) {
                    Ok(s) => match fs::write(path, s) {
                        Ok(_) => println!("  {} Draft saved to '{}'", "✔".green(), path),
                        Err(e) => println!("  {} Failed saving draft: {}", "Error:".red(), e),
                    },
                    Err(e) => println!("  {} Serialization error: {}", "Error:".red(), e),
                }
                continue;
            }

            if lower == "load" || lower.starts_with("load ") {
                let path = if lower.starts_with("load ") {
                    trimmed[5..].trim()
                } else {
                    "negotiation_draft.json"
                };
                match fs::read_to_string(path) {
                    Ok(s) => match serde_json::from_str::<AssessmentState>(&s) {
                        Ok(loaded) => {
                            state = loaded;
                            println!("  {} Draft loaded from '{}'", "✔".green(), path);
                            display_review_table(&state);
                        }
                        Err(e) => println!("  {} Invalid draft JSON: {}", "Error:".red(), e),
                    },
                    Err(e) => println!("  {} Failed reading draft: {}", "Error:".red(), e),
                }
                continue;
            }

            if lower == "help" || lower == "?" {
                print_banner();
                continue;
            }

            if lower == "q" || lower == "quit" || lower == "exit" {
                let confirm = prompt_line("  Are you sure you want to exit? Unsaved progress will be lost. [y/N]: ");
                if confirm.eq_ignore_ascii_case("y") {
                    println!("  Goodbye!");
                    std::process::exit(0);
                }
                continue;
            }

            // Parse score entry
            let parsed = parse_score_entry(trimmed);
            match parsed {
                Ok((a, b)) => {
                    if let Err(e) = state.set_answer(current_q, a, b) {
                        println!("  {} {}", "Error:".red(), e);
                    } else {
                        println!(
                            "  {} Saved Q{:02}: [a] = {} pts, [b] = {} pts (Sum: 5/5)",
                            "✔".green(),
                            current_q,
                            a.to_string().blue().bold(),
                            b.to_string().magenta().bold()
                        );
                        current_q += 1;
                        if current_q > 20 {
                            in_review = true;
                        }
                    }
                }
                Err(err_msg) => {
                    println!("  {} {}", "Invalid input:".red(), err_msg);
                }
            }
        } else {
            // Review mode
            display_review_table(&state);

            if !state.is_complete() {
                let next_unanswered = (1..=20).find(|&i| state.get_answer(i).is_none()).unwrap_or(1);
                println!("  {}", "There are still unanswered questions.".yellow());
                let ans = prompt_line(&format!("  Resume answering at Question {}? [Y/n]: ", next_unanswered));
                if !ans.eq_ignore_ascii_case("n") {
                    current_q = next_unanswered;
                    in_review = false;
                    continue;
                }
            }

            let scores = match state.calculate_scores() {
                Ok(s) => s,
                Err(e) => {
                    println!("  {} {}", "Cannot generate:".red(), e);
                    let fix = prompt_line("  Jump to a question to fix? (e.g. 1-20): ");
                    if let Ok(num) = fix.trim().parse::<usize>() {
                        if (1..=20).contains(&num) {
                            current_q = num;
                            in_review = false;
                            continue;
                        }
                    }
                    continue;
                }
            };

            display_final_report_terminal(&state, &scores);

            println!("  Target output DOCX: {}", args.output.display().to_string().bold().green());
            let confirm = prompt_line("  Generate DOCX document and analysis reports now? [Y/edit <q>/q]: ");
            let trimmed_confirm = confirm.trim();

            if trimmed_confirm.eq_ignore_ascii_case("q") {
                println!("  Canceled.");
                return;
            }

            if trimmed_confirm.to_lowercase().starts_with("edit ") {
                let part = trimmed_confirm[5..].trim();
                if let Ok(num) = part.parse::<usize>() {
                    if (1..=20).contains(&num) {
                        current_q = num;
                        in_review = false;
                        continue;
                    }
                }
            }

            if trimmed_confirm.is_empty() || trimmed_confirm.eq_ignore_ascii_case("y") || trimmed_confirm.eq_ignore_ascii_case("yes") {
                execute_generation(&state, args.input.as_deref(), &args.output, true);
                break;
            }
        }
    }
}

fn parse_score_entry(input: &str) -> Result<(u32, u32), String> {
    // 1. Single integer: e.g. "3" -> a=3, b=2
    if let Ok(single) = input.parse::<u32>() {
        if single <= 5 {
            return Ok((single, 5 - single));
        } else {
            return Err("Single score must be between 0 and 5.".to_string());
        }
    }

    // 2. Delimited by space, slash, comma, or dash: e.g. "3 2", "3/2", "3,2", "3-2"
    let cleaned: String = input.chars().map(|c| if c == '/' || c == ',' || c == '-' { ' ' } else { c }).collect();
    let parts: Vec<&str> = cleaned.split_whitespace().collect();
    if parts.len() == 2 {
        let a = parts[0].parse::<u32>().map_err(|_| "Invalid number for statement (a)")?;
        let b = parts[1].parse::<u32>().map_err(|_| "Invalid number for statement (b)")?;
        if a > 5 || b > 5 {
            return Err("Scores must be between 0 and 5.".to_string());
        }
        if a + b != 5 {
            return Err(format!("Sum of scores is {} + {} = {}. It must equal exactly 5.", a, b, a + b));
        }
        return Ok((a, b));
    }

    Err("Could not understand score. Enter a single number (e.g. 3) or a pair (e.g. 3 2 or 3/2).".to_string())
}

fn execute_generation(
    state: &AssessmentState,
    template_path: Option<&Path>,
    output_docx: &Path,
    prompt_open: bool,
) {
    println!();
    println!("{}", "================================================================================".cyan());
    println!("{}", "                        GENERATING DOCUMENT & REPORTS                           ".bold().green());
    println!("{}", "================================================================================".cyan());

    let scores = match state.calculate_scores() {
        Ok(s) => s,
        Err(e) => {
            eprintln!("{} Failed calculating scores: {}", "Error:".red(), e);
            return;
        }
    };

    // 1. Generate DOCX
    print!("  [1/3] Populating and writing DOCX: {} ... ", output_docx.display());
    let _ = std::io::stdout().flush();
    match docx::fill_docx(template_path, output_docx, state, &scores) {
        Ok(_) => {
            let meta = fs::metadata(output_docx).ok();
            let size_kb = meta.map(|m| m.len() / 1024).unwrap_or(0);
            println!("{} ({} KB)", "DONE".bold().green(), size_kb);
        }
        Err(e) => {
            println!("{}", "FAILED".bold().red());
            eprintln!("  {} {}", "Docx Generation Error:".red(), e);
            return;
        }
    }

    // 2. Generate Markdown Report
    let md_filename = output_docx.with_extension("md");
    print!("  [2/3] Generating Markdown Analysis: {} ... ", md_filename.display());
    let _ = std::io::stdout().flush();
    let md_content = generate_markdown_report(state, &scores);
    match fs::write(&md_filename, &md_content) {
        Ok(_) => println!("{}", "DONE".bold().green()),
        Err(e) => println!("{} ({})", "WARN".yellow(), e),
    }

    // 3. Generate JSON Data
    let json_filename = output_docx.with_extension("json");
    print!("  [3/3] Exporting Raw Assessment Data: {} ... ", json_filename.display());
    let _ = std::io::stdout().flush();
    let export_payload = serde_json::json!({
        "student": {
            "name": state.name,
            "nim": state.nim
        },
        "scores": scores,
        "answers": state.answers.iter().enumerate().map(|(i, ans)| {
            let a = ans.unwrap_or(model::Answer { a: 0, b: 0 });
            serde_json::json!({
                "question": i + 1,
                "score_a": a.a,
                "score_b": a.b
            })
        }).collect::<Vec<_>>()
    });
    match serde_json::to_string_pretty(&export_payload) {
        Ok(s) => match fs::write(&json_filename, s) {
            Ok(_) => println!("{}", "DONE".bold().green()),
            Err(e) => println!("{} ({})", "WARN".yellow(), e),
        },
        Err(e) => println!("{} ({})", "WARN".yellow(), e),
    }

    println!();
    println!("{}", "SUCCESS! All files generated successfully:".bold().green());
    println!("  - Formatted DOCX : {}", output_docx.display().to_string().bold());
    println!("  - Executive Report: {}", md_filename.display().to_string().bold());
    println!("  - Raw JSON Data  : {}", json_filename.display().to_string().bold());
    println!("{}", "================================================================================".cyan());
    println!();

    if prompt_open && cfg!(target_os = "windows") {
        let open_prompt = prompt_line("  Would you like to open the generated Word document now? [Y/n]: ");
        if open_prompt.is_empty() || open_prompt.eq_ignore_ascii_case("y") || open_prompt.eq_ignore_ascii_case("yes") {
            let output_str = output_docx.to_string_lossy().to_string();
            let _ = std::process::Command::new("cmd")
                .args(["/c", "start", "", &output_str])
                .spawn();
        }
    }
}
