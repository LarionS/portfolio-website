const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const animatedTextSelector = ".no-text-animate";

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
    nav_home: "Home",
    nav_work: "Work Lanes",
    nav_founder: "Founder MVPs",
    nav_tools: "Internal Tools",
    nav_interactive: "Interactive / Immersive",
    nav_about: "About",
    nav_showreel: "Showreel",
    nav_background: "Background",
    nav_skills: "Skills",
    nav_contact: "Contact",
    header_cta: "Work With Me",
    hero_eyebrow: "AI-Accelerated Product Prototyping",
    hero_title: "AI-Accelerated MVPs, <span>Internal Tools,</span> and Interactive Prototypes",
    hero_copy:
      "I help founders and teams turn rough ideas into working builds: MVPs, internal tools, and immersive prototypes, backed by Unreal Engine and VR experience.",
    hero_choose: "Choose a Lane",
    hero_contact: "Discuss a Build",
    hero_resume: "Download Resume",
    hero_proof_1: "Founder MVPs",
    hero_proof_2: "Internal Tools",
    hero_proof_3: "Unreal / VR Prototypes",
    profile_role: "Technical Prototyper • Unreal / VR Developer",
    profile_note: "Fast, practical execution across MVPs, internal tools, and immersive prototypes.",
    profile_link: "View LinkedIn",
    selector_eyebrow: "Choose The Lane",
    selector_title: "What are you trying to get built?",
    selector_copy: "Pick the path that matches the outcome you need. Each lane is tailored to a different kind of build.",
    lane_best_fit: "Best fit",
    lane_founder_kicker: "Founder Lane",
    lane_founder_title: "Founder MVPs",
    lane_founder_desc: "For founders who need a real product prototype, investor demo, or MVP fast.",
    lane_founder_fit: "Founders validating a concept before hiring a full team.",
    lane_founder_cta: "Explore Founder MVPs",
    lane_tools_kicker: "Operations Lane",
    lane_tools_title: "Internal Tools / Automation",
    lane_tools_desc: "For teams that need dashboards, workflow tools, admin systems, or AI-assisted internal apps.",
    lane_tools_fit: "Teams replacing spreadsheet chaos and repetitive manual work.",
    lane_tools_cta: "Explore Internal Tools",
    lane_interactive_kicker: "Real-Time Lane",
    lane_interactive_title: "Interactive / Immersive Prototypes",
    lane_interactive_desc:
      "For clients who need interactive demos, Unreal prototypes, VR concepts, or immersive training experiences.",
    lane_interactive_fit: "Teams that need real-time interaction, simulation thinking, or spatial UX.",
    lane_interactive_cta: "Explore Interactive Work",
    cred_1: "Unreal Engine / VR",
    cred_2: "AI-Accelerated Development",
    cred_3: "Rapid Prototyping",
    cred_4: "C++ / Blueprints / Product Thinking",
    about_eyebrow: "Why Clients Bring Me In",
    about_title: "Broad enough for MVPs and tools, strongest where interaction matters.",
    about_copy:
      "I move quickly from rough scope to working builds, using AI to accelerate implementation while staying practical about what needs to ship first.",
    overview_title_1: "Fast First Versions",
    overview_body_1: "Investor demos, product prototypes, and validation builds that make an idea tangible quickly.",
    overview_title_2: "Useful Internal Systems",
    overview_body_2: "Dashboards, workflow tools, and AI-assisted utilities shaped around real operational friction.",
    overview_title_3: "Unreal / VR Depth",
    overview_body_3:
      "Real-time interaction, simulation logic, immersive demos, and training prototypes when the build needs spatial thinking.",
    metric_years: "Shipping interactive products and simulations",
    metric_projects: "Completed projects delivered",
    metric_stack: "Technical prototyping across C++, Blueprints, and AI-assisted workflows",
    metric_scope_title: "End-To-End Delivery",
    metric_scope_desc: "Planning, UX, implementation, QA, iteration, and launch-ready demos",
    founder_eyebrow: "Founder MVPs",
    founder_title: "Founder MVPs that turn rough ideas into real demos fast.",
    founder_lead:
      "Built for founders who need a practical first version they can show, test, and iterate quickly with real feedback.",
    founder_for_title: "Who this is for",
    founder_for_1: "Founders with an idea but no product yet",
    founder_for_2: "Startups that need an investor demo or customer-facing proof point",
    founder_for_3: "Teams validating a concept before hiring full-time",
    founder_build_title: "What I can build",
    founder_build_1: "Product prototypes and clickable core flows",
    founder_build_2: "Investor demos and proof-of-concept apps",
    founder_build_3: "Fast first-version MVPs focused on validation",
    founder_build_4: "Interactive demos that make the product easy to explain",
    founder_step_1_title: "Define the smallest useful version",
    founder_step_1_body: "Strip the idea down to the core flow that needs to be tested or shown.",
    founder_step_2_title: "Build a working prototype fast",
    founder_step_2_body: "Focus on the interaction, logic, and presentation that matter most.",
    founder_step_3_title: "Keep a tight feedback loop",
    founder_step_3_body: "Review early, adjust scope quickly, and avoid spending time on the wrong layer.",
    founder_step_4_title: "Refine the core experience",
    founder_step_4_body: "Polish what a user or investor actually needs to understand in one session.",
    founder_step_5_title: "Deliver something testable",
    founder_step_5_body: "The result should be presentable, reviewable, and useful for the next decision.",
    founder_example_chip_1: "Investor Demo",
    founder_example_title_1: "A product story someone can understand in minutes",
    founder_example_body_1:
      "Good for investor meetings, sales conversations, or early partner buy-in when a deck is no longer enough.",
    founder_example_chip_2: "Validation MVP",
    founder_example_title_2: "A focused first version around one core workflow",
    founder_example_body_2:
      "Useful when the goal is to test the concept with real users before committing to a heavier build.",
    founder_example_chip_3: "Interactive Demo",
    founder_example_title_3: "A clickable experience that makes the product tangible",
    founder_example_body_3:
      "Especially strong when the idea is hard to explain without showing the flow, interface, and interaction.",
    founder_cta_title: "Need a working MVP fast?",
    founder_cta_body:
      "Send the rough idea, not the polished spec. I can help define the smallest useful build and turn it into something real.",
    founder_cta_button: "Talk About an MVP",
    tools_eyebrow: "Internal Tools / Automation",
    tools_title: "Internal tools that reduce workflow friction and save team time.",
    tools_lead:
      "For teams that need useful systems fast: dashboards, admin workflows, and AI-assisted utilities shaped around real operations.",
    tools_build_title: "What I can build",
    tools_build_1: "Dashboards and admin panels",
    tools_build_2: "Workflow systems and internal portals",
    tools_build_3: "AI-assisted utilities for repetitive team tasks",
    tools_build_4: "Custom lightweight business apps",
    tools_outcomes_title: "Why teams bring me in",
    tools_outcomes_1: "Reduce repetitive work and handoff friction",
    tools_outcomes_2: "Centralize messy processes into one useful surface",
    tools_outcomes_3: "Replace spreadsheet sprawl with purpose-built interfaces",
    tools_outcomes_4: "Ship something useful quickly and improve it with real usage",
    tools_example_chip_1: "Ops Dashboard",
    tools_example_title_1: "A dashboard that surfaces the few numbers and actions that matter",
    tools_example_body_1:
      "Good for operational visibility, approvals, queues, and status tracking without overcomplicating the system.",
    tools_example_chip_2: "Workflow Portal",
    tools_example_title_2: "An internal tool shaped around the team's real handoffs",
    tools_example_body_2: "Useful when generic software creates workarounds instead of solving the process.",
    tools_example_chip_3: "AI Utility",
    tools_example_title_3: "A focused AI-assisted helper for intake, review, or admin tasks",
    tools_example_body_3:
      "Best when the goal is saving team time with a narrow, clearly defined workflow rather than a massive platform.",
    tools_step_1_title: "Map the workflow",
    tools_step_1_body: "Find the bottleneck, the duplicate effort, and the decisions that need a clearer interface.",
    tools_step_2_title: "Build the useful surface first",
    tools_step_2_body: "Start with the dashboard, panel, or flow that removes the most friction.",
    tools_step_3_title: "Tighten the loop",
    tools_step_3_body: "Use the team quickly, spot edge cases, and simplify based on actual usage.",
    tools_step_4_title: "Layer in automation where it helps",
    tools_step_4_body: "Bring AI or workflow automation into the narrow tasks where it saves time reliably.",
    tools_cta_title: "Need an internal tool that actually fits the workflow?",
    tools_cta_body:
      "If the current process is spread across spreadsheets, chat threads, and manual follow-ups, I can help turn it into one usable system.",
    tools_cta_button: "Talk About a Tool Build",
    interactive_eyebrow: "Interactive / Immersive Prototypes",
    interactive_title: "Unreal and VR prototypes built for convincing real-time interaction.",
    interactive_lead:
      "This lane is focused on immersive training, interactive demos, and simulation-driven concepts where spatial UX and realism matter.",
    interactive_build_title: "What I can build",
    interactive_build_1: "Unreal Engine prototypes and interactive 3D demos",
    interactive_build_2: "VR training simulations and scenario-based experiences",
    interactive_build_3: "AR/VR concepts and experiential product showcases",
    interactive_build_4: "Simulation-focused prototypes with strong UX readability",
    interactive_for_title: "Best fit clients",
    interactive_for_1: "Teams pitching or validating spatial or real-time products",
    interactive_for_2: "Training organizations that need realistic interaction and simulation logic",
    interactive_for_3: "Studios or product teams that need a prototype before full production",
    interactive_for_4: "Companies that need an experiential demo rather than a flat mockup",
    immersive_work_eyebrow: "Selected Interactive Work",
    immersive_work_title: "Production work drawn from training, games, and real-time demos",
    immersive_chip_1: "Training Simulation",
    immersive_title_1: "Emergency and clinical simulation programs",
    immersive_body_1:
      "Led delivery of simulation-focused AR/VR environments for emergency services, hospitals, and enterprise training contexts.",
    immersive_chip_2: "Published VR Title",
    immersive_title_2: "Hover The Edge",
    immersive_body_2:
      "Built and released a VR title on Steam while handling Unreal production workflows from concept through launch.",
    immersive_chip_3: "Real-Time Delivery",
    immersive_title_3: "Cross-platform Unreal prototypes across five platforms",
    immersive_body_3:
      "Delivered Unreal Engine 4/5 work across PC, mobile, iOS, VR, and cinematic pipelines, balancing performance, interaction, and deployment requirements.",
    immersive_link: "View on Steam",
    interactive_cta_title: "Need an Unreal / VR prototype or immersive demo?",
    interactive_cta_body:
      "If the build needs believable interaction, simulation logic, or real-time presentation quality, that is where I bring the most depth.",
    interactive_cta_button: "Talk About an Interactive Prototype",
    gallery_eyebrow: "Project Gallery",
    gallery_title: "Frames from immersive production work",
    gallery_scene_label: "Interactive project gallery",
    gallery_caption_1:
      "Military day mission map in Unreal Engine, where I tuned terrain composition, cover spacing, and long-range sightlines for VR training flow.",
    gallery_caption_2:
      "Bedside opening sequence for the Glenda scenario, where I aligned dialogue prompts, monitor placement, and camera framing for clear clinical communication.",
    gallery_caption_3:
      "Elevator handoff scenario for early check-in escalation practice, tuned around spoken response prompts and decision pacing in first-person VR.",
    gallery_caption_4:
      "Hashmal Motor digital twin showcase linking real manufacturing media with interactive 3D equipment exploration inside a VR presentation stage.",
    gallery_caption_5:
      "Atlantis Park VR hub scene combining underwater world-building and onboarding beats to establish atmosphere before gameplay objectives begin.",
    gallery_caption_6:
      "Playtika VR bingo prototype capture used for UI and interaction review, highlighting card readability and fast game-state feedback.",
    gallery_caption_7:
      "Glenda medical scenario with branching bedside dialogue and response choices, built to train communication decisions under time pressure.",
    gallery_caption_8:
      "Underwater gameplay zone from Atlantis Park, focused on visibility tuning, aquatic lighting, and interaction clarity in darker environments.",
    gallery_caption_9:
      "Hover The Edge gameplay capture focused on traversal readability and HUD balance during movement-heavy sections.",
    carousel_prev: "Previous slide",
    carousel_next: "Next slide",
    carousel_pause: "Pause",
    carousel_resume: "Resume",
    carousel_pause_aria: "Pause automatic sliding",
    carousel_resume_aria: "Resume automatic sliding",
    showreel_eyebrow: "Featured Video",
    showreel_title: "Showreel 2024",
    showreel_iframe_title: "Larion Siments Showreel 2024",
    founder_process_eyebrow: "Process",
    founder_process_title: "Define the smallest useful thing, then make it real fast.",
    founder_examples_eyebrow: "Examples",
    founder_examples_title: "Typical founder-facing builds that make the next conversation easier.",
    tools_examples_eyebrow: "Examples",
    tools_examples_title: "Focused internal builds shaped around real team friction.",
    tools_process_eyebrow: "Process",
    tools_process_title: "Find the friction, build the useful surface, tighten with real usage.",
    contact_widget_eyebrow: "Leave a Request",
    contact_widget_title: "Send the rough idea here",
    contact_widget_copy:
      "Fill in a few details and your email app opens with the request prefilled. Bullet points are enough.",
    contact_widget_name: "Name",
    contact_widget_contact: "Email or WhatsApp",
    contact_widget_message: "What do you want to build?",
    contact_widget_name_placeholder: "Your name",
    contact_widget_contact_placeholder: "Best way to reach you",
    contact_widget_message_placeholder: "A few lines about the idea, goal, or timeline",
    contact_widget_submit: "Send Request",
    contact_widget_note: "This opens your email app with the request ready to send.",
    background_eyebrow: "Background",
    background_title: "A mix of delivery leadership, hands-on development, and product-minded execution.",
    background_role_1: "Lead Developer, ARVR Israel",
    background_body_1a:
      "Leading AR/VR simulation work for emergency services, healthcare, and enterprise training environments.",
    background_body_1b:
      "I define technical direction, build core systems, and keep delivery aligned with real operational goals and stakeholder feedback.",
    background_role_2: "Freelance Technical Prototyper",
    background_body_2a:
      "Delivered Unreal Engine 4/5 projects across PC, mobile, iOS, VR, and cinematic pipelines as both a solo contributor and part of larger teams.",
    background_body_2b:
      "Practical mix of C++, Blueprints, UI/UX thinking, optimization, and shipping workflows depending on what the build actually needs.",
    background_role_3: "Project Manager, Ador Diagnostics",
    background_body_3a:
      "Managed technical and operational programs including sensor development, HQ relocation, and rollout of new technologies.",
    background_body_3b:
      "That experience sharpened how I think about planning, execution, coordination, and building tools around real organizational needs.",
    background_role_4: "Founder, EventVR",
    background_body_4a: "Ran a VR event business delivering immersive hardware experiences for social and corporate events.",
    background_body_4b:
      "Built the operation end to end, from setup and logistics to on-site execution and audience-facing experience design.",
    skills_eyebrow: "Skills",
    skills_title: "Broad technical coverage, strongest where fast prototyping meets real interaction.",
    skill_unreal_title: "Unreal Engine",
    skill_unreal_desc:
      "Advanced UE4/UE5 workflows with practical C++ and Blueprint implementation for gameplay, interaction, and systems design.",
    skill_arvr_title: "AR/VR Simulations",
    skill_arvr_desc:
      "Scenario-based simulations for training and high-stakes environments, with strong hands-on work in UI/UMG, Behavior Trees + EQS, and VR interaction systems.",
    skill_product_title: "Product Prototyping",
    skill_product_desc:
      "MVP shaping, investor demos, workflow mapping, and practical first-version planning with a strong product-thinking mindset.",
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
      "Structured planning, milestone tracking, UI/UX alignment, and stakeholder coordination to keep end-to-end delivery focused and reliable.",
    skill_ai_title: "AI Coding Workflows",
    skill_ai_desc:
      "Strong AI-assisted development workflow for rapid prototyping, refactors, debugging, and deeper C++ assistance when needed.",
    skill_team_title: "Collaboration & Delivery Leadership",
    skill_team_desc:
      "Hands-on leadership across planning, QA, implementation, and release with practical Git/Perforce workflows and general multiplayer familiarity.",
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
    contact_eyebrow: "Work With Me",
    contact_title: "Have a rough idea? That's enough to start.",
    contact_copy:
      "If you need an MVP, an internal tool, or an Unreal / VR prototype, send the rough version. Bullet points, sketches, and half-formed notes are completely fine.",
    contact_linkedin: "LinkedIn Profile",
    footer_text: "Larion Siments - AI-Accelerated Prototypes, Tools, and Immersive Builds",
  },
  he: {
    nav_home: "בית",
    nav_work: "מסלולי עבודה",
    nav_founder: "MVP ליזמים",
    nav_tools: "כלים פנימיים",
    nav_interactive: "אינטראקטיבי / אימרסיבי",
    nav_about: "אודות",
    nav_showreel: "שואוריל",
    nav_background: "רקע",
    nav_skills: "יכולות",
    nav_contact: "יצירת קשר",
    header_cta: "בואו נעבוד יחד",
    hero_eyebrow: "פרוטוטייפים ומוצרים מהירים בעזרת AI",
    hero_title: "MVPs מואצים ב-AI, <span>כלים פנימיים,</span> ופרוטוטייפים אינטראקטיביים",
    hero_copy:
      "אני עוזר ליזמים ולצוותים להפוך רעיונות גולמיים לבניות עובדות: MVP, כלים פנימיים ופרוטוטייפים אימרסיביים, עם עומק ב-Unreal Engine ו-VR.",
    hero_choose: "בחר מסלול",
    hero_contact: "נדבר על הבנייה",
    hero_resume: "הורד קורות חיים",
    hero_proof_1: "MVP ליזמים",
    hero_proof_2: "כלים פנימיים",
    hero_proof_3: "פרוטוטייפים ב-Unreal / VR",
    profile_role: "טכני לפרוטוטייפים • מפתח Unreal / VR",
    profile_note: "ביצוע מהיר ופרקטי ל-MVP, כלים פנימיים ופרוטוטייפים אימרסיביים.",
    profile_link: "צפה בלינקדאין",
    selector_eyebrow: "בחרו מסלול",
    selector_title: "מה אתם צריכים לבנות?",
    selector_copy: "בחרו את המסלול שמתאים לתוצאה שאתם צריכים. כל מסלול בנוי סביב סוג אחר של פרויקט.",
    lane_best_fit: "מתאים במיוחד",
    lane_founder_kicker: "מסלול יזמים",
    lane_founder_desc: "ליזמים שצריכים פרוטוטייפ אמיתי, דמו למשקיעים או MVP במהירות.",
    lane_founder_fit: "יזמים שמאמתים קונספט לפני הקמת צוות מלא.",
    lane_founder_cta: "למסלול ה-MVP",
    lane_founder_title: "MVP ליזמים",
    lane_tools_kicker: "מסלול תפעולי",
    lane_tools_desc: "לצוותים שצריכים דשבורדים, כלים תהליכיים, מערכות אדמין או אפליקציות פנימיות עם עזרת AI.",
    lane_tools_fit: "צוותים שרוצים להחליף כאוס של גיליונות ותהליכים ידניים.",
    lane_tools_cta: "למסלול הכלים",
    lane_tools_title: "כלים פנימיים / אוטומציה",
    lane_interactive_kicker: "מסלול Real-Time",
    lane_interactive_desc: "ללקוחות שצריכים דמואים אינטראקטיביים, פרוטוטייפים ב-Unreal, קונספטים ל-VR או חוויות אימון אימרסיביות.",
    lane_interactive_fit: "צוותים שצריכים אינטראקציה בזמן אמת, חשיבת סימולציה או UX מרחבי.",
    lane_interactive_cta: "לעבודות האינטראקטיביות",
    lane_interactive_title: "פרוטוטייפים אינטראקטיביים / אימרסיביים",
    cred_1: "Unreal Engine / VR",
    cred_2: "פיתוח מואץ AI",
    cred_3: "פרוטוטייפינג מהיר",
    cred_4: "C++ / Blueprints / חשיבה מוצרית",
    about_eyebrow: "למה מביאים אותי",
    about_title: "רחב מספיק ל-MVPs ולכלים, והכי חזק במקום שבו אינטראקציה באמת חשובה.",
    about_copy:
      "אני זז מהר מהיקף גולמי לבנייה עובדת, משתמש ב-AI כדי להאיץ מימוש, ונשאר פרקטי לגבי מה באמת צריך לעלות ראשון.",
    overview_title_1: "גרסאות ראשונות מהירות",
    overview_body_1: "דמואים למשקיעים, פרוטוטייפים מוצריים ובניות ולידציה שהופכות רעיון למשהו מוחשי במהירות.",
    overview_title_2: "מערכות פנימיות שימושיות",
    overview_body_2: "דשבורדים, כלי workflow וכלים עם AI שנבנים סביב חיכוך תפעולי אמיתי.",
    overview_title_3: "עומק ב-Unreal / VR",
    overview_body_3: "אינטראקציה בזמן אמת, לוגיקת סימולציה, דמואים אימרסיביים ופרוטוטייפים להדרכה כשהפרויקט צריך חשיבה מרחבית.",
    metric_years: "שנים של בניית מוצרים אינטראקטיביים וסימולציות",
    metric_projects: "פרויקטים שהושלמו ונמסרו",
    metric_stack: "פרוטוטייפינג טכני עם C++, Blueprints ותהליכי AI",
    metric_scope_title: "מסירה מקצה לקצה",
    metric_scope_desc: "תכנון, UX, מימוש, QA, איטרציה ודמואים מוכנים להצגה",
    founder_title: "MVP ליזמים שהופך רעיון גולמי לדמו עובד במהירות.",
    founder_lead:
      "מתאים ליזמים שצריכים גרסה ראשונה פרקטית שאפשר להציג, לבדוק עם משתמשים ולשפר מהר.",
    founder_eyebrow: "MVP ליזמים",
    founder_for_title: "למי זה מתאים",
    founder_for_1: "יזמים עם רעיון אבל בלי מוצר עדיין",
    founder_for_2: "סטארטאפים שצריכים דמו למשקיעים או הוכחת היתכנות מול לקוחות",
    founder_for_3: "צוותים שבודקים קונספט לפני גיוס של משרה מלאה",
    founder_build_title: "מה אני יכול לבנות",
    founder_build_1: "פרוטוטייפים מוצריים וזרימות ליבה לחיצות",
    founder_build_2: "דמואים למשקיעים ואפליקציות הוכחת קונספט",
    founder_build_3: "MVP ראשוני ומהיר שמתמקד בוולידציה",
    founder_build_4: "דמואים אינטראקטיביים שמסבירים את המוצר בקלות",
    founder_step_1_title: "להגדיר את הגרסה הכי קטנה ושימושית",
    founder_step_1_body: "מורידים את הרעיון לגרעין שצריך להיבדק או להיות מוצג.",
    founder_step_2_title: "לבנות פרוטוטייפ עובד מהר",
    founder_step_2_body: "מתמקדים באינטראקציה, בלוגיקה ובהצגה שבאמת חשובים.",
    founder_step_3_title: "לשמור על לולאת משוב צמודה",
    founder_step_3_body: "בודקים מוקדם, משנים היקף מהר ונמנעים מבזבוז זמן על השכבה הלא נכונה.",
    founder_step_4_title: "לחדד את חוויית הליבה",
    founder_step_4_body: "מלוטשים את מה שמשתמש או משקיע באמת צריך להבין במפגש אחד.",
    founder_step_5_title: "למסור משהו שאפשר לבדוק",
    founder_step_5_body: "התוצאה צריכה להיות ניתנת להצגה, לבדיקה ולשימוש בהחלטה הבאה.",
    founder_example_chip_1: "דמו למשקיעים",
    founder_example_title_1: "סיפור מוצר שאפשר להבין בתוך דקות",
    founder_example_body_1: "טוב לפגישות משקיעים, שיחות מכירה, או יצירת buy-in מוקדם כשדק כבר לא מספיק.",
    founder_example_chip_2: "MVP לוולידציה",
    founder_example_title_2: "גרסה ראשונה ממוקדת סביב תהליך ליבה אחד",
    founder_example_body_2: "שימושי כשהמטרה היא לבדוק את הקונספט עם משתמשים אמיתיים לפני בנייה כבדה יותר.",
    founder_example_chip_3: "דמו אינטראקטיבי",
    founder_example_title_3: "חוויה לחיצה שממחישה את המוצר בצורה מוחשית",
    founder_example_body_3: "חזק במיוחד כשהרעיון קשה להסביר בלי להראות את הזרימה, הממשק והאינטראקציה.",
    founder_cta_title: "צריך MVP עובד מהר?",
    founder_cta_body: "שלחו את הרעיון הגולמי, לא את המפרט המלוטש. אני יכול לעזור להגדיר את הבנייה הקטנה והשימושית ביותר ולהפוך אותה למשהו אמיתי.",
    founder_cta_button: "דברו איתי על MVP",
    tools_title: "כלים פנימיים שמפחיתים חיכוך תפעולי וחוסכים זמן לצוות.",
    tools_lead:
      "לצוותים שצריכים מערכות שימושיות במהירות: דשבורדים, זרימות אדמין וכלים בעזרת AI סביב עבודה אמיתית.",
    tools_eyebrow: "כלים פנימיים / אוטומציה",
    tools_build_title: "מה אני יכול לבנות",
    tools_build_1: "דשבורדים ופאנלים לניהול",
    tools_build_2: "מערכות workflow ופורטלים פנימיים",
    tools_build_3: "כלים עם AI למשימות צוות חוזרות",
    tools_build_4: "אפליקציות עסקיות קלות ומותאמות אישית",
    tools_outcomes_title: "למה צוותים מביאים אותי",
    tools_outcomes_1: "להפחית עבודה חוזרת וחיכוך בין שלבים",
    tools_outcomes_2: "לרכז תהליכים מבולגנים לממשק אחד שימושי",
    tools_outcomes_3: "להחליף פיזור אקסלים בממשקים ייעודיים",
    tools_outcomes_4: "לשחרר משהו שימושי מהר ולשפר לפי שימוש אמיתי",
    tools_example_chip_1: "לוח תפעול",
    tools_example_title_1: "דשבורד שמציג את המספרים והפעולות שבאמת חשובים",
    tools_example_body_1: "טוב לנראות תפעולית, אישורים, תורים ומעקב סטטוס בלי לסבך את המערכת.",
    tools_example_chip_2: "פורטל עבודה",
    tools_example_title_2: "כלי פנימי שנבנה סביב נקודות המסירה האמיתיות של הצוות",
    tools_example_body_2: "שימושי כשמוצרים גנריים יוצרים מעקפים במקום לפתור את התהליך.",
    tools_example_chip_3: "כלי AI",
    tools_example_title_3: "עוזר ממוקד מבוסס AI לקליטה, סקירה או משימות אדמין",
    tools_example_body_3: "הכי טוב כשהמטרה היא לחסוך זמן לצוות עם תהליך צר ומוגדר היטב, לא לבנות פלטפורמה ענקית.",
    tools_step_1_title: "למפות את ה-workflow",
    tools_step_1_body: "מאפיינים את צוואר הבקבוק, את העבודה הכפולה ואת ההחלטות שצריכות ממשק ברור יותר.",
    tools_step_2_title: "לבנות קודם את המשטח השימושי",
    tools_step_2_body: "מתחילים מהדשבורד, הפאנל או הזרימה שמורידים את הכי הרבה חיכוך.",
    tools_step_3_title: "לחדד את הלולאה",
    tools_step_3_body: "נותנים לצוות להשתמש מהר, מזהים מקרי קצה ופשוטים על סמך שימוש אמיתי.",
    tools_step_4_title: "להוסיף אוטומציה היכן שזה מועיל",
    tools_step_4_body: "מכניסים AI או אוטומציית workflow למשימות הצרות שבהן זה חוסך זמן בצורה אמינה.",
    tools_cta_title: "צריך כלי פנימי שבאמת מתאים ל-workflow?",
    tools_cta_body:
      "אם התהליך הנוכחי מפוזר בין אקסלים, שיחות צ'אט ומעקבים ידניים, אני יכול לעזור להפוך אותו למערכת אחת שימושית.",
    tools_cta_button: "דברו איתי על כלי",
    interactive_title: "פרוטוטייפים ב-Unreal וב-VR שנבנים לאינטראקציה משכנעת בזמן אמת.",
    interactive_lead:
      "המסלול הזה מתמקד בהדרכות אימרסיביות, דמואים אינטראקטיביים וקונספטים מבוססי סימולציה כש-UX מרחבי וריאליזם חשובים.",
    interactive_eyebrow: "פרוטוטייפים אינטראקטיביים / אימרסיביים",
    interactive_build_title: "מה אני יכול לבנות",
    interactive_build_1: "פרוטוטייפים ב-Unreal ודמואים תלת-ממדיים אינטראקטיביים",
    interactive_build_2: "סימולציות אימון ב-VR וחוויות מבוססות תרחישים",
    interactive_build_3: "קונספטים ל-AR/VR ודמואי מוצר חווייתיים",
    interactive_build_4: "פרוטוטייפים עם דגש חזק על קריאות UX בסימולציה",
    interactive_for_title: "למי זה מתאים",
    interactive_for_1: "צוותים שמציגים או מאמתים מוצרים מרחביים או בזמן אמת",
    interactive_for_2: "ארגוני הדרכה שצריכים אינטראקציה ריאליסטית ולוגיקת סימולציה",
    interactive_for_3: "סטודיואים או צוותי מוצר שצריכים פרוטוטייפ לפני הפקה מלאה",
    interactive_for_4: "חברות שצריכות דמו חווייתי במקום מוקאפ שטוח",
    immersive_work_eyebrow: "עבודות אינטראקטיביות נבחרות",
    immersive_work_title: "עבודות פרודקשן מעולמות הדרכה, משחקים ודמואים בזמן אמת",
    immersive_chip_1: "סימולציית הדרכה",
    immersive_title_1: "תוכניות סימולציה רפואיות וחירום",
    immersive_body_1: "הובלתי מסירה של סביבות AR/VR ממוקדות סימולציה עבור שירותי חירום, בתי חולים והדרכות ארגוניות.",
    immersive_chip_2: "כותרת VR שיצאה לשוק",
    immersive_title_2: "Hover The Edge",
    immersive_body_2: "בניתי ושחררתי כותרת VR ב-Steam תוך ניהול תהליכי Unreal מהקונספט ועד ההשקה.",
    immersive_chip_3: "מסירה בזמן אמת",
    immersive_title_3: "פרוטוטייפים ב-Unreal למספר פלטפורמות",
    immersive_body_3:
      "סיפקתי עבודות Unreal Engine 4/5 ל-PC, מובייל, iOS, VR וצינורות קולנועיים, עם איזון בין ביצועים, אינטראקציה ופריסה.",
    immersive_link: "צפה ב-Steam",
    interactive_cta_title: "צריך פרוטוטייפ Unreal / VR או דמו אימרסיבי?",
    interactive_cta_body:
      "אם הבנייה צריכה אינטראקציה אמינה, לוגיקת סימולציה או איכות הצגה בזמן אמת - שם אני מביא את העומק הכי גדול.",
    interactive_cta_button: "דברו איתי על פרוטוטייפ אינטראקטיבי",
    gallery_eyebrow: "גלריית פרויקטים",
    gallery_title: "פריימים מעבודת פרודקשן אימרסיבית",
    gallery_scene_label: "גלריית פרויקטים אינטראקטיבית",
    gallery_caption_1:
      "מפת משימה יומית צבאית ב-Unreal Engine, שבה כוונתי קומפוזיציית שטח, מרחקי מחסה וקווי ראייה לטווח ארוך לזרימת אימון VR.",
    gallery_caption_2:
      "פתיחת bedside לתרחיש Glenda, שבה יישרתי פרומפטים לדיאלוג, מיקום מוניטורים וקומפוזיציית מצלמה לתקשורת קלינית ברורה.",
    gallery_caption_3:
      "תרחיש מעלית לאימון מסירה סביב check-in מוקדם, מכוון סביב תגובות מדוברות וקצב החלטה בגוף ראשון ב-VR.",
    gallery_caption_4:
      "הדגמת digital twin ל-Hashmal Motor שמחברת חומרים תעשייתיים אמיתיים עם חקר תלת-ממד אינטראקטיבי בתוך במה מצגות ב-VR.",
    gallery_caption_5:
      "סצנת hub של Atlantis Park ב-VR, שמשלבת בניית עולם תת-ימית ושלבי onboarding כדי ליצור אווירה לפני תחילת היעדים.",
    gallery_caption_6:
      "לכידת אב-טיפוס Playtika VR bingo לשם סקירת UI ואינטראקציה, עם דגש על קריאות קלפים ומשוב מהיר על מצב המשחק.",
    gallery_caption_7:
      "תרחיש הרפואי Glenda עם ענפי דיאלוג ליד המיטה ובחירות תגובה, שנבנה לאימון החלטות תקשורת תחת לחץ זמן.",
    gallery_caption_8:
      "אזור המשחק התת-ימי של Atlantis Park, עם כוונון נראות, תאורה ימית ובהירות אינטראקציה בסביבות חשוכות יותר.",
    gallery_caption_9:
      "לכידת משחק של Hover The Edge עם דגש על קריאות תנועה ואיזון HUD במהלך מקטעים עתירי תזוזה.",
    carousel_prev: "שקופית קודמת",
    carousel_next: "שקופית הבאה",
    carousel_pause: "השהיה",
    carousel_resume: "המשך",
    carousel_pause_aria: "השהיית מעבר אוטומטי",
    carousel_resume_aria: "המשך מעבר אוטומטי",
    showreel_eyebrow: "וידאו מוביל",
    showreel_title: "שואוריל 2024",
    showreel_iframe_title: "שואוריל 2024 של לריון סימנטס",
    founder_process_eyebrow: "תהליך",
    founder_process_title: "מגדירים את הגרסה הכי קטנה ששווה לבנות, ואז הופכים אותה למהירה ועובדת.",
    founder_examples_eyebrow: "דוגמאות",
    founder_examples_title: "בניות אופייניות ליזמים שמקלות על השיחה הבאה.",
    tools_examples_eyebrow: "דוגמאות",
    tools_examples_title: "כלים פנימיים ממוקדים סביב חיכוך אמיתי בצוות.",
    tools_process_eyebrow: "תהליך",
    tools_process_title: "מאתרים את החיכוך, בונים את הממשק השימושי, ומחדדים לפי שימוש אמיתי.",
    contact_widget_eyebrow: "השאירו בקשה",
    contact_widget_title: "שלחו כאן את הרעיון הגולמי",
    contact_widget_copy:
      "ממלאים כמה פרטים וקופצת אפליקציית המייל עם הבקשה מוכנה. גם נקודות קצרות מספיקות.",
    contact_widget_name: "שם",
    contact_widget_contact: "אימייל או וואטסאפ",
    contact_widget_message: "מה רוצים לבנות?",
    contact_widget_name_placeholder: "השם שלך",
    contact_widget_contact_placeholder: "איך הכי נוח לחזור אליך",
    contact_widget_message_placeholder: "כמה שורות על הרעיון, המטרה או הלוח זמנים",
    contact_widget_submit: "שליחת בקשה",
    contact_widget_note: "זה פותח את אפליקציית המייל שלך עם בקשה מוכנה לשליחה.",
    background_eyebrow: "רקע",
    background_title: "שילוב של הובלת מסירה, פיתוח hands-on וחשיבה מוצרית בביצוע.",
    skills_eyebrow: "יכולות",
    skills_title: "כיסוי טכני רחב, הכי חזק במקום שבו פרוטוטייפינג מהיר פוגש אינטראקציה אמיתית.",
    skill_product_title: "פרוטוטייפינג מוצרי",
    skill_product_desc: "עיצוב MVP, דמואים למשקיעים, מיפוי workflow ותכנון גרסה ראשונה פרקטית עם חשיבה מוצרית חזקה.",
    toolstack_title: "סט כלי עבודה",
    language_title: "רמת שפות",
    contact_eyebrow: "בואו נעבוד יחד",
    contact_title: "יש לכם רעיון גולמי? זה מספיק כדי להתחיל.",
    contact_copy:
      "אם אתם צריכים MVP, כלי פנימי או פרוטוטייפ Unreal / VR, שלחו את הגרסה הגולמית. נקודות, סקיצות והערות חצי-מוכנות זה לגמרי מספיק.",
    contact_linkedin: "פרופיל לינקדאין",
    footer_text: "לריון סימנטס - פרוטוטייפים, כלים ובניות אימרסיביות מואצות AI",
  },
};

