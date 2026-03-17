const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const animatedTextSelector =
  ".hero h1, .hero-copy, .section-heading h2, .timeline-item p, .work-card h3, .work-card p, .skills-grid h3, .skills-grid p, .language-panel h3, .toolstack-title";

const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const splitTextToWords = (element) => {
  if (element.dataset.wordsReady === "true") {
    return;
  }

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.nodeValue && node.nodeValue.trim().length > 0
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  let wordIndex = 0;

  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    const parts = textNode.nodeValue.split(/(\s+)/);

    parts.forEach((part) => {
      if (!part) {
        return;
      }

      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }

      const word = document.createElement("span");
      word.className = "text-word";
      word.style.setProperty("--word-index", String(wordIndex));
      word.textContent = part;
      fragment.appendChild(word);
      wordIndex += 1;
    });

    textNode.parentNode?.replaceChild(fragment, textNode);
  });

  element.classList.add("text-animate");
  element.dataset.wordsReady = "true";
};

const i18n = {
  en: {
    nav_experience: "Experience",
    nav_work: "Work",
    nav_gallery: "Gallery",
    nav_showreel: "Showreel",
    nav_skills: "Skills",
    nav_contact: "Contact",
    hero_eyebrow: "Unreal Engine Developer",
    hero_title: 'Building immersive <span>AR/VR worlds</span> with real impact.',
    hero_copy:
      "I design and ship high-impact interactive experiences across VR, AR, PC, mobile, and iOS, using both C++ and Blueprints where each fits best, with a strong focus on simulation quality, user clarity, and production reliability.",
    hero_watch: "Watch Showreel",
    hero_resume: "Download Resume",
    profile_role: "Lead AR/VR Developer",
    profile_link: "View LinkedIn",
    metric_arvr: "AR/VR development",
    metric_unreal: "C++ and Blueprint gameplay systems",
    metric_projects: "Completed projects delivered",
    metric_cross_title: "Cross Platform",
    metric_cross_desc: "PC, Mobile, iOS, VR, Cinematics",
    exp_eyebrow: "Experience",
    exp_title: "Delivery across startups, freelance, and leadership roles",
    work_eyebrow: "Selected Work",
    work_title: "Examples of shipped AR/VR and Unreal projects",
    work_reel: "View Project Reel",
    gallery_eyebrow: "Project Gallery",
    gallery_title: "Curated visuals from production work",
    showreel_eyebrow: "Featured Video",
    showreel_title: "Showreel 2024",
    skills_eyebrow: "Core Expertise",
    skills_title: "Production ready, immersion first",
    skill_unreal_title: "Unreal Engine",
    skill_unreal_desc:
      "Advanced UE4/UE5 workflows with practical C++ and Blueprint implementation for gameplay, interaction, and systems design.",
    skill_arvr_title: "AR/VR Simulations",
    skill_arvr_desc: "Scenario-based simulations for training and high-stakes environments.",
    skill_creative_title: "Creative & Post Pipeline",
    skill_creative_desc:
      "End-to-end visual prep and delivery with Adobe Suite tools, including scene polish and edit-ready media outputs.",
    skill_content_title: "Unreal Content Workflows",
    skill_content_desc:
      "Practical in-engine content work including mesh cleanup, Control Rig animation passes, and Unreal modeling tool workflows.",
    skill_cross_title: "Cross-Platform Delivery",
    skill_cross_desc:
      "From PC and mobile to iOS and VR hardware deployments, including profiling and optimization for stable runtime performance.",
    skill_pm_title: "Project Management",
    skill_pm_desc:
      "Structured planning, milestone tracking, and stakeholder coordination to keep technical delivery focused and reliable.",
    skill_ai_title: "AI Coding Workflows",
    skill_ai_desc:
      "Strong AI-assisted development workflow for rapid prototyping, refactors, debugging, and production-quality iteration.",
    skill_team_title: "Collaboration & Delivery Leadership",
    skill_team_desc:
      "Hands-on direction from concept to shipping milestones with practical Git/Perforce workflows and basic multiplayer implementation support.",
    toolstack_title: "Tool Stack",
    tool_unreal: "Unreal Engine",
    tool_adobe: "Adobe Suite",
    tool_ps: "Photoshop",
    tool_pr: "Premiere Pro",
    tool_codex: "Codex",
    tool_chatgpt: "ChatGPT",
    tool_claude: "Claude",
    tool_gemini: "Gemini",
    tool_git: "Git",
    tool_perforce: "Perforce",
    tool_360: "360 Video Editing",
    language_title: "Language Proficiency",
    contact_eyebrow: "Contact",
    contact_title: "Let's build something immersive together",
    contact_linkedin: "LinkedIn Profile",
    footer_text: "Larion Siments - Unreal Engine Developer",
  },
  he: {
    nav_experience: "ניסיון",
    nav_work: "עבודות",
    nav_gallery: "גלריה",
    nav_showreel: "שואוריל",
    nav_skills: "יכולות",
    nav_contact: "יצירת קשר",
    hero_eyebrow: "מפתח Unreal Engine",
    hero_title: 'בונה חוויות <span>AR/VR</span> אימרסיביות עם השפעה אמיתית.',
    hero_copy:
      "אני מתכנן ומספק חוויות אינטראקטיביות ברמת ביצוע גבוהה עבור VR, AR, PC, מובייל ו-iOS, תוך שילוב מדויק בין C++ ל-Blueprints לפי הצורך, עם דגש על איכות סימולציה, בהירות למשתמש ואמינות בפרודקשן.",
    hero_watch: "צפה בשואוריל",
    hero_resume: "הורד קורות חיים",
    profile_role: "מוביל פיתוח AR/VR",
    profile_link: "צפה בלינקדאין",
    metric_arvr: "פיתוח AR/VR",
    metric_unreal: "מערכות משחק ב-C++ וב-Blueprint",
    metric_projects: "פרויקטים שהושלמו ונמסרו",
    metric_cross_title: "מולטי-פלטפורם",
    metric_cross_desc: "PC, מובייל, iOS, VR, סינמטיקס",
    exp_eyebrow: "ניסיון",
    exp_title: "מסירה מקצועית בסטארטאפים, פרילנס והובלת צוותים",
    work_eyebrow: "עבודות נבחרות",
    work_title: "דוגמאות לפרויקטי AR/VR ו-Unreal שעלו לאוויר",
    work_reel: "צפה בריל הפרויקטים",
    gallery_eyebrow: "גלריית פרויקטים",
    gallery_title: "ויזואלים נבחרים מעבודות הפקה",
    showreel_eyebrow: "וידאו מוביל",
    showreel_title: "שואוריל 2024",
    skills_eyebrow: "מומחיות מרכזית",
    skills_title: "מוכן לפרודקשן, ממוקד אימרסיה",
    skill_unreal_title: "Unreal Engine",
    skill_unreal_desc: "עבודה מתקדמת ב-UE4/UE5 עם שילוב פרקטי של C++ ו-Blueprint למכניקות, אינטראקציה ומערכות.",
    skill_arvr_title: "סימולציות AR/VR",
    skill_arvr_desc: "סימולציות מבוססות תרחיש לאימונים ולסביבות עם רמת חשיבות גבוהה.",
    skill_creative_title: "קריאייטיב ופוסט",
    skill_creative_desc: "תהליך מלא של הכנה ויזואלית ומסירה בעזרת Adobe Suite, כולל ליטוש סצנות והפקת מדיה מוכנה לעריכה.",
    skill_content_title: "תהליכי תוכן בתוך Unreal",
    skill_content_desc: "עבודה פרקטית בתוך המנוע כולל עריכת Mesh, פאסים של אנימציה עם Control Rig ועבודה עם כלי המידול של Unreal.",
    skill_cross_title: "מסירה רב-פלטפורמית",
    skill_cross_desc: "מ-PC ומובייל ועד iOS וחומרות VR, כולל פרופיילינג ואופטימיזציה ליציבות ביצועים בזמן אמת.",
    skill_pm_title: "ניהול פרויקטים",
    skill_pm_desc: "תכנון מובנה, ניהול אבני דרך וסנכרון בעלי עניין לשמירה על מסירה טכנית מדויקת ואמינה.",
    skill_ai_title: "תהליכי פיתוח עם AI",
    skill_ai_desc: "תהליך פיתוח חזק עם AI לאבטיפוס מהיר, רפקטורינג, דיבאג ואיטרציה ברמת פרודקשן.",
    skill_team_title: "שיתופיות והובלת מסירה",
    skill_team_desc: "הובלה מעשית משלב הקונספט ועד למסירה, כולל עבודה עם Git/Perforce ותמיכה בסיסית בפיצ'רים של מולטיפלייר.",
    toolstack_title: "סט כלי עבודה",
    tool_unreal: "Unreal Engine",
    tool_adobe: "Adobe Suite",
    tool_ps: "Photoshop",
    tool_pr: "Premiere Pro",
    tool_codex: "Codex",
    tool_chatgpt: "ChatGPT",
    tool_claude: "Claude",
    tool_gemini: "Gemini",
    tool_git: "Git",
    tool_perforce: "Perforce",
    tool_360: "עריכת וידאו 360",
    language_title: "רמת שפות",
    contact_eyebrow: "יצירת קשר",
    contact_title: "בואו נבנה משהו אימרסיבי ביחד",
    contact_linkedin: "פרופיל לינקדאין",
    footer_text: "לריון סימנטס - מפתח Unreal Engine",
  },
};

