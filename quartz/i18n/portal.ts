import { ValidLocale } from "./index"

export interface PortalTranslation {
  nav: {
    explore: string
    courses: string
    rabuan: string
    concepts: string
    navMenuAria: string
    navDialogAria: string
    homeTitle: string
    homeAria: string
  }
  controls: {
    toggleGrid: string
    enableGrid: string
    disableGrid: string
    collapseSidebar: string
    expandSidebar: string
    readerModeOn: string
    readerModeOff: string
    globalGraphAria: string
  }
  breadcrumbs: {
    home: string
  }
  courseSwitcher: {
    navAria: string
    courseLabel: string
    selectCourseAria: string
    weekLabel: string
    selectWeekAria: string
    overview: string
    overviewNoWeeks: string
    weekPrefix: string
    midTermPrefix: string
    midTermDefault: string
  }
  footer: {
    creditTitle: string
    authorTitle: string
    disclaimer: string
  }
  tts: {
    togglePlayerAria: string
    listenPageTitle: string
    listenArticle: string
    minAudio: (minutes: number) => string
    listenArticleAria: (duration: string) => string
    listenArticleTitle: string
    nowPlaying: string
    selectArticle: string
    noTrackSelected: string
    prevParagraph: string
    nextParagraph: string
    playAudio: string
    pauseAudio: string
    femaleLabel: string
    maleLabel: string
    femaleTitle: string
    maleTitle: string
    speedTitle: string
    minimizeTitle: string
    minimizeAria: string
    closeStopTitle: string
    scrubberAria: string
  }
  splitView: {
    dividerTitle: string
    detailViewAria: string
    defaultBadge: string
    backTitle: string
    forwardTitle: string
    swapTitle: string
    openFullTitle: string
    closeTitle: string
    loadingPrefix: string
    loadErrorTitle: string
    loadErrorBody: string
    openPageDirectly: string
    badges: Record<string, string>
  }
  languageSwitcher: {
    activeCode: "EN" | "ID"
    targetCode: "ID" | "EN"
    ariaLabel: string
    tooltip: string
  }
  translationNotice: {
    badge: string
    message: string
    switchCta: string
  }
}

const enPortal: PortalTranslation = {
  nav: {
    explore: "Explore",
    courses: "Courses",
    rabuan: "Rabuan",
    concepts: "Concepts",
    navMenuAria: "Navigation sections menu",
    navDialogAria: "Navigation menu",
    homeTitle: "Academic Portal Home",
    homeAria: "Academic Portal Home",
  },
  controls: {
    toggleGrid: "Toggle background grid",
    enableGrid: "Enable background grid",
    disableGrid: "Disable background grid",
    collapseSidebar: "Collapse sidebar (Ctrl+\\)",
    expandSidebar: "Expand sidebar (Ctrl+\\)",
    readerModeOn: "Reader mode: ON",
    readerModeOff: "Reader mode: OFF",
    globalGraphAria: "Global Graph",
  },
  breadcrumbs: {
    home: "Home",
  },
  courseSwitcher: {
    navAria: "Course and week navigator",
    courseLabel: "Course",
    selectCourseAria: "Select course",
    weekLabel: "Week",
    selectWeekAria: "Select week",
    overview: "Course Overview",
    overviewNoWeeks: "Course Overview (No weeks yet)",
    weekPrefix: "Week",
    midTermPrefix: "Mid-Term",
    midTermDefault: "Mid-Term Exam Dossier",
  },
  footer: {
    creditTitle: "Made with love & caffeine.",
    authorTitle: "The P3MD Insignia: Design Story & Symbolism",
    disclaimer:
      "Independent cohort knowledge base. Official course slides and faculty materials are the proprietary intellectual property of SBM ITB and are intentionally not hosted on this platform; content consists of student frameworks and synthesized notes.",
  },
  tts: {
    togglePlayerAria: "Toggle Text-to-Speech Player",
    listenPageTitle: "Listen to page (Text-to-Speech)",
    listenArticle: "Listen to article",
    minAudio: (minutes) => `${minutes} min audio`,
    listenArticleAria: (duration) => `Listen to article (${duration})`,
    listenArticleTitle: "Listen to this article with Text-to-Speech",
    nowPlaying: "Now Playing",
    selectArticle: "Select an article to listen",
    noTrackSelected: "No track selected",
    prevParagraph: "Previous paragraph",
    nextParagraph: "Next paragraph",
    playAudio: "Play audio",
    pauseAudio: "Pause audio",
    femaleLabel: "♀ Female",
    maleLabel: "♂ Male",
    femaleTitle: "Voice: Female. Click to toggle.",
    maleTitle: "Voice: Male. Click to toggle.",
    speedTitle: "Playback speed. Click to change.",
    minimizeTitle: "Minimize player (keep listening in background)",
    minimizeAria: "Minimize player",
    closeStopTitle: "Stop playback and close player",
    scrubberAria: "Audio scrubber",
  },
  splitView: {
    dividerTitle: "Drag to resize, double-click to reset (50%)",
    detailViewAria: "Detail view",
    defaultBadge: "Concept",
    backTitle: "Previous in history",
    forwardTitle: "Next in history",
    swapTitle: "Swap sides",
    openFullTitle: "Open full page",
    closeTitle: "Close split view (Esc)",
    loadingPrefix: "Loading",
    loadErrorTitle: "Error",
    loadErrorBody: "Could not load article.",
    openPageDirectly: "Open page directly",
    badges: {
      Concept: "Concept",
      Entity: "Entity",
      Index: "Index",
      Case: "Case",
      Assignment: "Assignment",
      Course: "Course",
      Rabuan: "Rabuan",
      ALP: "ALP",
      Program: "Program",
      Note: "Note",
    },
  },
  languageSwitcher: {
    activeCode: "EN",
    targetCode: "ID",
    ariaLabel: "Switch language to Bahasa Indonesia",
    tooltip: "Switch to Bahasa Indonesia",
  },
  translationNotice: {
    badge: "English Source",
    message: "This page is currently in English. Bahasa Indonesia translation is in progress.",
    switchCta: "Open English version →",
  },
}

