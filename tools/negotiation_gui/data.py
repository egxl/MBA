"""
Data structures and mapping for Negotiation Styles Analysis.
Based on the Thomas-Kilmann / Lewicki & Saunders Negotiation Styles Assessment.
"""

QUESTIONS = [
    {
        "num": 1,
        "a": {
            "text": "I try to help the other party, even if it means giving up my needs",
            "style": "Accommodating",
            "code": "1a",
        },
        "b": {
            "text": "I exchange information and ideas freely",
            "style": "Collaborating",
            "code": "1b",
        },
    },
    {
        "num": 2,
        "a": {
            "text": "I try to find compromise solutions",
            "style": "Compromising",
            "code": "2a",
        },
        "b": {
            "text": "I look for and exploit the other party's weaknesses in a negotiation",
            "style": "Competing",
            "code": "2b",
        },
    },
    {
        "num": 3,
        "a": {
            "text": "I prefer to avoid contact with difficult negotiators",
            "style": "Avoiding",
            "code": "3a",
        },
        "b": {
            "text": "I try to preserve the relationship at all costs",
            "style": "Accommodating",
            "code": "3b",
        },
    },
    {
        "num": 4,
        "a": {
            "text": "I try to collaborate",
            "style": "Collaborating",
            "code": "4a",
        },
        "b": {
            "text": "I will back off my demand a little",
            "style": "Compromising",
            "code": "4b",
        },
    },
    {
        "num": 5,
        "a": {
            "text": "I am competitive and try to ensure that my needs are met",
            "style": "Competing",
            "code": "5a",
        },
        "b": {
            "text": "I prefer to avoid controversy",
            "style": "Avoiding",
            "code": "5b",
        },
    },
    {
        "num": 6,
        "a": {
            "text": "As a rule, I try to avoid negotiating",
            "style": "Avoiding",
            "code": "6a",
        },
        "b": {
            "text": "I look for opportunities to split the differences in a negotiation",
            "style": "Compromising",
            "code": "6b",
        },
    },
    {
        "num": 7,
        "a": {
            "text": "I let the other party dictate the terms of the agreement",
            "style": "Accommodating",
            "code": "7a",
        },
        "b": {
            "text": "I press the logic of my position",
            "style": "Competing",
            "code": "7b",
        },
    },
    {
        "num": 8,
        "a": {
            "text": "I don't give up until I get what I want",
            "style": "Competing",
            "code": "8a",
        },
        "b": {
            "text": "I try to satisfy both of our needs",
            "style": "Collaborating",
            "code": "8b",
        },
    },
    {
        "num": 9,
        "a": {
            "text": "I will give something up for something in return",
            "style": "Compromising",
            "code": "9a",
        },
        "b": {
            "text": "I try to keep the other party happy",
            "style": "Accommodating",
            "code": "9b",
        },
    },
    {
        "num": 10,
        "a": {
            "text": "I seek to build trust",
            "style": "Collaborating",
            "code": "10a",
        },
        "b": {
            "text": "I avoid situations that might create tension",
            "style": "Avoiding",
            "code": "10b",
        },
    },
    {
        "num": 11,
        "a": {
            "text": "I am usually willing to settle for a part of what I want",
            "style": "Compromising",
            "code": "11a",
        },
        "b": {
            "text": "I withhold information that might give the other party an advantage",
            "style": "Competing",
            "code": "11b",
        },
    },
    {
        "num": 12,
        "a": {
            "text": "I avoid open discussions of issues and concerns",
            "style": "Avoiding",
            "code": "12a",
        },
        "b": {
            "text": "I try not to hurt the other person's feelings",
            "style": "Accommodating",
            "code": "12b",
        },
    },
    {
        "num": 13,
        "a": {
            "text": "I try to convince the other party that I am right",
            "style": "Competing",
            "code": "13a",
        },
        "b": {
            "text": "I listen to the other person before sharing my views",
            "style": "Collaborating",
            "code": "13b",
        },
    },
    {
        "num": 14,
        "a": {
            "text": "I focus on the other party's concerns more than mine",
            "style": "Accommodating",
            "code": "14a",
        },
        "b": {
            "text": "I will look for an intermediate position (halfway between your expectation)",
            "style": "Compromising",
            "code": "14b",
        },
    },
    {
        "num": 15,
        "a": {
            "text": "I try to bring issues or concerns into open",
            "style": "Collaborating",
            "code": "15a",
        },
        "b": {
            "text": "I avoid people who are tough negotiators",
            "style": "Avoiding",
            "code": "15b",
        },
    },
    {
        "num": 16,
        "a": {
            "text": "I go along with the other party's suggestions",
            "style": "Accommodating",
            "code": "16a",
        },
        "b": {
            "text": "I use my power to influence the outcome of a negotiation",
            "style": "Competing",
            "code": "16b",
        },
    },
    {
        "num": 17,
        "a": {
            "text": "In every negotiation I look for opportunities where give-and-take can occur",
            "style": "Compromising",
            "code": "17a",
        },
        "b": {
            "text": "I look for creative solutions that make both parties winners",
            "style": "Collaborating",
            "code": "17b",
        },
    },
    {
        "num": 18,
        "a": {
            "text": "I try to outsmart and outtalk the other party",
            "style": "Competing",
            "code": "18a",
        },
        "b": {
            "text": "I withdraw from negotiations, even when I might win",
            "style": "Avoiding",
            "code": "18b",
        },
    },
    {
        "num": 19,
        "a": {
            "text": "I try to deal with all the issues that are important to both of us",
            "style": "Collaborating",
            "code": "19a",
        },
        "b": {
            "text": "I focus only on the issues that we agree on, not those issues of disagreement",
            "style": "Accommodating",
            "code": "19b",
        },
    },
    {
        "num": 20,
        "a": {
            "text": "I prefer to postpone facing difficult negotiations",
            "style": "Avoiding",
            "code": "20a",
        },
        "b": {
            "text": "I will give up some of my demands if the other party will do the same",
            "style": "Compromising",
            "code": "20b",
        },
    },
]