const i18nNodes = Array.from(document.querySelectorAll("[data-i18n]"));
const langToggle = document.querySelector("[data-lang-toggle]");
const langLabel = document.querySelector("[data-lang-label]");
let activeLanguage = "en";

const unwrapAnimatedWords = (element) => {
  const words = Array.from(element.querySelectorAll(".text-word"));
  if (words.length === 0) {
    return;
  }
  words.forEach((word) => {
    word.replaceWith(document.createTextNode(word.textContent || ""));
  });
  element.normalize();
};

const refreshAnimatedElement = (element) => {
  if (prefersReducedMotion || !element.matches(animatedTextSelector)) {
    return;
  }
  unwrapAnimatedWords(element);
  element.dataset.wordsReady = "false";
  element.classList.remove("text-animate", "is-visible");
  splitTextToWords(element);
  element.classList.add("is-visible");
};

const updateLanguageToggleUi = () => {
  if (!langLabel || !langToggle) {
    return;
  }
  const nextLanguage = activeLanguage === "en" ? "HE" : "EN";
  langLabel.textContent = nextLanguage;
  const targetLabel = activeLanguage === "en" ? "Switch language to Hebrew" : "Switch language to English";
  langToggle.setAttribute("aria-label", targetLabel);
};

const applyLanguage = (lang, options = {}) => {
  const refreshAnimated = options.refreshAnimated === true;
  activeLanguage = lang === "he" ? "he" : "en";
  const dict = i18n[activeLanguage];

  i18nNodes.forEach((node) => {
    const key = node.dataset.i18n;
    const translated = dict[key] ?? i18n.en[key];
    if (!translated) {
      return;
    }

    if (node.dataset.i18nHtml === "true") {
      node.innerHTML = translated;
    } else {
      node.textContent = translated;
    }

    if (refreshAnimated) {
      refreshAnimatedElement(node);
    }
  });

  document.documentElement.lang = activeLanguage === "he" ? "he" : "en";
  document.documentElement.dir = activeLanguage === "he" ? "rtl" : "ltr";
  document.body.classList.toggle("lang-he", activeLanguage === "he");
  updateLanguageToggleUi();
  window.localStorage.setItem("portfolio_lang", activeLanguage);
};