const i18nNodes = Array.from(document.querySelectorAll("[data-i18n]"));
const langToggle = document.querySelector("[data-lang-toggle]");
const langLabel = document.querySelector("[data-lang-label]");
let activeLanguage = "en";

const getTranslation = (key) => i18n[activeLanguage][key] ?? i18n.en[key] ?? "";

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

    if (node.dataset.i18nAttrs) {
      node.dataset.i18nAttrs
        .split(",")
        .map((attr) => attr.trim())
        .filter(Boolean)
        .forEach((attr) => {
          node.setAttribute(attr, translated);
        });
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
  window.dispatchEvent(new CustomEvent("portfolio-language-change", { detail: { lang: activeLanguage } }));
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
  const DRAG_STEP_THRESHOLD = 112;
  const WHEEL_STEP_THRESHOLD = 180;
  const MANUAL_STEP_COOLDOWN = 520;

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
        translateX = direction * (compactLayout ? sceneWidth * 0.42 : sceneWidth * 0.28);
        rotateY = direction * (compactLayout ? -18 : -24);
        scale = compactLayout ? 0.86 : 0.82;
        opacity = compactLayout ? 0.46 : 0.62;
        zIndex = 12;
      } else if (absOffset === 2 && !compactLayout) {
        translateX = direction * sceneWidth * 0.46;
        rotateY = direction * -34;
        scale = 0.7;
        opacity = 0.24;
        zIndex = 6;
      } else if (absOffset >= 2) {
        translateX = direction * sceneWidth * (compactLayout ? 0.58 : 0.56);
        rotateY = direction * -40;
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
    toggleButton?.setAttribute(
      "aria-label",
      isPaused ? getTranslation("carousel_resume_aria") : getTranslation("carousel_pause_aria")
    );

    if (toggleLabel) {
      toggleLabel.textContent = isPaused ? getTranslation("carousel_resume") : getTranslation("carousel_pause");
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
    }, 2400);
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
      if (Math.abs(dominantDelta) < 3) {
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
      }, 260);
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
  window.addEventListener("portfolio-language-change", updateToggleUi);

  updateToggleUi();
  renderCarousel();
  startAutoRotate();
}

const contactForms = document.querySelectorAll("[data-contact-form]");
contactForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const recipient = "Larion1@gmail.com";
    const subject = form.dataset.requestSubject || "Website request from portfolio";
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const bodyLines = [
      "Hi Larion,",
      "",
      `Name: ${name || "Not provided"}`,
      `Contact: ${contact || "Not provided"}`,
      `Page: ${document.title}`,
      `URL: ${window.location.href}`,
      "",
      "Request:",
      message || "Not provided",
    ];

    const mailtoHref = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = mailtoHref;
  });
});
