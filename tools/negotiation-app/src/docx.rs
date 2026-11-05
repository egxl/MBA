use std::fs;
use std::io::{Cursor, Read, Write};
use std::path::Path;
use xmltree::{Element, XMLNode};
use zip::read::ZipArchive;
use zip::write::{SimpleFileOptions, ZipWriter};

use crate::model::{AssessmentState, ProfileScores, QUESTIONS, SCORE_KEY_ITEMS};

pub const EMBEDDED_TEMPLATE: &[u8] = include_bytes!("../assets/template.docx");

fn make_score_paragraph(score: u32, is_total: bool) -> Element {
    let mut p = Element::new("p");
    p.prefix = Some("w".to_string());

    let mut p_pr = Element::new("pPr");
    p_pr.prefix = Some("w".to_string());
    let mut jc = Element::new("jc");
    jc.prefix = Some("w".to_string());
    jc.attributes.insert("w:val".to_string(), "center".to_string());
    p_pr.children.push(XMLNode::Element(jc));
    p.children.push(XMLNode::Element(p_pr));

    let mut r = Element::new("r");
    r.prefix = Some("w".to_string());

    let mut r_pr = Element::new("rPr");
    r_pr.prefix = Some("w".to_string());

    let mut b = Element::new("b");
    b.prefix = Some("w".to_string());
    r_pr.children.push(XMLNode::Element(b));

    let mut sz = Element::new("sz");
    sz.prefix = Some("w".to_string());
    sz.attributes.insert(
        "w:val".to_string(),
        if is_total { "24".to_string() } else { "22".to_string() },
    );
    r_pr.children.push(XMLNode::Element(sz));

    let mut color = Element::new("color");
    color.prefix = Some("w".to_string());
    color.attributes.insert(
        "w:val".to_string(),
        if is_total { "C00000".to_string() } else { "1F497D".to_string() },
    );
    r_pr.children.push(XMLNode::Element(color));

    r.children.push(XMLNode::Element(r_pr));

    let mut t = Element::new("t");
    t.prefix = Some("w".to_string());
    t.children.push(XMLNode::Text(score.to_string()));
    r.children.push(XMLNode::Element(t));

    p.children.push(XMLNode::Element(r));
    p
}

fn set_cell_paragraph(tc: &mut Element, p_elem: Element) {
    let tc_pr = tc.children.iter().find_map(|n| {
        if let Some(e) = n.as_element() {
            if e.name == "tcPr" {
                return Some(e.clone());
            }
        }
        None
    });

    tc.children.clear();
    if let Some(pr) = tc_pr {
        tc.children.push(XMLNode::Element(pr));
    }
    tc.children.push(XMLNode::Element(p_elem));
}