const idPortal: PortalTranslation = {
  nav: {
    explore: "Jelajahi",
    courses: "Mata Kuliah",
    rabuan: "Rabuan",
    concepts: "Konsep",
    navMenuAria: "Menu bagian navigasi",
    navDialogAria: "Menu navigasi",
    homeTitle: "Beranda Portal Akademik",
    homeAria: "Beranda Portal Akademik",
  },
  controls: {
    toggleGrid: "Aktifkan/nonaktifkan kisi latar",
    enableGrid: "Tampilkan kisi latar",
    disableGrid: "Sembunyikan kisi latar",
    collapseSidebar: "Sembunyikan sidebar (Ctrl+\\)",
    expandSidebar: "Tampilkan sidebar (Ctrl+\\)",
    readerModeOn: "Mode pembaca: AKTIF",
    readerModeOff: "Mode pembaca: NONAKTIF",
    globalGraphAria: "Grafik Global",
  },
  breadcrumbs: {
    home: "Beranda",
  },
  courseSwitcher: {
    navAria: "Navigasi mata kuliah dan minggu",
    courseLabel: "Mata Kuliah",
    selectCourseAria: "Pilih mata kuliah",
    weekLabel: "Minggu",
    selectWeekAria: "Pilih minggu",
    overview: "Ikhtisar Mata Kuliah",
    overviewNoWeeks: "Ikhtisar Mata Kuliah (Belum ada minggu)",
    weekPrefix: "Minggu",
    midTermPrefix: "UTS",
    midTermDefault: "Dossier Ujian Tengah Semester",
  },
  footer: {
    creditTitle: "Dibuat dengan sepenuh hati & kafein.",
    authorTitle: "Insignia P3MD: Kisah Desain & Simbolisme",
    disclaimer:
      "Basis pengetahuan independen angkatan. Slide resmi perkuliahan dan materi pengajar merupakan hak kekayaan intelektual SBM ITB dan tidak dihosting di platform ini; konten terdiri atas kerangka kerja dan catatan sintesis peserta.",
  },
  tts: {
    togglePlayerAria: "Buka/tutup pemutar suara",
    listenPageTitle: "Dengarkan halaman (Text-to-Speech)",
    listenArticle: "Dengarkan artikel",
    minAudio: (minutes) => `audio ${minutes} mnt`,
    listenArticleAria: (duration) => `Dengarkan artikel (${duration})`,
    listenArticleTitle: "Dengarkan artikel ini dengan Text-to-Speech",
    nowPlaying: "Sedang Diputar",
    selectArticle: "Pilih artikel untuk didengarkan",
    noTrackSelected: "Belum ada trek dipilih",
    prevParagraph: "Paragraf sebelumnya",
    nextParagraph: "Paragraf berikutnya",
    playAudio: "Putar audio",
    pauseAudio: "Jeda audio",
    femaleLabel: "♀ Perempuan",
    maleLabel: "♂ Laki-laki",
    femaleTitle: "Suara: Perempuan. Klik untuk mengganti.",
    maleTitle: "Suara: Laki-laki. Klik untuk mengganti.",
    speedTitle: "Kecepatan putar. Klik untuk mengubah.",
    minimizeTitle: "Perkecil pemutar (tetap putar di latar)",
    minimizeAria: "Perkecil pemutar",
    closeStopTitle: "Hentikan pemutaran dan tutup pemutar",
    scrubberAria: "Penggeser posisi audio",
  },
  splitView: {
    dividerTitle: "Seret untuk ubah ukuran, klik ganda untuk reset (50%)",
    detailViewAria: "Tampilan detail",
    defaultBadge: "Konsep",
    backTitle: "Riwayat sebelumnya",
    forwardTitle: "Riwayat berikutnya",
    swapTitle: "Tukar sisi",
    openFullTitle: "Buka halaman penuh",
    closeTitle: "Tutup tampilan belah (Esc)",
    loadingPrefix: "Memuat",
    loadErrorTitle: "Gagal memuat",
    loadErrorBody: "Tidak dapat memuat artikel.",
    openPageDirectly: "Buka halaman langsung",
    badges: {
      Concept: "Konsep",
      Entity: "Entitas",
      Index: "Indeks",
      Case: "Kasus",
      Assignment: "Tugas",
      Course: "Mata Kuliah",
      Rabuan: "Rabuan",
      ALP: "ALP",
      Program: "Program",
      Note: "Catatan",
    },
  },
  languageSwitcher: {
    activeCode: "ID",
    targetCode: "EN",
    ariaLabel: "Ganti bahasa ke English",
    tooltip: "Ganti ke English",
  },
  translationNotice: {
    badge: "Belum diterjemahkan",
    message:
      "Halaman ini masih dalam bahasa Inggris. Terjemahan Bahasa Indonesia sedang disiapkan.",
    switchCta: "Buka versi English →",
  },
}

export function portalI18n(locale?: ValidLocale | string): PortalTranslation {
  if (locale && locale.toLowerCase().startsWith("id")) {
    return idPortal
  }
  return enPortal
}