const savedLanguage = window.localStorage.getItem("portfolio_lang");
const browserIsHebrew = window.navigator.language?.toLowerCase().startsWith("he");
const initialLanguage =
  savedLanguage === "en" || savedLanguage === "he" ? savedLanguage : browserIsHebrew ? "he" : "en";
applyLanguage(initialLanguage);

langToggle?.addEventListener("click", () => {
  applyLanguage(activeLanguage === "en" ? "he" : "en", { refreshAnimated: true });
});

const textObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.28,
    rootMargin: "0px 0px -24px 0px",
  }
);

const textAnimationTargets = document.querySelectorAll(animatedTextSelector);

textAnimationTargets.forEach((target) => {
  splitTextToWords(target);
  if (prefersReducedMotion) {
    target.classList.add("is-visible");
    return;
  }
  textObserver.observe(target);
});

const countupItems = document.querySelectorAll("[data-countup-target]");

const animateCount = (element) => {
  const target = Number(element.dataset.countupTarget || 0);
  const durationMs = 1400;
  let startTime = null;

  const tick = (timestamp) => {
    if (!startTime) {
      startTime = timestamp;
    }

    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const eased = 1 - (1 - progress) * (1 - progress);
    const currentValue = Math.round(target * eased);

    element.textContent = String(currentValue);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    } else {
      element.textContent = String(target);
    }
  };

  window.requestAnimationFrame(tick);
};

const countObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const item = entry.target;
      if (item.dataset.countupDone === "true") {
        return;
      }

      item.dataset.countupDone = "true";
      animateCount(item);
      observer.unobserve(item);
    });
  },
  {
    threshold: 0.55,
  }
);