pub fn fill_docx(
    template_path: Option<&Path>,
    output_path: &Path,
    state: &AssessmentState,
    scores: &ProfileScores,
) -> Result<(), String> {
    let template_bytes = match template_path {
        Some(path) => fs::read(path).map_err(|e| format!("Failed to read template file '{:?}': {}", path, e))?,
        None => EMBEDDED_TEMPLATE.to_vec(),
    };

    let reader = Cursor::new(&template_bytes);
    let mut zip_in = ZipArchive::new(reader)
        .map_err(|e| format!("Invalid docx archive: {}", e))?;

    let mut out_buffer = Cursor::new(Vec::new());
    let mut zip_out = ZipWriter::new(&mut out_buffer);

    for i in 0..zip_in.len() {
        let mut file = zip_in.by_index(i)
            .map_err(|e| format!("Failed reading docx entry: {}", e))?;
        let name = file.name().to_string();
        let options = SimpleFileOptions::default()
            .compression_method(file.compression());

        let mut contents = Vec::new();
        file.read_to_end(&mut contents)
            .map_err(|e| format!("Failed reading docx file contents: {}", e))?;

        if name == "word/document.xml" {
            let mut root = Element::parse(contents.as_slice())
                .map_err(|e| format!("Failed parsing document.xml: {}", e))?;

            let body = root.children.iter_mut().find_map(|n| {
                let e = n.as_mut_element()?;
                if e.name == "body" { Some(e) } else { None }
            }).ok_or("Failed to locate <w:body> in document.xml")?;

            // 1. Update Name/NIM in paragraph
            let display_name_nim = if state.name.is_empty() && state.nim.is_empty() {
                "__________________________".to_string()
            } else if state.nim.is_empty() {
                state.name.clone()
            } else if state.name.is_empty() {
                state.nim.clone()
            } else {
                format!("{} / {}", state.name, state.nim)
            };

            for node in body.children.iter_mut() {
                if let Some(p) = node.as_mut_element() {
                    if p.name == "p" {
                        let text = p.children.iter().filter_map(|n| {
                            n.as_element().map(|r| {
                                r.children.iter().filter_map(|c| {
                                    if let Some(t) = c.as_element() {
                                        if t.name == "t" {
                                            return t.children.iter().find_map(|tn| {
                                                if let XMLNode::Text(s) = tn { Some(s.clone()) } else { None }
                                            });
                                        }
                                    }
                                    None
                                }).collect::<Vec<_>>().join("")
                            })
                        }).collect::<Vec<_>>().join("");

                        if text.contains("Name/NIM:") {
                            p.children.clear();

                            let mut p_pr = Element::new("pPr");
                            p_pr.prefix = Some("w".to_string());
                            let mut style = Element::new("pStyle");
                            style.prefix = Some("w".to_string());
                            style.attributes.insert("w:val".to_string(), "Subtitle".to_string());
                            p_pr.children.push(XMLNode::Element(style));
                            p.children.push(XMLNode::Element(p_pr));

                            let mut r1 = Element::new("r");
                            r1.prefix = Some("w".to_string());
                            let mut t1 = Element::new("t");
                            t1.prefix = Some("w".to_string());
                            t1.attributes.insert("xml:space".to_string(), "preserve".to_string());
                            t1.children.push(XMLNode::Text("Name/NIM: ".to_string()));
                            r1.children.push(XMLNode::Element(t1));
                            p.children.push(XMLNode::Element(r1));

                            let mut r2 = Element::new("r");
                            r2.prefix = Some("w".to_string());
                            let mut r2_pr = Element::new("rPr");
                            r2_pr.prefix = Some("w".to_string());

                            let mut b = Element::new("b");
                            b.prefix = Some("w".to_string());
                            r2_pr.children.push(XMLNode::Element(b));

                            let mut u = Element::new("u");
                            u.prefix = Some("w".to_string());
                            u.attributes.insert("w:val".to_string(), "single".to_string());
                            r2_pr.children.push(XMLNode::Element(u));

                            let mut color = Element::new("color");
                            color.prefix = Some("w".to_string());
                            color.attributes.insert("w:val".to_string(), "1F497D".to_string());
                            r2_pr.children.push(XMLNode::Element(color));

                            r2.children.push(XMLNode::Element(r2_pr));

                            let mut t2 = Element::new("t");
                            t2.prefix = Some("w".to_string());
                            t2.children.push(XMLNode::Text(display_name_nim.clone()));
                            r2.children.push(XMLNode::Element(t2));
                            p.children.push(XMLNode::Element(r2));
                            break;
                        }
                    }
                }
            }

            // 2. Identify tables
            let mut tbls: Vec<&mut Element> = body.children.iter_mut().filter_map(|n| {
                let e = n.as_mut_element()?;
                if e.name == "tbl" { Some(e) } else { None }
            }).collect();

            if tbls.len() < 2 {
                return Err(format!("Expected 2 tables in docx template, found {}", tbls.len()));
            }

            // Fill Table 0 (Questions 1 to 20)
            {
                let mut rows: Vec<&mut Element> = tbls[0].children.iter_mut().filter_map(|n| {
                    let e = n.as_mut_element()?;
                    if e.name == "tr" { Some(e) } else { None }
                }).collect();

                for q in &QUESTIONS {
                    if let Some(ans) = state.get_answer(q.id) {
                        if q.row_a < rows.len() {
                            let mut cells_a: Vec<&mut Element> = rows[q.row_a].children.iter_mut().filter_map(|n| {
                                let e = n.as_mut_element()?;
                                if e.name == "tc" { Some(e) } else { None }
                            }).collect();
                            if cells_a.len() > 1 {
                                set_cell_paragraph(cells_a[1], make_score_paragraph(ans.a, false));
                            }
                        }

                        if q.row_b < rows.len() {
                            let mut cells_b: Vec<&mut Element> = rows[q.row_b].children.iter_mut().filter_map(|n| {
                                let e = n.as_mut_element()?;
                                if e.name == "tc" { Some(e) } else { None }
                            }).collect();
                            if cells_b.len() > 1 {
                                set_cell_paragraph(cells_b[1], make_score_paragraph(ans.b, false));
                            }
                        }
                    }
                }
            }

            // Fill Table 1 (Scoring key and column totals)
            {
                let mut rows: Vec<&mut Element> = tbls[1].children.iter_mut().filter_map(|n| {
                    let e = n.as_mut_element()?;
                    if e.name == "tr" { Some(e) } else { None }
                }).collect();

                // Fill the 40 individual score cells
                for item in &SCORE_KEY_ITEMS {
                    if let Some(score) = state.get_item_score(item.item) {
                        if item.row < rows.len() {
                            let mut cells: Vec<&mut Element> = rows[item.row].children.iter_mut().filter_map(|n| {
                                let e = n.as_mut_element()?;
                                if e.name == "tc" { Some(e) } else { None }
                            }).collect();
                            if item.score_col < cells.len() {
                                set_cell_paragraph(cells[item.score_col], make_score_paragraph(score, false));
                            }
                        }
                    }
                }

                // Fill Row 8 with column totals
                // Competing: col 0
                // Accommodating: col 3
                // Collaborating: col 6
                // Avoiding: col 9
                // Compromising: col 12
                if rows.len() > 8 {
                    let mut cells_r8: Vec<&mut Element> = rows[8].children.iter_mut().filter_map(|n| {
                        let e = n.as_mut_element()?;
                        if e.name == "tc" { Some(e) } else { None }
                    }).collect();

                    if cells_r8.len() > 12 {
                        set_cell_paragraph(cells_r8[0], make_score_paragraph(scores.competing, true));
                        set_cell_paragraph(cells_r8[3], make_score_paragraph(scores.accommodating, true));
                        set_cell_paragraph(cells_r8[6], make_score_paragraph(scores.collaborating, true));
                        set_cell_paragraph(cells_r8[9], make_score_paragraph(scores.avoiding, true));
                        set_cell_paragraph(cells_r8[12], make_score_paragraph(scores.compromising, true));
                    }
                }
            }

            let mut modified_xml = Vec::new();
            root.write(&mut modified_xml)
                .map_err(|e| format!("Failed serializing document.xml: {}", e))?;

            zip_out.start_file(&name, options)
                .map_err(|e| format!("Failed writing document.xml entry: {}", e))?;
            zip_out.write_all(&modified_xml)
                .map_err(|e| format!("Failed writing document.xml content: {}", e))?;
        } else {
            zip_out.start_file(&name, options)
                .map_err(|e| format!("Failed writing zip entry '{}': {}", name, e))?;
            zip_out.write_all(&contents)
                .map_err(|e| format!("Failed writing content for '{}': {}", name, e))?;
        }
    }

    zip_out.finish()
        .map_err(|e| format!("Failed finalizing zip archive: {}", e))?;

    let final_bytes = out_buffer.into_inner();

    if let Some(parent) = output_path.parent() {
        if !parent.as_os_str().is_empty() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed creating directory '{:?}': {}", parent, e))?;
        }
    }

    fs::write(output_path, &final_bytes)
        .map_err(|e| format!("Failed writing output docx to '{:?}': {}", output_path, e))?;

    Ok(())
}
