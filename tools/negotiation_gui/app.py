"""
Negotiation Styles Analysis - Interactive GUI Application.
Helps users interactively answer the 20-pair negotiation assessment,
visualizes results across the 5 styles in real-time (with anti-spoiler blind mode),
and generates the filled-in Word document (.docx) using the original template.
"""

import os
import sys
import json
import subprocess
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from typing import Dict, Tuple

# Enable DPI awareness on Windows for ultra-crisp fonts
if sys.platform == "win32":
    try:
        import ctypes
        ctypes.windll.shcore.SetProcessDpiAwareness(1)
    except Exception:
        pass

from data import QUESTIONS, STYLES, STYLE_CONFIG
from docx_generator import (
    fill_negotiation_docx,
    compute_style_scores,
    normalize_answers,
    get_dominant_style,
)


class NegotiationApp(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("Negotiation Styles Analysis - Assessment & Document Generator")
        self.geometry("1220x840")
        self.minsize(1040, 720)

        # Set paths
        self.app_dir = os.path.dirname(os.path.abspath(__file__))
        self.default_template = os.path.join(self.app_dir, "template.docx")
        if not os.path.exists(self.default_template):
            # Check user downloads folder as fallback
            dl_path = os.path.expanduser(
                r"~\Downloads\Individual Assignment_Negotiation Styles Analysis (3).docx"
            )
            if os.path.exists(dl_path):
                self.default_template = dl_path

        # State
        self.current_q_idx = 0  # 0 to 19 (for Q1 to Q20)
        # answers: {q_num: [score_a, score_b]} where score_a + score_b == 5
        self.answers: Dict[int, list] = {q["num"]: [0, 5] for q in QUESTIONS}
        self.is_answered: Dict[int, bool] = {q["num"]: False for q in QUESTIONS}

        # Anti-spoiler mode: False by default (blind assessment)
        self.var_show_spoilers = tk.BooleanVar(value=False)
        self._updating_slider = False

        # UI Variables
        self.var_name = tk.StringVar(value="")
        self.var_nim = tk.StringVar(value="")
        self.var_template_path = tk.StringVar(value=self.default_template)
        self.var_output_path = tk.StringVar(value="")
        self.var_score_a = tk.IntVar(value=0)
        self.var_score_b = tk.IntVar(value=5)

        # Setup Theme & Styles
        self._setup_styles()

        # Build Main Layout
        self._build_ui()

        # Load first question
        self._load_question(0)
        self._update_all_views()

    def _setup_styles(self):
        """Configures a modern, clean ttk style."""
        self.style = ttk.Style()
        try:
            self.style.theme_use("clam")
        except Exception:
            pass

        # Color Palette
        self.c_bg = "#F8FAFC"          # Slate 50
        self.c_card = "#FFFFFF"        # White
        self.c_card_border = "#E2E8F0" # Slate 200
        self.c_text_main = "#0F172A"   # Slate 900
        self.c_text_muted = "#475569"  # Slate 600
        self.c_primary = "#2563EB"     # Royal Blue
        self.c_primary_hover = "#1D4ED8"
        self.c_success = "#059669"     # Emerald 600
        self.c_amber = "#D97706"       # Amber 600

        self.configure(bg=self.c_bg)

        # TTK Widget Customization
        self.style.configure(".", font=("Segoe UI", 10), background=self.c_bg, foreground=self.c_text_main)
        self.style.configure("TFrame", background=self.c_bg)
        self.style.configure("Card.TFrame", background=self.c_card, relief="flat")
        self.style.configure("Header.TFrame", background="#1E293B")  # Slate 800

        # Labels
        self.style.configure("Title.TLabel", font=("Segoe UI", 15, "bold"), foreground="#FFFFFF", background="#1E293B")
        self.style.configure("Subtitle.TLabel", font=("Segoe UI", 9), foreground="#94A3B8", background="#1E293B")
        self.style.configure("CardTitle.TLabel", font=("Segoe UI", 12, "bold"), foreground=self.c_text_main, background=self.c_card)
        self.style.configure("CardMuted.TLabel", font=("Segoe UI", 9), foreground=self.c_text_muted, background=self.c_card)

        # Buttons
        self.style.configure("Primary.TButton", font=("Segoe UI", 10, "bold"), background=self.c_primary, foreground="#FFFFFF")
        self.style.map("Primary.TButton", background=[("active", self.c_primary_hover)])

        self.style.configure("Success.TButton", font=("Segoe UI", 10, "bold"), background=self.c_success, foreground="#FFFFFF")
        self.style.map("Success.TButton", background=[("active", "#047857")])

        self.style.configure("Preset.TButton", font=("Segoe UI", 8, "bold"))
        self.style.configure("Nav.TButton", font=("Segoe UI", 10, "bold"), width=12)

    def _build_ui(self):
        """Constructs the application layout."""
        # Top Header Bar
        header = ttk.Frame(self, style="Header.TFrame", padding=(18, 12))
        header.pack(fill=tk.X)

        # Left Header: Titles & Spoiler Toggle
        title_box = ttk.Frame(header, style="Header.TFrame")
        title_box.pack(side=tk.LEFT)
        ttk.Label(title_box, text="Negotiation Styles Analysis", style="Title.TLabel").pack(anchor="w")

        sub_row = ttk.Frame(title_box, style="Header.TFrame")
        sub_row.pack(anchor="w", pady=(2, 0))
        ttk.Label(
            sub_row,
            text="Interactive Assessment & Word Document (.docx) Generator  •  ",
            style="Subtitle.TLabel",
        ).pack(side=tk.LEFT)

        # Prominent Anti-Spoiler Toggle Checkbutton
        self.chk_spoilers = tk.Checkbutton(
            sub_row,
            text="👁️ Show Style Labels & Live Spoilers",
            variable=self.var_show_spoilers,
            command=self._on_toggle_spoilers,
            bg="#1E293B",
            fg="#F59E0B",
            selectcolor="#0F172A",
            activebackground="#1E293B",
            activeforeground="#FBBF24",
            font=("Segoe UI", 9, "bold"),
            cursor="hand2",
        )
        self.chk_spoilers.pack(side=tk.LEFT, padx=(4, 0))

        # Top Right Meta inputs (Name & NIM)
        user_meta_box = ttk.Frame(header, style="Header.TFrame")
        user_meta_box.pack(side=tk.RIGHT, fill=tk.Y)

        row_name = ttk.Frame(user_meta_box, style="Header.TFrame")
        row_name.pack(fill=tk.X, pady=2)
        ttk.Label(row_name, text="Full Name: ", foreground="#E2E8F0", background="#1E293B", font=("Segoe UI", 9, "bold")).pack(side=tk.LEFT)
        name_entry = ttk.Entry(row_name, textvariable=self.var_name, width=22)
        name_entry.pack(side=tk.LEFT)
        name_entry.bind("<KeyRelease>", lambda e: self._auto_update_output_path())

        row_nim = ttk.Frame(user_meta_box, style="Header.TFrame")
        row_nim.pack(fill=tk.X, pady=2)
        ttk.Label(row_nim, text="NIM / ID:  ", foreground="#E2E8F0", background="#1E293B", font=("Segoe UI", 9, "bold")).pack(side=tk.LEFT)
        nim_entry = ttk.Entry(row_nim, textvariable=self.var_nim, width=22)
        nim_entry.pack(side=tk.LEFT)
        nim_entry.bind("<KeyRelease>", lambda e: self._auto_update_output_path())

        # Main Body Split (Left: Questionnaire / Grid, Right: Live Results & Analytics)
        body = ttk.Frame(self, padding=12)
        body.pack(fill=tk.BOTH, expand=True)

        # Paned Window
        paned = ttk.PanedWindow(body, orient=tk.HORIZONTAL)
        paned.pack(fill=tk.BOTH, expand=True)

        # Left Container (Questionnaire Notebook)
        left_container = ttk.Frame(paned, padding=4)
        paned.add(left_container, weight=3)

        self.notebook = ttk.Notebook(left_container)
        self.notebook.pack(fill=tk.BOTH, expand=True)

        # Tab 1: Interactive Wizard
        self.tab_wizard = ttk.Frame(self.notebook, padding=10)
        self.notebook.add(self.tab_wizard, text="  🎯 Step-by-Step Wizard  ")

        # Tab 2: Full Worksheet Grid
        self.tab_grid = ttk.Frame(self.notebook, padding=10)
        self.notebook.add(self.tab_grid, text="  📋 Full Worksheet (20 Questions)  ")

        # Build Wizard Tab
        self._build_wizard_ui(self.tab_wizard)

        # Build Grid Tab
        self._build_grid_ui(self.tab_grid)

        # Right Container (Live Analysis & Actions)
        right_container = ttk.Frame(paned, padding=6)
        paned.add(right_container, weight=2)
        self._build_results_ui(right_container)

        # Bottom Bar (File Paths & Action Buttons)
        self._build_bottom_ui()

    def _build_wizard_ui(self, parent):
        """Constructs the step-by-step horizontal interactive questionnaire card."""
        # Top Jump-to-Question Strip
        jump_frame = ttk.Frame(parent)
        jump_frame.pack(fill=tk.X, pady=(0, 8))

        ttk.Label(jump_frame, text="Jump to Question: ", font=("Segoe UI", 9, "bold")).pack(side=tk.LEFT)

        self.q_buttons = []
        q_btn_scroll_frame = ttk.Frame(jump_frame)
        q_btn_scroll_frame.pack(side=tk.LEFT, fill=tk.X, expand=True)

        for i in range(20):
            btn = tk.Button(
                q_btn_scroll_frame,
                text=str(i + 1),
                width=3,
                font=("Segoe UI", 8, "bold"),
                relief="groove",
                bg="#E2E8F0",
                fg=self.c_text_main,
                command=lambda idx=i: self._load_question(idx),
            )
            btn.pack(side=tk.LEFT, padx=1)
            self.q_buttons.append(btn)

        # Question Card Wrapper
        q_card = tk.Frame(parent, bg=self.c_card, bd=1, relief="solid")
        q_card.pack(fill=tk.BOTH, expand=True, pady=4)

        # Header of Q Card
        qc_top = tk.Frame(q_card, bg=self.c_card, padx=16, pady=10)
        qc_top.pack(fill=tk.X)

        self.lbl_q_title = tk.Label(
            qc_top,
            text="Question 1 of 20",
            font=("Segoe UI", 13, "bold"),
            bg=self.c_card,
            fg=self.c_primary,
        )
        self.lbl_q_title.pack(side=tk.LEFT)

        self.lbl_q_instruct = tk.Label(
            qc_top,
            text="Distribute 5 points: slide toward the statement that best reflects your behavior",
            font=("Segoe UI", 9, "italic"),
            bg=self.c_card,
            fg=self.c_text_muted,
        )
        self.lbl_q_instruct.pack(side=tk.RIGHT)

        # Divider
        tk.Frame(q_card, height=1, bg=self.c_card_border).pack(fill=tk.X)

        # HORIZONTAL SIDE-BY-SIDE CONTAINER
        # [ Option A Card ] <--- [ Center Balance Slider ] ---> [ Option B Card ]
        horizontal_frame = tk.Frame(q_card, bg=self.c_card, padx=12, pady=12)
        horizontal_frame.pack(fill=tk.BOTH, expand=True)

        # LEFT CARD: Statement A
        self.card_a = tk.Frame(horizontal_frame, bg="#EFF6FF", bd=1, relief="solid", padx=14, pady=14)
        self.card_a.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        header_a = tk.Frame(self.card_a, bg="#EFF6FF")
        header_a.pack(fill=tk.X, pady=(0, 8))

        self.lbl_tag_a = tk.Label(
            header_a,
            text="Statement A",
            font=("Segoe UI", 10, "bold"),
            bg="#DBEAFE",
            fg="#1E40AF",
            padx=8,
            pady=3,
        )
        self.lbl_tag_a.pack(side=tk.LEFT)

        self.lbl_score_a_display = tk.Label(
            header_a,
            text="0 pts",
            font=("Segoe UI", 15, "bold"),
            bg="#EFF6FF",
            fg="#1E40AF",
        )
        self.lbl_score_a_display.pack(side=tk.RIGHT)

        self.lbl_text_a = tk.Label(
            self.card_a,
            text="",
            font=("Segoe UI", 11),
            bg="#EFF6FF",
            fg=self.c_text_main,
            wraplength=270,
            justify="left",
            pady=4,
        )
        self.lbl_text_a.pack(anchor="nw", fill=tk.BOTH, expand=True)

        # CENTER BRIDGE: The 5-Point Balance Scale & Slider Controls
        self.bridge_frame = tk.Frame(horizontal_frame, bg="#F8FAFC", bd=1, relief="solid", padx=12, pady=12, width=280)
        self.bridge_frame.pack(side=tk.LEFT, fill=tk.Y, padx=10)
        self.bridge_frame.pack_propagate(False)

        tk.Label(
            self.bridge_frame,
            text="5-POINT ALLOCATION",
            font=("Segoe UI", 9, "bold"),
            bg="#F8FAFC",
            fg=self.c_text_muted,
        ).pack(anchor="center", pady=(0, 4))

        # Big score comparison pill e.g. [ 3 pts  :  2 pts ]
        self.pill_frame = tk.Frame(self.bridge_frame, bg="#1E293B", padx=10, pady=4)
        self.pill_frame.pack(pady=4)

        self.lbl_ratio_display = tk.Label(
            self.pill_frame,
            text="0 pts  :  5 pts",
            font=("Segoe UI", 12, "bold"),
            bg="#1E293B",
            fg="#FFFFFF",
        )
        self.lbl_ratio_display.pack()

        # Directional guide arrows
        guide_row = tk.Frame(self.bridge_frame, bg="#F8FAFC")
        guide_row.pack(fill=tk.X, pady=(8, 2))
        tk.Label(guide_row, text="◄ More A", font=("Segoe UI", 8, "bold"), bg="#F8FAFC", fg="#1E40AF").pack(side=tk.LEFT)
        tk.Label(guide_row, text="More B ►", font=("Segoe UI", 8, "bold"), bg="#F8FAFC", fg="#166534").pack(side=tk.RIGHT)

        # Horizontal Slider: from 5 (far left for A) down to 0 (far right for A, meaning B=5)
        self.slider = ttk.Scale(
            self.bridge_frame,
            from_=5,
            to=0,
            orient=tk.HORIZONTAL,
            command=self._on_slider_moved,
        )
        self.slider.pack(fill=tk.X, pady=4)

        # Visual Proportion Bar
        self.bar_canvas = tk.Canvas(self.bridge_frame, height=18, bg="#E2E8F0", highlightthickness=0)
        self.bar_canvas.pack(fill=tk.X, pady=6)

        # Quick Preset Buttons (5:0, 4:1, 3:2, 2:3, 1:4, 0:5)
        tk.Label(
            self.bridge_frame,
            text="Quick Presets (A : B):",
            font=("Segoe UI", 8, "bold"),
            bg="#F8FAFC",
            fg=self.c_text_muted,
        ).pack(anchor="center", pady=(8, 4))

        presets_grid = tk.Frame(self.bridge_frame, bg="#F8FAFC")
        presets_grid.pack(pady=2)

        presets = [(5, 0), (4, 1), (3, 2), (2, 3), (1, 4), (0, 5)]
        for idx, (sa, sb) in enumerate(presets):
            row_idx = idx // 3
            col_idx = idx % 3
            btn = ttk.Button(
                presets_grid,
                text=f"{sa} : {sb}",
                style="Preset.TButton",
                width=6,
                command=lambda val_a=sa: self._set_score_a(val_a),
            )
            btn.grid(row=row_idx, column=col_idx, padx=2, pady=2)

        # RIGHT CARD: Statement B
        self.card_b = tk.Frame(horizontal_frame, bg="#F0FDF4", bd=1, relief="solid", padx=14, pady=14)
        self.card_b.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        header_b = tk.Frame(self.card_b, bg="#F0FDF4")
        header_b.pack(fill=tk.X, pady=(0, 8))

        self.lbl_tag_b = tk.Label(
            header_b,
            text="Statement B",
            font=("Segoe UI", 10, "bold"),
            bg="#DCFCE7",
            fg="#166534",
            padx=8,
            pady=3,
        )
        self.lbl_tag_b.pack(side=tk.LEFT)

        self.lbl_score_b_display = tk.Label(
            header_b,
            text="5 pts",
            font=("Segoe UI", 15, "bold"),
            bg="#F0FDF4",
            fg="#166534",
        )
        self.lbl_score_b_display.pack(side=tk.RIGHT)

        self.lbl_text_b = tk.Label(
            self.card_b,
            text="",
            font=("Segoe UI", 11),
            bg="#F0FDF4",
            fg=self.c_text_main,
            wraplength=270,
            justify="left",
            pady=4,
        )
        self.lbl_text_b.pack(anchor="nw", fill=tk.BOTH, expand=True)

        # Navigation Bar
        nav_bar = tk.Frame(parent, bg=self.c_bg, pady=4)
        nav_bar.pack(fill=tk.X)

        self.btn_prev = ttk.Button(
            nav_bar, text="← Previous", style="Nav.TButton", command=self._prev_question
        )
        self.btn_prev.pack(side=tk.LEFT)

        self.lbl_progress_summary = ttk.Label(
            nav_bar, text="0 / 20 Answered", font=("Segoe UI", 10, "bold")
        )
        self.lbl_progress_summary.pack(side=tk.LEFT, expand=True)

        self.btn_next = ttk.Button(
            nav_bar, text="Next →", style="Nav.TButton", command=self._next_question
        )
        self.btn_next.pack(side=tk.RIGHT)

    def _build_grid_ui(self, parent):
        """Builds scrollable table of all 20 questions for bulk review."""
        canvas = tk.Canvas(parent, bg=self.c_bg, highlightthickness=0)
        scrollbar = ttk.Scrollbar(parent, orient=tk.VERTICAL, command=canvas.yview)
        scroll_frame = ttk.Frame(canvas)

        scroll_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all")),
        )
        canvas_window = canvas.create_window((0, 0), window=scroll_frame, anchor="nw")
        canvas.bind(
            "<Configure>",
            lambda e: canvas.itemconfig(canvas_window, width=e.width),
        )
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # Header Row
        header_grid = tk.Frame(scroll_frame, bg="#1E293B", pady=6)
        header_grid.pack(fill=tk.X, pady=(0, 6))

        tk.Label(header_grid, text="Q#", font=("Segoe UI", 9, "bold"), fg="#FFFFFF", bg="#1E293B", width=4).pack(side=tk.LEFT, padx=4)
        tk.Label(header_grid, text="Statement A", font=("Segoe UI", 9, "bold"), fg="#FFFFFF", bg="#1E293B", anchor="w").pack(side=tk.LEFT, fill=tk.X, expand=True, padx=4)
        tk.Label(header_grid, text="Pts A", font=("Segoe UI", 9, "bold"), fg="#FFFFFF", bg="#1E293B", width=6).pack(side=tk.LEFT, padx=4)
        tk.Label(header_grid, text="Pts B", font=("Segoe UI", 9, "bold"), fg="#FFFFFF", bg="#1E293B", width=6).pack(side=tk.LEFT, padx=4)
        tk.Label(header_grid, text="Statement B", font=("Segoe UI", 9, "bold"), fg="#FFFFFF", bg="#1E293B", anchor="w").pack(side=tk.LEFT, fill=tk.X, expand=True, padx=4)

        self.grid_rows = []
        for q in QUESTIONS:
            q_num = q["num"]
            row_bg = "#FFFFFF" if q_num % 2 == 1 else "#F8FAFC"
            row = tk.Frame(scroll_frame, bg=row_bg, bd=1, relief="solid", padx=4, pady=4)
            row.pack(fill=tk.X, pady=2)

            # Q#
            tk.Label(row, text=str(q_num), font=("Segoe UI", 9, "bold"), bg=row_bg, width=4).pack(side=tk.LEFT)

            # Statement A text
            txt_a = tk.Label(row, text=q["a"]["text"], font=("Segoe UI", 9), bg=row_bg, anchor="w", justify="left")
            txt_a.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=4)

            # Spinbox A
            spin_a = ttk.Spinbox(
                row,
                from_=0,
                to=5,
                width=4,
                command=lambda qn=q_num: self._on_grid_spinbox_change(qn),
            )
            spin_a.set(0)
            spin_a.pack(side=tk.LEFT, padx=4)

            # Spinbox B
            spin_b = ttk.Spinbox(
                row,
                from_=0,
                to=5,
                width=4,
                command=lambda qn=q_num: self._on_grid_spinbox_b_change(qn),
            )
            spin_b.set(5)
            spin_b.pack(side=tk.LEFT, padx=4)

            # Statement B text
            txt_b = tk.Label(row, text=q["b"]["text"], font=("Segoe UI", 9), bg=row_bg, anchor="w", justify="left")
            txt_b.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=4)

            self.grid_rows.append({"q_num": q_num, "spin_a": spin_a, "spin_b": spin_b, "frame": row})

    def _build_results_ui(self, parent):
        """Constructs the sidebar with Anti-Spoiler Blind Mode & Live Profile views."""
        self.results_card = tk.Frame(parent, bg=self.c_card, bd=1, relief="solid", padx=14, pady=12)
        self.results_card.pack(fill=tk.BOTH, expand=True)

        # Top Section: Total Points & Progress (Always Visible)
        self.tot_box = tk.Frame(self.results_card, bg="#F1F5F9", padx=10, pady=6, bd=1, relief="solid")
        self.tot_box.pack(fill=tk.X, pady=(0, 10))

        self.lbl_total_points = tk.Label(
            self.tot_box,
            text="Total Points: 0 / 100",
            font=("Segoe UI", 10, "bold"),
            bg="#F1F5F9",
            fg=self.c_text_main,
        )
        self.lbl_total_points.pack(side=tk.LEFT)

        self.lbl_dominant_badge = tk.Label(
            self.tot_box,
            text="Status: In Progress",
            font=("Segoe UI", 9, "bold"),
            bg="#F1F5F9",
            fg=self.c_primary,
        )
        self.lbl_dominant_badge.pack(side=tk.RIGHT)

        # -------------------------------------------------------------
        # VIEW 1: BLIND ASSESSMENT MODE (SPOILERS OFF)
        # -------------------------------------------------------------
        self.frame_blind = tk.Frame(self.results_card, bg=self.c_card)
        self.frame_blind.pack(fill=tk.BOTH, expand=True)

        blind_banner = tk.Frame(self.frame_blind, bg="#EFF6FF", bd=1, relief="solid", padx=12, pady=10)
        blind_banner.pack(fill=tk.X, pady=(0, 12))

        tk.Label(
            blind_banner,
            text="🔒 Blind Assessment Mode",
            font=("Segoe UI", 11, "bold"),
            bg="#EFF6FF",
            fg="#1E40AF",
        ).pack(anchor="w")

        tk.Label(
            blind_banner,
            text="Style labels and live score feeds are concealed to prevent subconscious bias while answering.",
            font=("Segoe UI", 9),
            bg="#EFF6FF",
            fg=self.c_text_muted,
            wraplength=310,
            justify="left",
        ).pack(anchor="w", pady=(4, 8))

        # Completion Progress
        prog_box = tk.Frame(self.frame_blind, bg=self.c_card)
        prog_box.pack(fill=tk.X, pady=(0, 12))

        self.lbl_blind_completion = tk.Label(
            prog_box,
            text="Completion: 0 / 20 (0%)",
            font=("Segoe UI", 10, "bold"),
            bg=self.c_card,
            fg=self.c_text_main,
        )
        self.lbl_blind_completion.pack(anchor="w", pady=(0, 4))

        self.blind_progressbar = ttk.Progressbar(prog_box, orient=tk.HORIZONTAL, maximum=20, value=0)
        self.blind_progressbar.pack(fill=tk.X, pady=(0, 6))

        self.lbl_blind_status = tk.Label(
            prog_box,
            text="20 questions remaining",
            font=("Segoe UI", 9),
            bg=self.c_card,
            fg=self.c_text_muted,
        )
        self.lbl_blind_status.pack(anchor="w")

        # Action: Reveal Profile Button
        self.btn_reveal = tk.Button(
            self.frame_blind,
            text="👁️ Reveal Live Profile & Spoilers",
            font=("Segoe UI", 10, "bold"),
            bg="#F59E0B",
            fg="#FFFFFF",
            activebackground="#D97706",
            activeforeground="#FFFFFF",
            relief="flat",
            padx=12,
            pady=8,
            cursor="hand2",
            command=self._enable_spoilers,
        )
        self.btn_reveal.pack(fill=tk.X, pady=(10, 0))

        # -------------------------------------------------------------
        # VIEW 2: LIVE PROFILE VIEW (SPOILERS ON)
        # -------------------------------------------------------------
        self.frame_spoilers = tk.Frame(self.results_card, bg=self.c_card)

        ttk.Label(self.frame_spoilers, text="📊 Live Style Breakdown", style="CardTitle.TLabel").pack(anchor="w")
        ttk.Label(
            self.frame_spoilers,
            text="Points distribution across the 5 styles:",
            style="CardMuted.TLabel",
        ).pack(anchor="w", pady=(0, 8))

        # Style Rows (Score, Bar, Percentage)
        self.style_widgets = {}
        for style in STYLES:
            cfg = STYLE_CONFIG[style]
            s_frame = tk.Frame(self.frame_spoilers, bg=self.c_card, pady=2)
            s_frame.pack(fill=tk.X)

            top_row = tk.Frame(s_frame, bg=self.c_card)
            top_row.pack(fill=tk.X)

            lbl_name = tk.Label(
                top_row,
                text=f"{cfg['icon']} {style}",
                font=("Segoe UI", 9, "bold"),
                bg=self.c_card,
                fg=cfg["color"],
            )
            lbl_name.pack(side=tk.LEFT)

            lbl_val = tk.Label(
                top_row,
                text="0 pts (0%)",
                font=("Segoe UI", 9, "bold"),
                bg=self.c_card,
                fg=self.c_text_main,
            )
            lbl_val.pack(side=tk.RIGHT)

            # Custom progress canvas
            bar_c = tk.Canvas(s_frame, height=12, bg="#E2E8F0", highlightthickness=0)
            bar_c.pack(fill=tk.X, pady=(2, 4))

            self.style_widgets[style] = {
                "val_label": lbl_val,
                "canvas": bar_c,
                "color": cfg["color"],
            }

        # Style Insight / Interpretation Box
        tk.Frame(self.frame_spoilers, height=1, bg=self.c_card_border).pack(fill=tk.X, pady=8)

        ttk.Label(self.frame_spoilers, text="💡 Style Interpretation", style="CardTitle.TLabel").pack(anchor="w")
        self.lbl_insight_title = tk.Label(
            self.frame_spoilers,
            text="Answer all questions to see detailed profile analysis.",
            font=("Segoe UI", 9, "bold"),
            bg=self.c_card,
            fg=self.c_primary,
            anchor="w",
            wraplength=340,
            justify="left",
        )
        self.lbl_insight_title.pack(anchor="w", pady=(2, 2))

        self.txt_insight_desc = tk.Label(
            self.frame_spoilers,
            text="",
            font=("Segoe UI", 8),
            bg=self.c_card,
            fg=self.c_text_muted,
            anchor="w",
            wraplength=340,
            justify="left",
        )
        self.txt_insight_desc.pack(anchor="w")

        # Hide Spoilers Button
        btn_hide_spoilers = tk.Button(
            self.frame_spoilers,
            text="🔒 Return to Blind Mode",
            font=("Segoe UI", 9),
            bg="#E2E8F0",
            fg=self.c_text_main,
            relief="flat",
            pady=4,
            command=self._disable_spoilers,
        )
        btn_hide_spoilers.pack(fill=tk.X, pady=(10, 0))

    def _build_bottom_ui(self):
        """Constructs template path selection, output path, and main action buttons."""
        bottom = tk.Frame(self, bg=self.c_card, bd=1, relief="solid", padx=16, pady=10)
        bottom.pack(fill=tk.X, padx=12, pady=(0, 12))

        # Row 1: Template selection
        r1 = tk.Frame(bottom, bg=self.c_card)
        r1.pack(fill=tk.X, pady=2)
        tk.Label(r1, text="Template .docx: ", font=("Segoe UI", 9, "bold"), bg=self.c_card, width=15, anchor="w").pack(side=tk.LEFT)
        entry_tmpl = ttk.Entry(r1, textvariable=self.var_template_path)
        entry_tmpl.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=4)
        ttk.Button(r1, text="Browse...", width=9, command=self._browse_template).pack(side=tk.RIGHT)

        # Row 2: Output selection
        r2 = tk.Frame(bottom, bg=self.c_card)
        r2.pack(fill=tk.X, pady=2)
        tk.Label(r2, text="Save Output to: ", font=("Segoe UI", 9, "bold"), bg=self.c_card, width=15, anchor="w").pack(side=tk.LEFT)
        entry_out = ttk.Entry(r2, textvariable=self.var_output_path)
        entry_out.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=4)
        ttk.Button(r2, text="Browse...", width=9, command=self._browse_output).pack(side=tk.RIGHT)

        # Row 3: Action Buttons Strip
        r3 = tk.Frame(bottom, bg=self.c_card)
        r3.pack(fill=tk.X, pady=(8, 0))

        # Quick utility buttons on the left
        btn_save = ttk.Button(r3, text="💾 Save JSON", width=12, command=self._save_json)
        btn_save.pack(side=tk.LEFT, padx=3)

        btn_load = ttk.Button(r3, text="📂 Load JSON", width=12, command=self._load_json)
        btn_load.pack(side=tk.LEFT, padx=3)

        btn_demo = ttk.Button(r3, text="🎲 Fill Demo", width=12, command=self._fill_demo_data)
        btn_demo.pack(side=tk.LEFT, padx=3)

        btn_clear = ttk.Button(r3, text="🔄 Reset All", width=12, command=self._reset_all)
        btn_clear.pack(side=tk.LEFT, padx=3)

        # Main Action Button on the right
        self.btn_generate = tk.Button(
            r3,
            text="🚀 Generate Filled Word Document (.docx)",
            font=("Segoe UI", 11, "bold"),
            bg=self.c_primary,
            fg="#FFFFFF",
            activebackground=self.c_primary_hover,
            activeforeground="#FFFFFF",
            relief="flat",
            padx=16,
            pady=6,
            cursor="hand2",
            command=self._generate_docx,
        )
        self.btn_generate.pack(side=tk.RIGHT, padx=4)

    def _enable_spoilers(self):
        self.var_show_spoilers.set(True)
        self._on_toggle_spoilers()

    def _disable_spoilers(self):
        self.var_show_spoilers.set(False)
        self._on_toggle_spoilers()

    def _on_toggle_spoilers(self):
        """Called when spoiler toggle changes."""
        self._load_question(self.current_q_idx)
        self._update_all_views()

    def _load_question(self, idx: int):
        """Loads question at index idx (0..19) into the Wizard view."""
        self.current_q_idx = max(0, min(19, idx))
        q = QUESTIONS[self.current_q_idx]
        q_num = q["num"]

        # Update question title and texts
        self.lbl_q_title.config(text=f"Question {q_num} of 20")
        self.lbl_text_a.config(text=q["a"]["text"])
        self.lbl_text_b.config(text=q["b"]["text"])

        # Tag labels with styles ONLY if spoilers are enabled
        style_a = q["a"]["style"]
        style_b = q["b"]["style"]
        cfg_a = STYLE_CONFIG[style_a]
        cfg_b = STYLE_CONFIG[style_b]

        if self.var_show_spoilers.get():
            self.lbl_tag_a.config(text=f"Statement A  [{cfg_a['icon']} {style_a}]")
            self.lbl_tag_b.config(text=f"Statement B  [{cfg_b['icon']} {style_b}]")
        else:
            self.lbl_tag_a.config(text="Statement A")
            self.lbl_tag_b.config(text="Statement B")

        # Current values
        score_a, score_b = self.answers[q_num]
        self.var_score_a.set(score_a)
        self.var_score_b.set(score_b)

        self._updating_slider = True
        try:
            self.slider.set(score_a)
        finally:
            self._updating_slider = False

        self.lbl_score_a_display.config(text=f"{score_a} pts")
        self.lbl_score_b_display.config(text=f"{score_b} pts")
        self.lbl_ratio_display.config(text=f"{score_a} pts  :  {score_b} pts")

        # Update button strip highlight
        for i, btn in enumerate(self.q_buttons):
            qn = i + 1
            answered = self.is_answered[qn]
            if i == self.current_q_idx:
                btn.config(bg=self.c_primary, fg="#FFFFFF", relief="solid", bd=2)
            elif answered:
                btn.config(bg="#BBF7D0", fg="#166534", relief="groove", bd=1)  # Soft green
            else:
                btn.config(bg="#E2E8F0", fg=self.c_text_main, relief="groove", bd=1)

        self._draw_ratio_bar(score_a, score_b)

        # Nav button states
        self.btn_prev.config(state=tk.NORMAL if self.current_q_idx > 0 else tk.DISABLED)
        self.btn_next.config(state=tk.NORMAL if self.current_q_idx < 19 else tk.DISABLED)

    def _on_slider_moved(self, val):
        """Called when slider moves."""
        if self._updating_slider:
            return
        val_int = int(round(float(val)))
        self._set_score_a(val_int, from_slider=True)

    def _set_score_a(self, score_a: int, from_slider: bool = False):
        """Sets score for Option A and automatically sets Option B to (5 - A)."""
        score_a = max(0, min(5, score_a))
        score_b = 5 - score_a

        q_num = QUESTIONS[self.current_q_idx]["num"]
        self.answers[q_num] = [score_a, score_b]
        self.is_answered[q_num] = True

        self.var_score_a.set(score_a)
        self.var_score_b.set(score_b)

        if not from_slider:
            self._updating_slider = True
            try:
                self.slider.set(score_a)
            finally:
                self._updating_slider = False

        self.lbl_score_a_display.config(text=f"{score_a} pts")
        self.lbl_score_b_display.config(text=f"{score_b} pts")
        self.lbl_ratio_display.config(text=f"{score_a} pts  :  {score_b} pts")

        self._draw_ratio_bar(score_a, score_b)
        self._update_all_views()

    def _draw_ratio_bar(self, score_a: int, score_b: int):
        """Renders the colored distribution bar between A and B."""
        self.bar_canvas.delete("all")
        w = self.bar_canvas.winfo_width()
        if w < 10:
            w = 250
        h = 18

        split_x = int(w * (score_a / 5.0))

        # Blue section for A
        if split_x > 0:
            self.bar_canvas.create_rectangle(0, 0, split_x, h, fill="#3B82F6", outline="")
            if score_a > 0:
                self.bar_canvas.create_text(
                    split_x / 2, h / 2, text=f"A: {score_a}", fill="#FFFFFF", font=("Segoe UI", 8, "bold")
                )

        # Green section for B
        if split_x < w:
            self.bar_canvas.create_rectangle(split_x, 0, w, h, fill="#10B981", outline="")
            if score_b > 0:
                self.bar_canvas.create_text(
                    split_x + (w - split_x) / 2,
                    h / 2,
                    text=f"B: {score_b}",
                    fill="#FFFFFF",
                    font=("Segoe UI", 8, "bold"),
                )

    def _prev_question(self):
        if self.current_q_idx > 0:
            self._load_question(self.current_q_idx - 1)

    def _next_question(self):
        if self.current_q_idx < 19:
            self._load_question(self.current_q_idx + 1)

    def _on_grid_spinbox_change(self, q_num: int):
        """Handles edit in Grid mode for Option A."""
        row_data = next((r for r in self.grid_rows if r["q_num"] == q_num), None)
        if not row_data:
            return
        try:
            val_a = int(row_data["spin_a"].get())
        except ValueError:
            val_a = 0
        val_a = max(0, min(5, val_a))
        val_b = 5 - val_a

        row_data["spin_b"].set(val_b)
        self.answers[q_num] = [val_a, val_b]
        self.is_answered[q_num] = True

        if q_num == QUESTIONS[self.current_q_idx]["num"]:
            self._load_question(self.current_q_idx)
        self._update_all_views()

    def _on_grid_spinbox_b_change(self, q_num: int):
        """Handles edit in Grid mode for Option B."""
        row_data = next((r for r in self.grid_rows if r["q_num"] == q_num), None)
        if not row_data:
            return
        try:
            val_b = int(row_data["spin_b"].get())
        except ValueError:
            val_b = 5
        val_b = max(0, min(5, val_b))
        val_a = 5 - val_b

        row_data["spin_a"].set(val_a)
        self.answers[q_num] = [val_a, val_b]
        self.is_answered[q_num] = True

        if q_num == QUESTIONS[self.current_q_idx]["num"]:
            self._load_question(self.current_q_idx)
        self._update_all_views()

    def _update_all_views(self):
        """Syncs all counters, grid rows, and live score breakdown."""
        # 1. Update progress metrics
        answered_cnt = sum(1 for a in self.is_answered.values() if a)
        self.lbl_progress_summary.config(
            text=f"{answered_cnt} / 20 Answered"
            + (" (Ready to generate!)" if answered_cnt == 20 else "")
        )

        # 2. Update jump buttons
        for i, btn in enumerate(self.q_buttons):
            qn = i + 1
            if i == self.current_q_idx:
                btn.config(bg=self.c_primary, fg="#FFFFFF")
            elif self.is_answered[qn]:
                btn.config(bg="#BBF7D0", fg="#166534")
            else:
                btn.config(bg="#E2E8F0", fg=self.c_text_main)

        # 3. Sync grid spinboxes
        for r in self.grid_rows:
            qn = r["q_num"]
            sa, sb = self.answers[qn]
            if r["spin_a"].get() != str(sa):
                r["spin_a"].set(sa)
            if r["spin_b"].get() != str(sb):
                r["spin_b"].set(sb)

        # 4. Compute style scores
        normalized = normalize_answers(self.answers)
        style_scores = compute_style_scores(normalized)
        total_pts = sum(style_scores.values())

        self.lbl_total_points.config(
            text=f"Total Points: {total_pts} / 100"
            + ("  ✅" if total_pts == 100 and answered_cnt == 20 else "")
        )

        show_spoilers = self.var_show_spoilers.get()

        # 5. Toggle Views: Blind Mode vs Spoiler Mode
        if not show_spoilers:
            self.frame_spoilers.pack_forget()
            self.frame_blind.pack(fill=tk.BOTH, expand=True)

            self.lbl_dominant_badge.config(
                text="🔒 Blind Mode Active",
                fg=self.c_text_muted,
            )

            pct = int((answered_cnt / 20.0) * 100)
            self.lbl_blind_completion.config(text=f"Completion: {answered_cnt} / 20 ({pct}%)")
            self.blind_progressbar["value"] = answered_cnt

            rem = 20 - answered_cnt
            if rem == 0:
                self.lbl_blind_status.config(
                    text="🎉 All 20 questions complete! Ready to reveal or export docx.",
                    fg=self.c_success,
                    font=("Segoe UI", 9, "bold"),
                )
                self.btn_reveal.config(text="🌟 Reveal Full Negotiation Profile", bg=self.c_success)
            else:
                self.lbl_blind_status.config(
                    text=f"{rem} question(s) remaining",
                    fg=self.c_text_muted,
                    font=("Segoe UI", 9),
                )
                self.btn_reveal.config(text="👁️ Reveal Live Profile & Spoilers", bg="#F59E0B")

        else:
            self.frame_blind.pack_forget()
            self.frame_spoilers.pack(fill=tk.BOTH, expand=True)

            dominant_style, max_score = get_dominant_style(style_scores)
            if answered_cnt > 0:
                self.lbl_dominant_badge.config(
                    text=f"Dominant: {dominant_style} ({max_score} pts)",
                    fg=STYLE_CONFIG[dominant_style]["color"],
                )
                cfg = STYLE_CONFIG[dominant_style]
                self.lbl_insight_title.config(
                    text=f"{cfg['icon']} Your Primary Style: {dominant_style}",
                    fg=cfg["color"],
                )
                self.txt_insight_desc.config(
                    text=f"{cfg['description']}\n\n"
                    f"• Strengths: {cfg['strengths']}\n\n"
                    f"• Potential Pitfalls: {cfg['pitfalls']}\n\n"
                    f"• Best Used When: {cfg['when_to_use']}"
                )
            else:
                self.lbl_dominant_badge.config(text="Dominant: -", fg=self.c_text_muted)

            # Update Style Bar Charts
            for style, w in self.style_widgets.items():
                sc = style_scores[style]
                pct = (sc / 100.0) * 100.0
                w["val_label"].config(text=f"{sc} pts ({pct:.0f}%)")

                c = w["canvas"]
                c.delete("all")
                cw = c.winfo_width()
                if cw < 10:
                    cw = 310
                ch = 12

                bar_w = int(cw * (sc / 40.0))  # Max possible for 1 style is 40
                if bar_w > 0:
                    c.create_rectangle(0, 0, bar_w, ch, fill=w["color"], outline="")

    def _auto_update_output_path(self):
        """Automatically suggests output filename based on Name and NIM."""
        if not self.var_output_path.get() or "Negotiation_Styles_Analysis" in self.var_output_path.get():
            name_part = self.var_name.get().strip().replace(" ", "_") or "User"
            nim_part = self.var_nim.get().strip()
            suffix = f"_{nim_part}" if nim_part else ""
            default_out = os.path.join(
                self.app_dir, f"Negotiation_Styles_Analysis_{name_part}{suffix}.docx"
            )
            self.var_output_path.set(default_out)

    def _browse_template(self):
        filetypes = [("Word Documents", "*.docx"), ("All Files", "*.*")]
        selected = filedialog.askopenfilename(
            title="Select Original Template Docx",
            initialfile=self.var_template_path.get(),
            filetypes=filetypes,
        )
        if selected:
            self.var_template_path.set(selected)

    def _browse_output(self):
        filetypes = [("Word Documents", "*.docx"), ("All Files", "*.*")]
        selected = filedialog.asksaveasfilename(
            title="Save Filled Word Document As",
            initialfile=os.path.basename(self.var_output_path.get() or "Negotiation_Styles_Analysis.docx"),
            filetypes=filetypes,
        )
        if selected:
            if not selected.endswith(".docx"):
                selected += ".docx"
            self.var_output_path.set(selected)

    def _save_json(self):
        """Saves current answers and metadata to a JSON file."""
        filetypes = [("JSON Files", "*.json"), ("All Files", "*.*")]
        name_clean = self.var_name.get().strip().replace(" ", "_") or "answers"
        default_file = f"negotiation_answers_{name_clean}.json"
        save_path = filedialog.asksaveasfilename(
            title="Save Assessment State",
            initialfile=default_file,
            filetypes=filetypes,
        )
        if not save_path:
            return

        data_to_save = {
            "name": self.var_name.get(),
            "nim": self.var_nim.get(),
            "answers": self.answers,
            "is_answered": self.is_answered,
        }
        try:
            with open(save_path, "w", encoding="utf-8") as f:
                json.dump(data_to_save, f, indent=2)
            messagebox.showinfo("Saved", f"Assessment progress successfully saved to:\n{save_path}")
        except Exception as e:
            messagebox.showerror("Save Error", f"Failed to save JSON:\n{e}")

    def _load_json(self):
        """Loads answers from a JSON file."""
        filetypes = [("JSON Files", "*.json"), ("All Files", "*.*")]
        load_path = filedialog.askopenfilename(title="Load Assessment State", filetypes=filetypes)
        if not load_path:
            return

        try:
            with open(load_path, "r", encoding="utf-8") as f:
                loaded = json.load(f)

            if "name" in loaded:
                self.var_name.set(loaded["name"])
            if "nim" in loaded:
                self.var_nim.set(loaded["nim"])

            if "answers" in loaded:
                for k, v in loaded["answers"].items():
                    self.answers[int(k)] = list(v)
            if "is_answered" in loaded:
                for k, v in loaded["is_answered"].items():
                    self.is_answered[int(k)] = bool(v)
            else:
                for k in self.answers:
                    self.is_answered[k] = True

            self._load_question(0)
            self._update_all_views()
            self._auto_update_output_path()
            messagebox.showinfo("Loaded", "Assessment data successfully loaded!")
        except Exception as e:
            messagebox.showerror("Load Error", f"Failed to load JSON file:\n{e}")

    def _fill_demo_data(self):
        """Fills realistic demo answers for fast testing or presentation."""
        demo_a = [3, 2, 1, 4, 3, 2, 1, 4, 3, 4, 2, 1, 3, 2, 4, 1, 3, 2, 4, 1]
        for idx, sa in enumerate(demo_a):
            qn = idx + 1
            sb = 5 - sa
            self.answers[qn] = [sa, sb]
            self.is_answered[qn] = True

        if not self.var_name.get():
            self.var_name.set("Sample Student")
        if not self.var_nim.get():
            self.var_nim.set("29124001")

        self._load_question(self.current_q_idx)
        self._update_all_views()
        self._auto_update_output_path()
        messagebox.showinfo("Demo Filled", "All 20 questions filled with sample test profile!")

    def _reset_all(self):
        """Resets all answers."""
        if not messagebox.askyesno("Reset", "Are you sure you want to clear all answers?"):
            return
        for q in QUESTIONS:
            self.answers[q["num"]] = [0, 5]
            self.is_answered[q["num"]] = False

        self._load_question(0)
        self._update_all_views()

    def _generate_docx(self):
        """Validates inputs, generates filled docx from template, and prompts to open."""
        # Validate questions
        unanswered = [qn for qn, ans in self.is_answered.items() if not ans]
        if unanswered:
            msg = f"You have {len(unanswered)} unanswered question(s): {unanswered[:5]}"
            if len(unanswered) > 5:
                msg += "..."
            msg += "\n\nWould you like to proceed anyway using current values?"
            if not messagebox.askyesno("Incomplete Questionnaire", msg):
                self._load_question(unanswered[0] - 1)
                return

        # Validate template
        tmpl = self.var_template_path.get().strip()
        if not os.path.exists(tmpl):
            messagebox.showerror(
                "Template Not Found",
                f"Could not locate the template file at:\n{tmpl}\n\nPlease click 'Browse...' to select the original docx file.",
            )
            return

        # Prepare output path
        self._auto_update_output_path()
        out = self.var_output_path.get().strip()
        if not out:
            out = os.path.join(self.app_dir, "Negotiation_Styles_Analysis_Filled.docx")
            self.var_output_path.set(out)

        name = self.var_name.get().strip()
        nim = self.var_nim.get().strip()

        try:
            res = fill_negotiation_docx(
                template_path=tmpl,
                output_path=out,
                name=name,
                nim=nim,
                answers=self.answers,
                sum_row=9,
            )

            # Success Dialog with custom options
            self._show_success_dialog(res)

        except Exception as e:
            messagebox.showerror("Generation Error", f"An error occurred while generating the document:\n{e}")

    def _show_success_dialog(self, res: dict):
        """Shows custom modal with options to open the generated docx or folder."""
        dialog = tk.Toplevel(self)
        dialog.title("Document Generated Successfully!")
        dialog.geometry("540x360")
        dialog.resizable(False, False)
        dialog.transient(self)
        dialog.grab_set()

        content = tk.Frame(dialog, bg="#FFFFFF", padx=24, pady=20)
        content.pack(fill=tk.BOTH, expand=True)

        tk.Label(
            content,
            text="🎉 Document Generated Successfully!",
            font=("Segoe UI", 14, "bold"),
            fg=self.c_success,
            bg="#FFFFFF",
        ).pack(anchor="w", pady=(0, 6))

        out_path = res["output_path"]
        tk.Label(
            content,
            text=f"Saved to:\n{out_path}",
            font=("Segoe UI", 9),
            fg=self.c_text_muted,
            bg="#FFFFFF",
            justify="left",
            wraplength=480,
        ).pack(anchor="w", pady=(0, 10))

        # Summary box
        s_box = tk.Frame(content, bg="#F8FAFC", bd=1, relief="solid", padx=12, pady=10)
        s_box.pack(fill=tk.X, pady=(0, 16))

        dom_style = res["dominant_style"]
        dom_score = res["dominant_score"]
        cfg = STYLE_CONFIG[dom_style]

        tk.Label(
            s_box,
            text=f"Student: {res['name'] or 'N/A'} (NIM: {res['nim'] or 'N/A'})",
            font=("Segoe UI", 9, "bold"),
            bg="#F8FAFC",
        ).pack(anchor="w")

        tk.Label(
            s_box,
            text=f"Dominant Negotiation Style: {cfg['icon']} {dom_style} ({dom_score} pts)",
            font=("Segoe UI", 10, "bold"),
            fg=cfg["color"],
            bg="#F8FAFC",
        ).pack(anchor="w", pady=2)

        # Style score breakdown line
        scores_line = "  •  ".join([f"{s[:4]}: {sc}" for s, sc in res["style_scores"].items()])
        tk.Label(s_box, text=f"Scores: {scores_line}", font=("Segoe UI", 8), fg=self.c_text_muted, bg="#F8FAFC").pack(anchor="w")

        # Buttons
        btn_frame = tk.Frame(content, bg="#FFFFFF")
        btn_frame.pack(fill=tk.X, pady=(6, 0))

        def open_file():
            try:
                os.startfile(out_path)
            except Exception as e:
                messagebox.showerror("Error", f"Could not open file: {e}")

        def open_folder():
            try:
                folder = os.path.dirname(os.path.abspath(out_path))
                subprocess.Popen(f'explorer "{folder}"')
            except Exception as e:
                messagebox.showerror("Error", f"Could not open folder: {e}")

        btn_open = tk.Button(
            btn_frame,
            text="📄 Open Document in Word",
            font=("Segoe UI", 10, "bold"),
            bg=self.c_primary,
            fg="#FFFFFF",
            padx=12,
            pady=6,
            relief="flat",
            cursor="hand2",
            command=open_file,
        )
        btn_open.pack(side=tk.LEFT, padx=(0, 6))

        btn_fold = tk.Button(
            btn_frame,
            text="📁 Show in Folder",
            font=("Segoe UI", 10),
            bg="#E2E8F0",
            fg=self.c_text_main,
            padx=12,
            pady=6,
            relief="flat",
            cursor="hand2",
            command=open_folder,
        )
        btn_fold.pack(side=tk.LEFT)

        btn_close = tk.Button(
            btn_frame,
            text="Close",
            font=("Segoe UI", 10),
            bg="#F1F5F9",
            fg=self.c_text_muted,
            padx=12,
            pady=6,
            relief="flat",
            command=dialog.destroy,
        )
        btn_close.pack(side=tk.RIGHT)


def main():
    app = NegotiationApp()
    app.mainloop()


if __name__ == "__main__":
    main()