countupItems.forEach((item) => countObserver.observe(item));

const carouselRoot = document.querySelector("[data-carousel]");
if (carouselRoot) {
  const scene = carouselRoot.querySelector(".media-carousel-scene");
  const slides = Array.from(carouselRoot.querySelectorAll(".media-slide"));
  const prevButton = carouselRoot.querySelector('[data-carousel-action="prev"]');
  const nextButton = carouselRoot.querySelector('[data-carousel-action="next"]');
  const toggleButton = carouselRoot.querySelector("[data-carousel-toggle]");
  const toggleIconPath = carouselRoot.querySelector("[data-carousel-toggle-icon] path");
  const toggleLabel = carouselRoot.querySelector("[data-carousel-toggle-label]");
  let currentIndex = 0;
  let pointerStartX = 0;
  let pointerStepped = false;
  let isPointerDown = false;
  let autoRotateTimer = null;
  let autoResumeTimer = null;
  let wheelAccumulator = 0;
  let wheelResetTimer = null;
  let manualLockUntil = 0;
  let isSlideHovered = false;
  let autoBehaviorEnabled = !prefersReducedMotion;

  const AUTO_ROTATE_MS = 7000;
  const DRAG_STEP_THRESHOLD = 92;
  const WHEEL_STEP_THRESHOLD = 140;
  const MANUAL_STEP_COOLDOWN = 460;

  const normalizeOffset = (index) => {
    let offset = index - currentIndex;
    const half = slides.length / 2;
    if (offset > half) {
      offset -= slides.length;
    } else if (offset < -half) {
      offset += slides.length;
    }
    return offset;
  };

  const renderCarousel = () => {
    const sceneWidth = scene?.clientWidth || carouselRoot.clientWidth || window.innerWidth;
    const compactLayout = sceneWidth < 760;

    slides.forEach((slide, index) => {
      const offset = normalizeOffset(index);
      const absOffset = Math.abs(offset);
      const direction = offset === 0 ? 0 : offset > 0 ? 1 : -1;

      let translateX = 0;
      let rotateY = 0;
      let scale = 1;
      let opacity = 1;
      let zIndex = 20;

      if (absOffset === 1) {
        translateX = direction * (compactLayout ? sceneWidth * 0.44 : sceneWidth * 0.31);
        rotateY = direction * (compactLayout ? -20 : -28);
        scale = compactLayout ? 0.84 : 0.8;
        opacity = compactLayout ? 0.42 : 0.6;
        zIndex = 12;
      } else if (absOffset === 2 && !compactLayout) {
        translateX = direction * sceneWidth * 0.49;
        rotateY = direction * -38;
        scale = 0.68;
        opacity = 0.2;
        zIndex = 6;
      } else if (absOffset >= 2) {
        translateX = direction * sceneWidth * (compactLayout ? 0.62 : 0.58);
        rotateY = direction * -44;
        scale = 0.58;
        opacity = 0;
        zIndex = 1;
      }

      slide.style.setProperty(
        "--slide-transform",
        `translate(-50%, -50%) translateX(${translateX.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale})`
      );
      slide.style.setProperty("--slide-opacity", String(opacity));
      slide.style.setProperty("--slide-z", String(zIndex));

      const isActive = absOffset === 0;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      slide.setAttribute("tabindex", isActive ? "0" : "-1");
      slide.dataset.slideIndex = String(index);
      slide.style.pointerEvents = absOffset <= 1 ? "auto" : "none";
    });
  };

  const goToIndex = (nextIndex) => {
    if (slides.length === 0) {
      return;
    }
    currentIndex = (nextIndex + slides.length) % slides.length;
    renderCarousel();
  };

  const goNext = () => goToIndex(currentIndex + 1);
  const goPrev = () => goToIndex(currentIndex - 1);

  const stopAutoRotate = () => {
    if (autoRotateTimer) {
      window.clearInterval(autoRotateTimer);
      autoRotateTimer = null;
    }
    if (autoResumeTimer) {
      window.clearTimeout(autoResumeTimer);
      autoResumeTimer = null;
    }
  };

  const updateToggleUi = () => {
    const isPaused = !autoBehaviorEnabled;
    toggleButton?.setAttribute("aria-pressed", isPaused ? "true" : "false");
    toggleButton?.setAttribute("aria-label", isPaused ? "Resume auto slide" : "Pause auto slide");

    if (toggleLabel) {
      toggleLabel.textContent = isPaused ? "Resume" : "Pause";
    }
    if (toggleIconPath) {
      toggleIconPath.setAttribute("d", isPaused ? "M8 6l10 6-10 6z" : "M9 6v12M15 6v12");
    }
  };

  const canAutoRotate = () => autoBehaviorEnabled && !prefersReducedMotion && slides.length > 1 && !isSlideHovered;

  const queueAutoRotate = () => {
    if (!canAutoRotate()) {
      return;
    }
    if (autoResumeTimer) {
      window.clearTimeout(autoResumeTimer);
    }
    autoResumeTimer = window.setTimeout(() => {
      startAutoRotate();
    }, 2200);
  };

  const tryStep = (direction) => {
    if (!direction) {
      return false;
    }

    const now = window.performance.now();
    if (now < manualLockUntil) {
      return false;
    }

    manualLockUntil = now + MANUAL_STEP_COOLDOWN;
    if (direction > 0) {
      goNext();
    } else {
      goPrev();
    }
    return true;
  };

  const startAutoRotate = () => {
    if (!canAutoRotate()) {
      return;
    }
    stopAutoRotate();
    autoRotateTimer = window.setInterval(goNext, AUTO_ROTATE_MS);
  };

  prevButton?.addEventListener("click", () => {
    stopAutoRotate();
    tryStep(-1);
    queueAutoRotate();
  });

  nextButton?.addEventListener("click", () => {
    stopAutoRotate();
    tryStep(1);
    queueAutoRotate();
  });

  slides.forEach((slide, index) => {
    slide.addEventListener("click", () => {
      if (index === currentIndex) {
        return;
      }
      stopAutoRotate();
      goToIndex(index);
      queueAutoRotate();
    });

    slide.addEventListener("mouseenter", () => {
      isSlideHovered = true;
      stopAutoRotate();
    });

    slide.addEventListener("mouseleave", () => {
      isSlideHovered = false;
      queueAutoRotate();
    });
  });

  scene?.addEventListener("pointerdown", (event) => {
    isPointerDown = true;
    pointerStepped = false;
    pointerStartX = event.clientX;
    scene.setPointerCapture(event.pointerId);
    stopAutoRotate();
  });

  scene?.addEventListener("pointermove", (event) => {
    if (!isPointerDown) {
      return;
    }

    const distance = event.clientX - pointerStartX;
    if (Math.abs(distance) < DRAG_STEP_THRESHOLD) {
      return;
    }

    const direction = distance < 0 ? 1 : -1;
    const stepped = tryStep(direction);
    if (stepped) {
      pointerStepped = true;
      pointerStartX = event.clientX;
    }
  });

  scene?.addEventListener("pointerup", (event) => {
    if (!isPointerDown) {
      return;
    }

    if (!pointerStepped) {
      const distance = event.clientX - pointerStartX;
      if (Math.abs(distance) > DRAG_STEP_THRESHOLD) {
        const direction = distance < 0 ? 1 : -1;
        tryStep(direction);
      }
    }

    isPointerDown = false;
    queueAutoRotate();
  });

  scene?.addEventListener("pointercancel", () => {
    isPointerDown = false;
    queueAutoRotate();
  });

  scene?.addEventListener(
    "wheel",
    (event) => {
      const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(dominantDelta) < 2) {
        return;
      }

      event.preventDefault();
      stopAutoRotate();
      wheelAccumulator += dominantDelta;

      if (Math.abs(wheelAccumulator) >= WHEEL_STEP_THRESHOLD) {
        const direction = wheelAccumulator > 0 ? 1 : -1;
        wheelAccumulator = 0;
        tryStep(direction);
      }

      if (wheelResetTimer) {
        window.clearTimeout(wheelResetTimer);
      }
      wheelResetTimer = window.setTimeout(() => {
        wheelAccumulator = 0;
        queueAutoRotate();
      }, 220);
    },
    { passive: false }
  );

  scene?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stopAutoRotate();
      tryStep(-1);
      queueAutoRotate();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stopAutoRotate();
      tryStep(1);
      queueAutoRotate();
    }
  });

  toggleButton?.addEventListener("click", () => {
    autoBehaviorEnabled = !autoBehaviorEnabled;
    updateToggleUi();
    if (autoBehaviorEnabled) {
      queueAutoRotate();
    } else {
      stopAutoRotate();
    }
  });

  window.addEventListener("resize", renderCarousel);

  updateToggleUi();
  renderCarousel();
  startAutoRotate();
}