# Table 0 exact row indices for (option a, option b) in template.docx
# Q1: 0, 1 | Q2: 3, 4 | Q3: 6, 7 | ... | Q13: 36, 37 | (38,39,40 empty) | Q14: 41, 42 | ... | Q20: 59, 60
TABLE_0_ROW_MAP = {
    1: (0, 1),
    2: (3, 4),
    3: (6, 7),
    4: (9, 10),
    5: (12, 13),
    6: (15, 16),
    7: (18, 19),
    8: (21, 22),
    9: (24, 25),
    10: (27, 28),
    11: (30, 31),
    12: (33, 34),
    13: (36, 37),
    14: (41, 42),
    15: (44, 45),
    16: (47, 48),
    17: (50, 51),
    18: (53, 54),
    19: (56, 57),
    20: (59, 60),
}

# Table 1 columns and items:
# Competing: Col 0 score, Col 1 label
# Accommodating: Col 3 score, Col 4 label
# Collaborating: Col 6 score, Col 7 label
# Avoiding: Col 9 score, Col 10 label
# Compromising: Col 12 score, Col 13 label
STYLES = ["Competing", "Accommodating", "Collaborating", "Avoiding", "Compromising"]

STYLE_CONFIG = {
    "Competing": {
        "score_col": 0,
        "label_col": 1,
        "items": ["2b", "5a", "7b", "8a", "11b", "13a", "16b", "18a"],
        "color": "#E53E3E",  # Red
        "icon": "⚔️",
        "description": "High assertiveness, low cooperativeness. Focuses on winning, claiming value, and defending rights or positions.",
        "strengths": "Decisive, goal-oriented, protects against exploitation in zero-sum distributive situations.",
        "pitfalls": "Can damage long-term trust, escalates conflict, discourages mutual problem-solving.",
        "when_to_use": "Crucial emergencies, defending vital principles, or dealing with competitive counterparts.",
    },
    "Accommodating": {
        "score_col": 3,
        "label_col": 4,
        "items": ["1a", "3b", "7a", "9b", "12b", "14a", "16a", "19b"],
        "color": "#3182CE",  # Blue
        "icon": "🤝",
        "description": "Low assertiveness, high cooperativeness. Focuses on preserving relationships, goodwill, and helping the other party.",
        "strengths": "Builds goodwill, diffuses interpersonal tension, nurtures lasting partnerships.",
        "pitfalls": "Risk of being taken advantage of, unexpressed needs, suboptimal substantive outcomes.",
        "when_to_use": "The relationship matters far more than the issue, when you are in the wrong, or to build social capital.",
    },
    "Collaborating": {
        "score_col": 6,
        "label_col": 7,
        "items": ["1b", "4a", "8b", "10a", "13b", "15a", "17b", "19a"],
        "color": "#38A169",  # Green
        "icon": "🌟",
        "description": "High assertiveness, high cooperativeness. Seeks win-win solutions, integrative value creation, and deep mutual understanding.",
        "strengths": "Creates synergistic value, strengthens alliances, produces high-commitment sustainable agreements.",
        "pitfalls": "Requires significant time and energy, vulnerable to exploitation if other party is purely competitive.",
        "when_to_use": "High-stakes strategic partnerships where issues are complex and both parties' concerns are vital.",
    },
    "Avoiding": {
        "score_col": 9,
        "label_col": 10,
        "items": ["3a", "5b", "6a", "10b", "12a", "15b", "18b", "20a"],
        "color": "#805AD5",  # Purple
        "icon": "🛡️",
        "description": "Low assertiveness, low cooperativeness. Withdraws or postpones confrontation, side-stepping controversy.",
        "strengths": "Prevents needless friction over trivial matters, buys time to cool emotions and gather information.",
        "pitfalls": "Critical issues fester unresolved, decisions are made by default without your input.",
        "when_to_use": "Trivial issues, emotionally overheated moments, or when others can resolve the conflict more effectively.",
    },
    "Compromising": {
        "score_col": 12,
        "label_col": 13,
        "items": ["2a", "4b", "6b", "9a", "11a", "14b", "17a", "20b"],
        "color": "#DD6B20",  # Orange
        "icon": "⚖️",
        "description": "Intermediate assertiveness, intermediate cooperativeness. Seeks pragmatic, expedient middle ground and split-the-difference trades.",
        "strengths": "Fast, fair, practical fallback when time is limited or positions are mutually exclusive.",
        "pitfalls": "May overlook creative integrative solutions, neither party achieves full potential value.",
        "when_to_use": "Time-sensitive deadlines, moderate-importance issues, or as a backup when collaboration fails.",
    },
}
