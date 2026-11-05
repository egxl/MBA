use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum NegotiationStyle {
    Competing,
    Accommodating,
    Collaborating,
    Avoiding,
    Compromising,
}

impl NegotiationStyle {
    pub fn all() -> [NegotiationStyle; 5] {
        [
            NegotiationStyle::Competing,
            NegotiationStyle::Accommodating,
            NegotiationStyle::Collaborating,
            NegotiationStyle::Avoiding,
            NegotiationStyle::Compromising,
        ]
    }

    pub fn name(&self) -> &'static str {
        match self {
            NegotiationStyle::Competing => "Competing",
            NegotiationStyle::Accommodating => "Accommodating",
            NegotiationStyle::Collaborating => "Collaborating",
            NegotiationStyle::Avoiding => "Avoiding",
            NegotiationStyle::Compromising => "Compromising",
        }
    }

    pub fn title(&self) -> &'static str {
        match self {
            NegotiationStyle::Competing => "Competing (I Win, You Lose)",
            NegotiationStyle::Accommodating => "Accommodating (I Lose, You Win)",
            NegotiationStyle::Collaborating => "Collaborating (I Win, You Win)",
            NegotiationStyle::Avoiding => "Avoiding (No Winners, No Losers)",
            NegotiationStyle::Compromising => "Compromising (We Both Win and Lose Something)",
        }
    }

    pub fn focus(&self) -> &'static str {
        match self {
            NegotiationStyle::Competing => "High Assertiveness, Low Cooperativeness (Value Claiming)",
            NegotiationStyle::Accommodating => "Low Assertiveness, High Cooperativeness (Relationship Preservation)",
            NegotiationStyle::Collaborating => "High Assertiveness, High Cooperativeness (Value Creation / Integrative)",
            NegotiationStyle::Avoiding => "Low Assertiveness, Low Cooperativeness (Conflict Sidestepping)",
            NegotiationStyle::Compromising => "Moderate Assertiveness, Moderate Cooperativeness (Splitting the Difference)",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            NegotiationStyle::Competing => "Pursues own concerns aggressively, using whatever power seems appropriate to win the position.",
            NegotiationStyle::Accommodating => "Neglects own concerns to satisfy the concerns of the other party; element of self-sacrifice.",
            NegotiationStyle::Collaborating => "Works with the other party to find creative, integrative solutions that fully satisfy both sets of concerns.",
            NegotiationStyle::Avoiding => "Does not immediately pursue own concerns or those of the other party; sidesteps or postpones conflict.",
            NegotiationStyle::Compromising => "Seeks an expedient, mutually acceptable solution that partially satisfies both parties.",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Question {
    pub id: usize,
    pub row_a: usize,
    pub row_b: usize,
    pub text_a: &'static str,
    pub text_b: &'static str,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoreKeyItem {
    pub item: &'static str,
    pub style: NegotiationStyle,
    pub row: usize,
    pub score_col: usize,
    pub label_col: usize,
}

pub const QUESTIONS: [Question; 20] = [
    Question {
        id: 1,
        row_a: 0,
        row_b: 1,
        text_a: "I try to help the other party, even if it means giving up my needs",
        text_b: "I exchange information and ideas freely",
    },
    Question {
        id: 2,
        row_a: 3,
        row_b: 4,
        text_a: "I try to find compromise solutions",
        text_b: "I look for and exploit the other party’s weaknesses in a negotiation",
    },
    Question {
        id: 3,
        row_a: 6,
        row_b: 7,
        text_a: "I prefer to avoid contact with difficult negotiators",
        text_b: "I try to preserve the relationship at all costs",
    },
    Question {
        id: 4,
        row_a: 9,
        row_b: 10,
        text_a: "I try to collaborate",
        text_b: "I will back off my demand a little",
    },
    Question {
        id: 5,
        row_a: 12,
        row_b: 13,
        text_a: "I am competitive and try to ensure that my needs are met",
        text_b: "I prefer to avoid controversy",
    },
    Question {
        id: 6,
        row_a: 15,
        row_b: 16,
        text_a: "As a rule, I try to avoid negotiating",
        text_b: "I look for opportunities to split the differences in a negotiation",
    },
    Question {
        id: 7,
        row_a: 18,
        row_b: 19,
        text_a: "I let the other party dictate the terms of the agreement",
        text_b: "I press the logic of my position",
    },
    Question {
        id: 8,
        row_a: 21,
        row_b: 22,
        text_a: "I don’t give up until I get what I want",
        text_b: "I try to satisfy both of our needs",
    },
    Question {
        id: 9,
        row_a: 24,
        row_b: 25,
        text_a: "I will give something up for something in return",
        text_b: "I try to keep the other party happy",
    },
    Question {
        id: 10,
        row_a: 27,
        row_b: 28,
        text_a: "I seek to build trust",
        text_b: "I avoid situations that might create tension",
    },
    Question {
        id: 11,
        row_a: 30,
        row_b: 31,
        text_a: "I am usually willing to settle for a part of what I want",
        text_b: "I withhold information that might give the other party an advantage",
    },
    Question {
        id: 12,
        row_a: 33,
        row_b: 34,
        text_a: "I avoid open discussions of issues and concerns",
        text_b: "I try not to hurt the other person’s feelings",
    },
    Question {
        id: 13,
        row_a: 36,
        row_b: 37,
        text_a: "I try to convince the other party that I am right",
        text_b: "I listen to the other person before sharing my views",
    },
    Question {
        id: 14,
        row_a: 41,
        row_b: 42,
        text_a: "I focus on the other party’s concerns more than mine",
        text_b: "I will look for an intermediate position (halfway between your expectation)",
    },
    Question {
        id: 15,
        row_a: 44,
        row_b: 45,
        text_a: "I try to bring issues or concerns into open",
        text_b: "I avoid people who are tough negotiators",
    },
    Question {
        id: 16,
        row_a: 47,
        row_b: 48,
        text_a: "I go along with the other party’s suggestions",
        text_b: "I use my power to influence the outcome of a negotiation",
    },
    Question {
        id: 17,
        row_a: 50,
        row_b: 51,
        text_a: "In every negotiation I look for opportunities where give-and-take can occur",
        text_b: "I look for creative solutions that make both parties winners",
    },
    Question {
        id: 18,
        row_a: 53,
        row_b: 54,
        text_a: "I try to outsmart and outtalk the other party",
        text_b: "I withdraw from negotiations, even when I might win",
    },
    Question {
        id: 19,
        row_a: 56,
        row_b: 57,
        text_a: "I try to deal with all the issues that are important to both of us",
        text_b: "I focus only on the issues that we agree on, not those issues of disagreement",
    },
    Question {
        id: 20,
        row_a: 59,
        row_b: 60,
        text_a: "I prefer to postpone facing difficult negotiations",
        text_b: "I will give up some of my demands if the other party will do the same",
    },
];

pub const SCORE_KEY_ITEMS: [ScoreKeyItem; 40] = [
    ScoreKeyItem { item: "2b", style: NegotiationStyle::Competing, row: 0, score_col: 0, label_col: 1 },
    ScoreKeyItem { item: "1a", style: NegotiationStyle::Accommodating, row: 0, score_col: 3, label_col: 4 },
    ScoreKeyItem { item: "1b", style: NegotiationStyle::Collaborating, row: 0, score_col: 6, label_col: 7 },
    ScoreKeyItem { item: "3a", style: NegotiationStyle::Avoiding, row: 0, score_col: 9, label_col: 10 },
    ScoreKeyItem { item: "2a", style: NegotiationStyle::Compromising, row: 0, score_col: 12, label_col: 13 },
    ScoreKeyItem { item: "5a", style: NegotiationStyle::Competing, row: 1, score_col: 0, label_col: 1 },
    ScoreKeyItem { item: "3b", style: NegotiationStyle::Accommodating, row: 1, score_col: 3, label_col: 4 },
    ScoreKeyItem { item: "4a", style: NegotiationStyle::Collaborating, row: 1, score_col: 6, label_col: 7 },
    ScoreKeyItem { item: "5b", style: NegotiationStyle::Avoiding, row: 1, score_col: 9, label_col: 10 },
    ScoreKeyItem { item: "4b", style: NegotiationStyle::Compromising, row: 1, score_col: 12, label_col: 13 },
    ScoreKeyItem { item: "7b", style: NegotiationStyle::Competing, row: 2, score_col: 0, label_col: 1 },
    ScoreKeyItem { item: "7a", style: NegotiationStyle::Accommodating, row: 2, score_col: 3, label_col: 4 },
    ScoreKeyItem { item: "8b", style: NegotiationStyle::Collaborating, row: 2, score_col: 6, label_col: 7 },
    ScoreKeyItem { item: "6a", style: NegotiationStyle::Avoiding, row: 2, score_col: 9, label_col: 10 },
    ScoreKeyItem { item: "6b", style: NegotiationStyle::Compromising, row: 2, score_col: 12, label_col: 13 },
    ScoreKeyItem { item: "8a", style: NegotiationStyle::Competing, row: 3, score_col: 0, label_col: 1 },
    ScoreKeyItem { item: "9b", style: NegotiationStyle::Accommodating, row: 3, score_col: 3, label_col: 4 },
    ScoreKeyItem { item: "10a", style: NegotiationStyle::Collaborating, row: 3, score_col: 6, label_col: 7 },
    ScoreKeyItem { item: "10b", style: NegotiationStyle::Avoiding, row: 3, score_col: 9, label_col: 10 },
    ScoreKeyItem { item: "9a", style: NegotiationStyle::Compromising, row: 3, score_col: 12, label_col: 13 },
    ScoreKeyItem { item: "11b", style: NegotiationStyle::Competing, row: 4, score_col: 0, label_col: 1 },
    ScoreKeyItem { item: "12b", style: NegotiationStyle::Accommodating, row: 4, score_col: 3, label_col: 4 },
    ScoreKeyItem { item: "13b", style: NegotiationStyle::Collaborating, row: 4, score_col: 6, label_col: 7 },
    ScoreKeyItem { item: "12a", style: NegotiationStyle::Avoiding, row: 4, score_col: 9, label_col: 10 },
    ScoreKeyItem { item: "11a", style: NegotiationStyle::Compromising, row: 4, score_col: 12, label_col: 13 },
    ScoreKeyItem { item: "13a", style: NegotiationStyle::Competing, row: 5, score_col: 0, label_col: 1 },
    ScoreKeyItem { item: "14a", style: NegotiationStyle::Accommodating, row: 5, score_col: 3, label_col: 4 },
    ScoreKeyItem { item: "15a", style: NegotiationStyle::Collaborating, row: 5, score_col: 6, label_col: 7 },
    ScoreKeyItem { item: "15b", style: NegotiationStyle::Avoiding, row: 5, score_col: 9, label_col: 10 },
    ScoreKeyItem { item: "14b", style: NegotiationStyle::Compromising, row: 5, score_col: 12, label_col: 13 },
    ScoreKeyItem { item: "16b", style: NegotiationStyle::Competing, row: 6, score_col: 0, label_col: 1 },
    ScoreKeyItem { item: "16a", style: NegotiationStyle::Accommodating, row: 6, score_col: 3, label_col: 4 },
    ScoreKeyItem { item: "17b", style: NegotiationStyle::Collaborating, row: 6, score_col: 6, label_col: 7 },
    ScoreKeyItem { item: "18b", style: NegotiationStyle::Avoiding, row: 6, score_col: 9, label_col: 10 },
    ScoreKeyItem { item: "17a", style: NegotiationStyle::Compromising, row: 6, score_col: 12, label_col: 13 },
    ScoreKeyItem { item: "18a", style: NegotiationStyle::Competing, row: 7, score_col: 0, label_col: 1 },
    ScoreKeyItem { item: "19b", style: NegotiationStyle::Accommodating, row: 7, score_col: 3, label_col: 4 },
    ScoreKeyItem { item: "19a", style: NegotiationStyle::Collaborating, row: 7, score_col: 6, label_col: 7 },
    ScoreKeyItem { item: "20a", style: NegotiationStyle::Avoiding, row: 7, score_col: 9, label_col: 10 },
    ScoreKeyItem { item: "20b", style: NegotiationStyle::Compromising, row: 7, score_col: 12, label_col: 13 },
];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Answer {
    pub a: u32,
    pub b: u32,
}

impl Answer {
    pub fn new(a: u32, b: u32) -> Result<Self, &'static str> {
        if a > 5 || b > 5 {
            return Err("Points for each statement must be between 0 and 5.");
        }
        if a + b != 5 {
            return Err("The sum of points for (a) and (b) must equal exactly 5.");
        }
        Ok(Answer { a, b })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssessmentState {
    pub name: String,
    pub nim: String,
    pub answers: [Option<Answer>; 20],
}

impl Default for AssessmentState {
    fn default() -> Self {
        AssessmentState {
            name: String::new(),
            nim: String::new(),
            answers: [None; 20],
        }
    }
}

impl AssessmentState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn set_answer(&mut self, question_id: usize, a: u32, b: u32) -> Result<(), &'static str> {
        if question_id < 1 || question_id > 20 {
            return Err("Question number must be between 1 and 20.");
        }
        let ans = Answer::new(a, b)?;
        self.answers[question_id - 1] = Some(ans);
        Ok(())
    }

    pub fn get_answer(&self, question_id: usize) -> Option<Answer> {
        if question_id < 1 || question_id > 20 {
            return None;
        }
        self.answers[question_id - 1]
    }

    pub fn completed_count(&self) -> usize {
        self.answers.iter().filter(|ans| ans.is_some()).count()
    }

    pub fn is_complete(&self) -> bool {
        self.completed_count() == 20
    }

    pub fn get_item_score(&self, item_label: &str) -> Option<u32> {
        if item_label.len() < 2 {
            return None;
        }
        let opt_char = item_label.chars().last()?;
        let num_str = &item_label[..item_label.len() - 1];
        let q_id: usize = num_str.parse().ok()?;
        let ans = self.get_answer(q_id)?;
        match opt_char {
            'a' => Some(ans.a),
            'b' => Some(ans.b),
            _ => None,
        }
    }

    pub fn calculate_scores(&self) -> Result<ProfileScores, &'static str> {
        if !self.is_complete() {
            return Err("Assessment is not yet complete. All 20 questions must be answered.");
        }

        let mut competing = 0;
        let mut accommodating = 0;
        let mut collaborating = 0;
        let mut avoiding = 0;
        let mut compromising = 0;

        for item in &SCORE_KEY_ITEMS {
            let score = self.get_item_score(item.item)
                .ok_or("Missing score for item")?;
            match item.style {
                NegotiationStyle::Competing => competing += score,
                NegotiationStyle::Accommodating => accommodating += score,
                NegotiationStyle::Collaborating => collaborating += score,
                NegotiationStyle::Avoiding => avoiding += score,
                NegotiationStyle::Compromising => compromising += score,
            }
        }

        let total = competing + accommodating + collaborating + avoiding + compromising;
        if total != 100 {
            return Err("Integrity error: Total score across all styles did not equal 100.");
        }

        Ok(ProfileScores {
            competing,
            accommodating,
            collaborating,
            avoiding,
            compromising,
        })
    }

    pub fn apply_preset(&mut self, preset: &str) -> bool {
        match preset.to_lowercase().as_str() {
            "collaborative" | "collaborator" => {
                // Emphasizes collaborating (1b, 4a, 8b, 10a, 13b, 15a, 17b, 19a)
                // Q1: a=1, b=4 (1b colab)
                // Q2: a=3, b=2 (compromise/compete)
                // Q3: a=2, b=3 (avoid/accomm)
                // Q4: a=5, b=0 (4a colab)
                // Q5: a=2, b=3 (compete/avoid)
                // Q6: a=2, b=3 (avoid/compromise)
                // Q7: a=2, b=3 (accomm/compete)
                // Q8: a=1, b=4 (8b colab)
                // Q9: a=3, b=2 (compromise/accomm)
                // Q10: a=4, b=1 (10a colab)
                // Q11: a=3, b=2 (compromise/compete)
                // Q12: a=2, b=3 (avoid/accomm)
                // Q13: a=1, b=4 (13b colab)
                // Q14: a=2, b=3 (accomm/compromise)
                // Q15: a=4, b=1 (15a colab)
                // Q16: a=2, b=3 (accomm/compete)
                // Q17: a=1, b=4 (17b colab)
                // Q18: a=2, b=3 (compete/avoid)
                // Q19: a=4, b=1 (19a colab)
                // Q20: a=2, b=3 (avoid/compromise)
                let scores = [
                    (1, 4), (3, 2), (2, 3), (5, 0), (2, 3),
                    (2, 3), (2, 3), (1, 4), (3, 2), (4, 1),
                    (3, 2), (2, 3), (1, 4), (2, 3), (4, 1),
                    (2, 3), (1, 4), (2, 3), (4, 1), (2, 3),
                ];
                for (i, &(a, b)) in scores.iter().enumerate() {
                    let _ = self.set_answer(i + 1, a, b);
                }
                true
            }
            "competitive" | "competitor" => {
                // Emphasizes competing (2b, 5a, 7b, 8a, 11b, 13a, 16b, 18a)
                let scores = [
                    (2, 3), (1, 4), (2, 3), (2, 3), (5, 0),
                    (2, 3), (1, 4), (5, 0), (3, 2), (2, 3),
                    (1, 4), (2, 3), (4, 1), (2, 3), (2, 3),
                    (1, 4), (2, 3), (4, 1), (2, 3), (2, 3),
                ];
                for (i, &(a, b)) in scores.iter().enumerate() {
                    let _ = self.set_answer(i + 1, a, b);
                }
                true
            }
            "compromising" | "compromiser" => {
                // Emphasizes compromising (2a, 4b, 6b, 9a, 11a, 14b, 17a, 20b)
                let scores = [
                    (2, 3), (4, 1), (2, 3), (1, 4), (2, 3),
                    (1, 4), (2, 3), (2, 3), (4, 1), (2, 3),
                    (4, 1), (2, 3), (2, 3), (1, 4), (2, 3),
                    (2, 3), (4, 1), (2, 3), (2, 3), (1, 4),
                ];
                for (i, &(a, b)) in scores.iter().enumerate() {
                    let _ = self.set_answer(i + 1, a, b);
                }
                true
            }
            "accommodating" | "accommodator" => {
                // Emphasizes accommodating (1a, 3b, 7a, 9b, 12b, 14a, 16a, 19b)
                let scores = [
                    (4, 1), (2, 3), (1, 4), (2, 3), (2, 3),
                    (2, 3), (4, 1), (2, 3), (1, 4), (2, 3),
                    (2, 3), (1, 4), (2, 3), (4, 1), (2, 3),
                    (4, 1), (2, 3), (2, 3), (1, 4), (2, 3),
                ];
                for (i, &(a, b)) in scores.iter().enumerate() {
                    let _ = self.set_answer(i + 1, a, b);
                }
                true
            }
            "avoiding" | "avoider" => {
                // Emphasizes avoiding (3a, 5b, 6a, 10b, 12a, 15b, 18b, 20a)
                let scores = [
                    (2, 3), (2, 3), (4, 1), (2, 3), (1, 4),
                    (4, 1), (2, 3), (2, 3), (2, 3), (1, 4),
                    (2, 3), (4, 1), (2, 3), (2, 3), (1, 4),
                    (2, 3), (2, 3), (1, 4), (2, 3), (4, 1),
                ];
                for (i, &(a, b)) in scores.iter().enumerate() {
                    let _ = self.set_answer(i + 1, a, b);
                }
                true
            }
            "balanced" => {
                // 3 and 2 alternating
                for i in 1..=20 {
                    let a = if i % 2 == 1 { 3 } else { 2 };
                    let b = 5 - a;
                    let _ = self.set_answer(i, a, b);
                }
                true
            }
            _ => false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileScores {
    pub competing: u32,
    pub accommodating: u32,
    pub collaborating: u32,
    pub avoiding: u32,
    pub compromising: u32,
}

impl ProfileScores {
    pub fn get_score(&self, style: NegotiationStyle) -> u32 {
        match style {
            NegotiationStyle::Competing => self.competing,
            NegotiationStyle::Accommodating => self.accommodating,
            NegotiationStyle::Collaborating => self.collaborating,
            NegotiationStyle::Avoiding => self.avoiding,
            NegotiationStyle::Compromising => self.compromising,
        }
    }

    pub fn ranked(&self) -> Vec<(NegotiationStyle, u32)> {
        let mut list = vec![
            (NegotiationStyle::Competing, self.competing),
            (NegotiationStyle::Accommodating, self.accommodating),
            (NegotiationStyle::Collaborating, self.collaborating),
            (NegotiationStyle::Avoiding, self.avoiding),
            (NegotiationStyle::Compromising, self.compromising),
        ];
        list.sort_by(|a, b| b.1.cmp(&a.1));
        list
    }

    pub fn dominant_style(&self) -> (NegotiationStyle, u32) {
        self.ranked()[0]
    }

    pub fn secondary_style(&self) -> (NegotiationStyle, u32) {
        self.ranked()[1]
    }

    pub fn least_preferred_style(&self) -> (NegotiationStyle, u32) {
        self.ranked()[4]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_question_count_and_uniqueness() {
        assert_eq!(QUESTIONS.len(), 20);
        for (i, q) in QUESTIONS.iter().enumerate() {
            assert_eq!(q.id, i + 1);
            assert!(!q.text_a.is_empty());
            assert!(!q.text_b.is_empty());
        }
    }

    #[test]
    fn test_scoring_key_mapping_integrity() {
        assert_eq!(SCORE_KEY_ITEMS.len(), 40);
        for style in NegotiationStyle::all() {
            let count = SCORE_KEY_ITEMS.iter().filter(|x| x.style == style).count();
            assert_eq!(count, 8, "Style {:?} must have 8 items", style);
        }
    }

    #[test]
    fn test_assessment_completion_and_total_scores() {
        let mut state = AssessmentState::new();
        assert!(state.apply_preset("collaborative"));
        assert!(state.is_complete());
        let scores = state.calculate_scores().expect("calculate scores");
        let total = scores.competing
            + scores.accommodating
            + scores.collaborating
            + scores.avoiding
            + scores.compromising;
        assert_eq!(total, 100);
        assert_eq!(scores.dominant_style().0, NegotiationStyle::Collaborating);
    }

    #[test]
    fn test_answer_validation() {
        assert!(Answer::new(3, 2).is_ok());
        assert!(Answer::new(0, 5).is_ok());
        assert!(Answer::new(5, 0).is_ok());
        assert!(Answer::new(3, 3).is_err());
        assert!(Answer::new(6, 0).is_err());
    }
}
