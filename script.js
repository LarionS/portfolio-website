const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const i18n = {
  en: {
    nav_home: "Home",
    nav_work: "Unreal Work",
    nav_founder: "Product Development",
    nav_tools: "Internal Tools",
    nav_interactive: "Unreal / VR",
    nav_about: "Capabilities",
    nav_showreel: "Showreel",
    nav_background: "Background",
    nav_skills: "Skills",
    nav_contact: "Contact",
    header_cta: "Contact",
    hero_eyebrow: "Unreal Engine / VR Developer",
    hero_title:
      "Unreal Engine, <span>VR Production,</span> and Interactive Real-Time Experiences",
    hero_copy:
      "I build and ship Unreal Engine experiences for training, simulation, games, and interactive products.",
    hero_choose: "View Unreal Work",
    hero_contact: "Watch Showreel",
    hero_resume: "Download Resume",
    ue_statement_label: "What I deliver",
    ue_statement_title:
      "Unreal Engine experiences built for real users, real hardware, and real-world conditions.",
    ue_statement_copy:
      "I lead VR and real-time projects through technical planning, hands-on development, optimization, QA, and release.",
    ue_work_label: "Selected Production Work",
    ue_work_title:
      "Training, games, and immersive systems—delivered in Unreal.",
    ue_work_copy: "A selection of shipped and client production work.",
    ue_case1_kicker: "VR Training Systems",
    ue_case1_title: "Training under pressure",
    ue_case1_copy:
      "Scenario-driven VR for healthcare, emergency response, hospitality, and enterprise teams.",
    ue_case1_cta: "View training work",
    ue_case2_kicker: "Published VR Game",
    ue_case2_title: "Hover The Edge",
    ue_case2_copy:
      "A complete VR game released on Steam—gameplay, interaction, UI, performance, and shipping.",
    ue_case2_cta: "View on Steam",
    ue_case3_kicker: "Industrial / Experiential",
    ue_case3_title: "Interactive Unreal systems",
    ue_case3_copy:
      "Digital twins, product showcases, and real-time applications for complex products and environments.",
    ue_case3_cta: "View interactive work",
    ue_cap_label: "Production Capabilities",
    ue_cap_title:
      "Hands-on Unreal development across the full production cycle.",
    ue_cap1_title: "VR training & simulation",
    ue_cap1_copy:
      "Scenario logic, spatial interaction, feedback systems, AI behavior, and training UX.",
    ue_cap2_title: "Gameplay & systems development",
    ue_cap2_copy:
      "C++ and Blueprint systems for gameplay, UI/UMG, state, tools, and runtime behavior.",
    ue_cap3_title: "Optimization & deployment",
    ue_cap3_copy:
      "Profiling, QA, platform constraints, and delivery across PC, mobile, iOS, and VR.",
    ue_beyond_label: "Additional Engineering",
    ue_beyond_title: "When the work extends beyond Unreal.",
    ue_beyond_copy:
      "I also deliver supporting web products, operational tools, and internal systems around the real-time experience.",
    ue_beyond_founder: "Product development",
    ue_beyond_tools: "Internal systems",
    ue_beyond_link: "View work",
    ue_contact_title: "Need senior Unreal Engine or VR production support?",
    ue_contact_copy:
      "Send the platform, scope, timeline, and what needs to ship.",
    hero_proof_1: "Product Development",
    hero_proof_2: "Internal Tools",
    hero_proof_3: "Unreal / VR Production",
    profile_role: "Unreal Engine / VR Developer",
    profile_note:
      "End-to-end delivery across Unreal Engine, VR, interactive systems, and product software.",
    profile_link: "View LinkedIn",
    selector_eyebrow: "Choose The Lane",
    selector_title: "What are you trying to get built?",
    selector_copy:
      "Pick the path that matches the outcome you need. Each lane is tailored to a different kind of build.",
    home_gate_eyebrow: "Choose your lane",
    home_gate_title: "What do you need built?",
    home_gate_copy: "Choose the track that matches the build you need.",
    home_founder_short:
      "Focused first releases for founders and product teams.",
    home_tools_short:
      "Dashboards, team workflows, and useful automation systems.",
    home_interactive_short:
      "Unreal, VR, and real-time production built around interaction.",
    home_door_enter: "Enter lane",
    lane_best_fit: "Best fit",
    lane_founder_kicker: "Founder Lane",
    lane_founder_title: "Product Development",
    lane_founder_desc:
      "For founders who need a focused, dependable first product release.",
    lane_founder_fit:
      "Founders who need senior product delivery before building an internal team.",
    lane_founder_cta: "Explore Product Work",
    lane_tools_kicker: "Operations Lane",
    lane_tools_title: "Internal Tools / Automation",
    lane_tools_desc:
      "For teams that need dashboards, workflow tools, admin systems, or AI-assisted internal apps.",
    lane_tools_fit:
      "Teams replacing spreadsheet chaos and repetitive manual work.",
    lane_tools_cta: "Explore Internal Tools",
    lane_interactive_kicker: "Real-Time Lane",
    lane_interactive_title: "Unreal / VR Production",
    lane_interactive_desc:
      "For clients who need Unreal development, VR systems, interactive experiences, or immersive training production.",
    lane_interactive_fit:
      "Teams that need real-time interaction, simulation thinking, or spatial UX.",
    lane_interactive_cta: "Explore Unreal / VR Work",
    cred_1: "Unreal Engine / VR",
    cred_2: "AI-Accelerated Development",
    cred_3: "Real-Time Production",
    cred_4: "C++ / Blueprints / Product Thinking",
    about_eyebrow: "Why Clients Bring Me In",
    about_title:
      "Broad enough for product software and tools, strongest where interaction matters.",
    about_copy:
      "I move quickly from rough scope to working builds, using AI to accelerate implementation while staying practical about what needs to ship first.",
    overview_title_1: "Focused First Releases",
    overview_body_1:
      "Working product releases with the core experience, systems, and delivery path in place.",
    overview_title_2: "Useful Internal Systems",
    overview_body_2:
      "Dashboards, workflow tools, and AI-assisted utilities shaped around real operational friction.",
    overview_title_3: "Unreal / VR Depth",
    overview_body_3:
      "Real-time interaction, simulation logic, immersive systems, and training experiences when the build needs spatial thinking.",
    metric_years: "Shipping interactive products and simulations",
    metric_projects: "Completed projects delivered",
    metric_stack:
      "Technical production across C++, Blueprints, and AI-assisted workflows",
    metric_scope_title: "End-To-End Delivery",
    metric_scope_desc:
      "Planning, UX, implementation, QA, iteration, and release-ready products",
    founder_eyebrow: "Product Development",
    founder_title: "Founder products built for real users and real decisions.",
    founder_lead:
      "For founders who need a dependable first product release they can put in front of users, investors, and partners.",
    founder_for_title: "Who this is for",
    founder_for_1: "Founders moving from product strategy to a first release",
    founder_for_2: "Startups that need an investor- and customer-ready product",
    founder_for_3:
      "Teams that need experienced delivery before hiring full-time",
    founder_build_title: "What I deliver",
    founder_build_1:
      "Web and mobile product foundations with complete core flows",
    founder_build_2: "Investor- and customer-ready first releases",
    founder_build_3: "Social, discovery, and engagement systems",
    founder_build_4: "Product foundations with privacy and trust controls",
    founder_step_1_title: "Define the right first release",
    founder_step_1_body:
      "Turn the product goal into a clear scope, user journey, and delivery target.",
    founder_step_2_title: "Build the core product",
    founder_step_2_body:
      "Develop the interaction, logic, data, and interface needed for a coherent release.",
    founder_step_3_title: "Keep a tight feedback loop",
    founder_step_3_body:
      "Review working software early, adjust scope intelligently, and keep delivery moving.",
    founder_step_4_title: "Harden the experience",
    founder_step_4_body:
      "Refine the UX, edge cases, and presentation quality that users will encounter.",
    founder_step_5_title: "Prepare the release",
    founder_step_5_body:
      "Hand over a release-ready product with a clear path for continued development.",
    founder_example_chip_1: "Lighthouse Feed + Stories",
    founder_example_title_1:
      "Core social surface shipped early for investor and user walkthroughs",
    founder_example_body_1:
      "Implemented feed, story rail, and quick post composer so the product was usable from the first investor and user walkthroughs.",
    founder_example_chip_2: "Nearby Discovery",
    founder_example_title_2:
      "People-nearby cards that turn discovery into immediate actions",
    founder_example_body_2:
      "Built nearby suggestions with quick friend actions to test conversion from browsing to actual connection behavior.",
    founder_example_chip_3: "People Map",
    founder_example_title_3:
      "Map-backed people view for location-aware social context",
    founder_example_body_3:
      "The working flow linked presence visibility and people search so users could discover contacts without exposing precise location data.",
    founder_example_chip_4: "Engagement Loop",
    founder_example_title_4:
      "Post interaction flow designed for repeat usage signals",
    founder_example_body_4:
      "Structured post cards with reactions and save actions to support repeat use and continued engagement.",
    founder_cta_title: "Need a first product version that can actually ship?",
    founder_cta_body:
      "Send the product goal, core users, and delivery target. I can shape the scope and build the first release.",
    founder_cta_button: "Discuss Product Development",
    tools_eyebrow: "Internal Tools / Automation",
    tools_title:
      "Internal tools that reduce workflow friction and save team time.",
    tools_lead:
      "For teams that need useful systems fast: dashboards, admin workflows, and AI-assisted utilities shaped around real operations. AGE is one of the internal platforms where I applied this approach.",
    tools_build_title: "What I deliver",
    tools_build_1: "Dashboards and admin panels",
    tools_build_2: "Workflow systems and internal portals",
    tools_build_3: "Shared UI contracts across teams and platforms",
    tools_build_4: "AI-assisted utilities for repetitive team tasks",
    tools_outcomes_title: "Why teams bring me in",
    tools_outcomes_1: "Reduce repetitive work and handoff friction",
    tools_outcomes_2: "Centralize messy processes into one useful surface",
    tools_outcomes_3:
      "Replace spreadsheet sprawl with purpose-built interfaces",
    tools_outcomes_4:
      "Ship something useful quickly and improve it with real usage",
    tools_example_chip_1: "Creator Console",
    tools_example_title_1:
      "Inventory, viewport, and runtime chat in one operational surface",
    tools_example_body_1:
      "In AGE, the creator console combined content browser, simulation viewport, and agent chat so iteration could happen without constant context switching.",
    tools_example_chip_2: "LiveUI Editor",
    tools_example_title_2:
      "Widget editing workflow with immediate visual verification",
    tools_example_body_2:
      "LiveUI flow supports editing UI components, previewing changes, and keeping implementation aligned with shared state contracts.",
    tools_example_chip_3: "Viewport Controls",
    tools_example_title_3:
      "Operator-friendly controls for fast simulation adjustments",
    tools_example_body_3:
      "Drag/rotate/scale controls and quality toggles were exposed for keyboard- and QA-friendly iteration during internal testing.",
    tools_step_1_title: "Map the workflow",
    tools_step_1_body:
      "Find the bottleneck, the duplicate effort, and the decisions that need a clearer interface.",
    tools_step_2_title: "Build the useful surface first",
    tools_step_2_body:
      "Start with the dashboard, panel, or flow that removes the most friction.",
    tools_step_3_title: "Tighten the loop",
    tools_step_3_body:
      "Use the team quickly, spot edge cases, and simplify based on actual usage.",
    tools_step_4_title: "Layer in automation where it helps",
    tools_step_4_body:
      "Bring AI or workflow automation into the narrow tasks where it saves time reliably.",
    tools_cta_title: "Need an internal tool that actually fits the workflow?",
    tools_cta_body:
      "If the current process is spread across spreadsheets, chat threads, and manual follow-ups, I can help turn it into one usable system.",
    tools_cta_button: "Talk About a Tool Build",
    contact_panel_eyebrow: "Direct contact",
    contact_panel_title: "Choose your preferred channel.",
    contact_panel_copy:
      "Email for detailed briefs. WhatsApp for faster coordination.",
    contact_channel_email_label: "Email",
    contact_channel_email_note: "Detailed briefs",
    contact_channel_whatsapp_label: "WhatsApp Israel",
    contact_channel_whatsapp_note: "Quick coordination",
    contact_channel_thailand_label: "WhatsApp Thailand",
    contact_channel_thailand_note: "Bangkok timezone",
    contact_channel_linkedin_label: "LinkedIn",
    contact_channel_linkedin_note: "Background",
    interactive_eyebrow: "Unreal Engine / VR Development",
    interactive_title:
      "Unreal and VR systems built for demanding real-time interaction.",
    interactive_lead:
      "I deliver immersive training systems, games, and interactive experiences across the full Unreal production cycle.",
    interactive_build_title: "What I deliver",
    interactive_build_1:
      "Unreal Engine development for interactive 3D experiences",
    interactive_build_2: "VR training systems and scenario-based simulation",
    interactive_build_3:
      "Gameplay, UI, tools, and real-time interaction systems",
    interactive_build_4: "Optimization, QA, deployment, and platform delivery",
    interactive_for_title: "Where I fit",
    interactive_for_1: "Teams delivering VR training or simulation products",
    interactive_for_2:
      "Studios that need senior Unreal development and systems ownership",
    interactive_for_3:
      "Organizations shipping interactive 3D across PC, mobile, iOS, or VR",
    interactive_for_4: "Production teams that need a hands-on technical lead",
    immersive_work_eyebrow: "Selected Interactive Work",
    immersive_work_title:
      "Delivered work across training, games, and interactive systems",
    immersive_chip_1: "Training Simulation",
    immersive_title_1: "Emergency and clinical simulation programs",
    immersive_body_1:
      "Led delivery of simulation-focused AR/VR environments for emergency services, hospitals, and enterprise training contexts.",
    immersive_chip_2: "Published VR Title",
    immersive_title_2: "Hover The Edge",
    immersive_body_2:
      "Built and released a VR title on Steam while handling Unreal production workflows from systems development through launch.",
    immersive_chip_3: "Real-Time Delivery",
    immersive_title_3: "Cross-platform Unreal production across five platforms",
    immersive_body_3:
      "Delivered Unreal Engine 4/5 work across PC, mobile, iOS, VR, and cinematic pipelines, balancing performance, interaction, and deployment requirements.",
    immersive_link: "View on Steam",
    interactive_cta_title:
      "Need experienced Unreal Engine or VR production support?",
    interactive_cta_body:
      "I can own core systems, interaction, optimization, QA, and delivery across the Unreal production cycle.",
    interactive_cta_button: "Discuss the Unreal / VR Work",
    gallery_eyebrow: "Project Gallery",
    gallery_title: "Production frames from shipped and client work",
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
      "Playtika VR bingo build used for UI and interaction review, highlighting card readability and fast game-state feedback.",
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
    founder_process_title:
      "Define the right release, then build it with discipline.",
    founder_examples_eyebrow: "Examples",
    founder_examples_title:
      "Lighthouse product systems built around adoption, trust, and daily engagement.",
    tools_examples_eyebrow: "Examples",
    tools_examples_title:
      "AGE Creator Console work focused on internal speed, consistency, and QA visibility.",
    tools_process_eyebrow: "Process",
    tools_process_title:
      "Find the friction, build the useful surface, tighten with real usage.",
    contact_widget_eyebrow: "Project Request",
    contact_widget_title: "Tell me about the work",
    contact_widget_copy: "Share the platform, scope, and timeline.",
    contact_widget_name: "Name",
    contact_widget_contact: "Email or WhatsApp",
    contact_widget_message_label: "Build request",
    contact_widget_name_placeholder: "Your name",
    contact_widget_contact_placeholder: "Best way to reach you",
    contact_widget_message_placeholder:
      "Platform, scope, timeline, and delivery target",
    contact_widget_submit: "Send Request",
    contact_widget_note: "",
    contact_widget_sending: "Sending your request...",
    contact_widget_success: "Sent. I’ll get back to you soon.",
    contact_widget_error:
      "Something went wrong. Please email me directly at Larion1@gmail.com.",
    background_eyebrow: "Background",
    background_title:
      "A mix of delivery leadership, hands-on development, and product-minded execution.",
    background_role_1: "Lead Developer, ARVR Israel",
    background_body_1a:
      "Leading AR/VR simulation work for emergency services, healthcare, and enterprise training environments.",
    background_body_1b:
      "I define technical direction, build core systems, and keep delivery aligned with real operational goals and stakeholder feedback.",
    background_role_2: "Freelance Unreal Engine Developer",
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
    background_body_4a:
      "Ran a VR event business delivering immersive hardware experiences for social and corporate events.",
    background_body_4b:
      "Built the operation end to end, from setup and logistics to on-site execution and audience-facing experience design.",
    skills_eyebrow: "Skills",
    skills_title:
      "Broad technical coverage, strongest where real-time production meets complex interaction.",
    skill_unreal_title: "Unreal Engine",
    skill_unreal_desc:
      "Advanced UE4/UE5 workflows with practical C++ and Blueprint implementation for gameplay, interaction, and systems design.",
    skill_arvr_title: "AR/VR Simulations",
    skill_arvr_desc:
      "Scenario-based simulations for training and high-stakes environments, with strong hands-on work in UI/UMG, Behavior Trees + EQS, and VR interaction systems.",
    skill_product_title: "Product Development",
    skill_product_desc:
      "Product scoping, workflow mapping, release planning, and hands-on development with a strong product-thinking mindset.",
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
      "Strong AI-assisted development workflow for implementation, refactors, debugging, and deeper C++ assistance when needed.",
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
    contact_eyebrow: "Contact",
    contact_title: "Let's scope your build.",
    contact_copy: "Send a short brief and I will reply with next steps.",
    contact_linkedin: "LinkedIn Profile",
    footer_text: "Larion Siments | Unreal Engine, VR, Real-Time Production",
  },
  he: {
    nav_home: "בית",
    nav_work: "עבודות Unreal",
    nav_founder: "פיתוח מוצר",
    nav_tools: "כלים פנימיים",
    nav_interactive: "Unreal / VR",
    nav_about: "יכולות",
    nav_showreel: "שואוריל",
    nav_background: "רקע",
    nav_skills: "יכולות",
    nav_contact: "יצירת קשר",
    header_cta: "יצירת קשר",
    hero_eyebrow: "מפתח Unreal Engine / VR",
    hero_title:
      "Unreal Engine, <span>הפקת VR,</span> וחוויות אינטראקטיביות בזמן אמת",
    hero_copy:
      "אני מפתח ומשיק חוויות Unreal Engine להדרכה, סימולציה, משחקים ומוצרים אינטראקטיביים.",
    hero_choose: "צפו בעבודות Unreal",
    hero_contact: "צפו בשואוריל",
    hero_resume: "הורד קורות חיים",
    ue_statement_label: "מה אני מוסר",
    ue_statement_title:
      "חוויות Unreal Engine שנבנות למשתמשים אמיתיים, חומרה אמיתית ותנאי עבודה אמיתיים.",
    ue_statement_copy:
      "אני מוביל פרויקטי VR וזמן אמת דרך תכנון טכני, פיתוח hands-on, אופטימיזציה, QA והשקה.",
    ue_work_label: "עבודות הפקה נבחרות",
    ue_work_title: "הדרכה, משחקים ומערכות אימרסיביות — נמסרו ב-Unreal.",
    ue_work_copy: "מבחר עבודות שפורסמו ועבודות הפקה ללקוחות.",
    ue_case1_kicker: "מערכות הדרכה ב-VR",
    ue_case1_title: "הדרכה תחת לחץ",
    ue_case1_copy: "תרחישי VR לרפואה, תגובת חירום, מלונאות וצוותים ארגוניים.",
    ue_case1_cta: "צפו בעבודות ההדרכה",
    ue_case2_kicker: "משחק VR שפורסם",
    ue_case2_title: "Hover The Edge",
    ue_case2_copy:
      "משחק VR מלא שפורסם ב-Steam — gameplay, אינטראקציה, UI, ביצועים והשקה.",
    ue_case2_cta: "לצפייה ב-Steam",
    ue_case3_kicker: "תעשייתי / חווייתי",
    ue_case3_title: "מערכות Unreal אינטראקטיביות",
    ue_case3_copy:
      "תאומים דיגיטליים, תצוגות מוצר ויישומי זמן אמת למוצרים וסביבות מורכבים.",
    ue_case3_cta: "צפו בעבודות האינטראקטיביות",
    ue_cap_label: "יכולות הפקה",
    ue_cap_title: "פיתוח Unreal hands-on לאורך כל מחזור ההפקה.",
    ue_cap1_title: "הדרכת VR וסימולציה",
    ue_cap1_copy:
      "לוגיקת תרחישים, אינטראקציה מרחבית, מערכות משוב, התנהגות AI ו-UX להדרכה.",
    ue_cap2_title: "פיתוח gameplay ומערכות",
    ue_cap2_copy:
      "מערכות C++ ו-Blueprint ל-gameplay, UI/UMG, מצב, כלים והתנהגות בזמן ריצה.",
    ue_cap3_title: "אופטימיזציה ופריסה",
    ue_cap3_copy:
      "Profiling, QA, מגבלות פלטפורמה ומסירה ל-PC, מובייל, iOS ו-VR.",
    ue_beyond_label: "פיתוח נוסף",
    ue_beyond_title: "כשהעבודה מתרחבת מעבר ל-Unreal.",
    ue_beyond_copy:
      "אני מספק גם מוצרי web תומכים, כלים תפעוליים ומערכות פנימיות סביב חוויית הזמן אמת.",
    ue_beyond_founder: "פיתוח מוצר",
    ue_beyond_tools: "מערכות פנימיות",
    ue_beyond_link: "צפו בעבודה",
    ue_contact_title: "צריכים תמיכת הפקה בכירה ב-Unreal Engine או VR?",
    ue_contact_copy: "שלחו את הפלטפורמה, ההיקף, לוח הזמנים ומה צריך לצאת לשוק.",
    hero_proof_1: "פיתוח מוצר",
    hero_proof_2: "כלים פנימיים",
    hero_proof_3: "הפקת Unreal / VR",
    profile_role: "מפתח Unreal Engine / VR",
    profile_note:
      "מסירה מקצה לקצה ב-Unreal Engine, VR, מערכות אינטראקטיביות ותוכנת מוצר.",
    profile_link: "צפה בלינקדאין",
    selector_eyebrow: "בחרו מסלול",
    selector_title: "מה אתם צריכים לבנות?",
    selector_copy:
      "בחרו את המסלול שמתאים לתוצאה שאתם צריכים. כל מסלול בנוי סביב סוג אחר של פרויקט.",
    home_gate_eyebrow: "בחרו מסלול",
    home_gate_title: "מה צריך לבנות?",
    home_gate_copy: "בחרו את המסלול שמתאים לסוג הבנייה שאתם צריכים.",
    home_founder_short: "גרסאות מוצר ראשונות ממוקדות ליזמים ולצוותי מוצר.",
    home_tools_short: "דשבורדים, תהליכי צוות ומערכות אוטומציה שימושיות.",
    home_interactive_short: "הפקת Unreal ו-VR בזמן אמת סביב אינטראקציה.",
    home_door_enter: "כניסה למסלול",
    lane_best_fit: "מתאים במיוחד",
    lane_founder_kicker: "מסלול יזמים",
    lane_founder_desc: "ליזמים שצריכים גרסת מוצר ראשונה ממוקדת ואמינה.",
    lane_founder_fit: "יזמים שצריכים מסירת מוצר בכירה לפני הקמת צוות פנימי.",
    lane_founder_cta: "לעבודות פיתוח מוצר",
    lane_founder_title: "פיתוח מוצר",
    lane_tools_kicker: "מסלול תפעולי",
    lane_tools_desc:
      "לצוותים שצריכים דשבורדים, כלים תהליכיים, מערכות אדמין או אפליקציות פנימיות עם עזרת AI.",
    lane_tools_fit: "צוותים שרוצים להחליף כאוס של גיליונות ותהליכים ידניים.",
    lane_tools_cta: "למסלול הכלים",
    lane_tools_title: "כלים פנימיים / אוטומציה",
    lane_interactive_kicker: "מסלול Real-Time",
    lane_interactive_desc:
      "ללקוחות שצריכים פיתוח Unreal, מערכות VR, חוויות אינטראקטיביות או הפקת הדרכה אימרסיבית.",
    lane_interactive_fit:
      "צוותים שצריכים אינטראקציה בזמן אמת, חשיבת סימולציה או UX מרחבי.",
    lane_interactive_cta: "לעבודות Unreal / VR",
    lane_interactive_title: "הפקת Unreal / VR",
    cred_1: "Unreal Engine / VR",
    cred_2: "פיתוח מואץ AI",
    cred_3: "הפקה בזמן אמת",
    cred_4: "C++ / Blueprints / חשיבה מוצרית",
    about_eyebrow: "למה מביאים אותי",
    about_title:
      "רחב מספיק לתוכנת מוצר ולכלים, והכי חזק במקום שבו אינטראקציה באמת חשובה.",
    about_copy:
      "אני זז מהר מהיקף גולמי לבנייה עובדת, משתמש ב-AI כדי להאיץ מימוש, ונשאר פרקטי לגבי מה באמת צריך לעלות ראשון.",
    overview_title_1: "גרסאות ראשונות ממוקדות",
    overview_body_1:
      "גרסאות מוצר עובדות עם חוויית הליבה, המערכות ונתיב המסירה במקום.",
    overview_title_2: "מערכות פנימיות שימושיות",
    overview_body_2:
      "דשבורדים, כלי workflow וכלים עם AI שנבנים סביב חיכוך תפעולי אמיתי.",
    overview_title_3: "עומק ב-Unreal / VR",
    overview_body_3:
      "אינטראקציה בזמן אמת, לוגיקת סימולציה, מערכות אימרסיביות וחוויות הדרכה כשהפרויקט צריך חשיבה מרחבית.",
    metric_years: "שנים של בניית מוצרים אינטראקטיביים וסימולציות",
    metric_projects: "פרויקטים שהושלמו ונמסרו",
    metric_stack: "הפקה טכנית עם C++, Blueprints ותהליכי AI",
    metric_scope_title: "מסירה מקצה לקצה",
    metric_scope_desc: "תכנון, UX, מימוש, QA, איטרציה ומוצרים מוכנים להשקה",
    founder_title: "מוצרי יזמים שנבנים למשתמשים אמיתיים ולהחלטות אמיתיות.",
    founder_lead:
      "ליזמים שצריכים גרסת מוצר ראשונה ואמינה שאפשר להציג למשתמשים, משקיעים ושותפים.",
    founder_eyebrow: "פיתוח מוצר",
    founder_for_title: "למי זה מתאים",
    founder_for_1: "יזמים שעוברים מאסטרטגיית מוצר לגרסה ראשונה",
    founder_for_2: "סטארטאפים שצריכים מוצר מוכן למשקיעים וללקוחות",
    founder_for_3: "צוותים שצריכים מסירה מנוסה לפני גיוס במשרה מלאה",
    founder_build_title: "מה אני מוסר",
    founder_build_1: "יסודות מוצר ל-web ולמובייל עם זרימות ליבה שלמות",
    founder_build_2: "גרסאות ראשונות מוכנות למשקיעים וללקוחות",
    founder_build_3: "מערכות social, discovery ומעורבות",
    founder_build_4: "יסודות מוצר עם בקרות פרטיות ואמון",
    founder_step_1_title: "להגדיר את הגרסה הראשונה הנכונה",
    founder_step_1_body:
      "הופכים את מטרת המוצר להיקף ברור, מסע משתמש ויעד מסירה.",
    founder_step_2_title: "לבנות את מוצר הליבה",
    founder_step_2_body:
      "מפתחים את האינטראקציה, הלוגיקה, הנתונים והממשק שנדרשים לגרסה קוהרנטית.",
    founder_step_3_title: "לשמור על לולאת משוב צמודה",
    founder_step_3_body:
      "סוקרים תוכנה עובדת מוקדם, מתאימים היקף בחוכמה ושומרים על קצב המסירה.",
    founder_step_4_title: "לחזק את החוויה",
    founder_step_4_body:
      "מחדדים את ה-UX, מקרי הקצה ואיכות ההצגה שהמשתמשים יפגשו.",
    founder_step_5_title: "להכין את ההשקה",
    founder_step_5_body: "מוסרים מוצר מוכן להשקה עם נתיב ברור להמשך הפיתוח.",
    founder_example_chip_1: "Lighthouse Feed + Stories",
    founder_example_title_1:
      "משטח חברתי מרכזי שיצא מוקדם להצגות למשקיעים ולמשתמשים",
    founder_example_body_1:
      "מימשתי פיד, סטוריז וקומפוזר מהיר לפוסט כדי שהמוצר ירגיש עובד כבר בדמו הראשון.",
    founder_example_chip_2: "גילוי אנשים בקרבת מקום",
    founder_example_title_2:
      "כרטיסי אנשים בקרבת מקום שהופכים גילוי לפעולה מיידית",
    founder_example_body_2:
      "נבנו הצעות nearby עם פעולות חברות מהירות כדי לבדוק מעבר מצפייה לחיבור אמיתי בין אנשים.",
    founder_example_chip_3: "מפת אנשים",
    founder_example_title_3: "תצוגת מפה לאנשים עם הקשר מיקום אבל בלי חשיפת יתר",
    founder_example_body_3:
      "הזרימה העובדת חיברה בין נראות נוכחות וחיפוש אנשים כך שניתן לגלות קשרים בלי לחשוף מיקום מדויק.",
    founder_example_chip_4: "לולאת מעורבות",
    founder_example_title_4:
      "זרימת אינטראקציה בפוסטים שנועדה למדוד חזרה ושימוש מתמשך",
    founder_example_body_4:
      "כרטיסי פוסטים עם ריאקשנים ושמירה נבנו כדי למדוד אם משתמשים מוקדמים חוזרים וממשיכים לפעול.",
    founder_cta_title: "צריכים גרסת מוצר ראשונה שבאמת יכולה לצאת לשוק?",
    founder_cta_body:
      "שלחו את מטרת המוצר, משתמשי הליבה ויעד המסירה. אני אעזור לעצב את ההיקף ולבנות את הגרסה הראשונה.",
    founder_cta_button: "בואו נדבר על פיתוח מוצר",
    tools_title: "כלים פנימיים שמפחיתים חיכוך תפעולי וחוסכים זמן לצוות.",
    tools_lead:
      "לצוותים שצריכים מערכות שימושיות במהירות: דשבורדים, זרימות אדמין וכלים בעזרת AI סביב עבודה אמיתית. AGE הוא אחד המוצרים הפנימיים שבהם יישמתי את הגישה הזאת.",
    tools_eyebrow: "כלים פנימיים / אוטומציה",
    tools_build_title: "מה אני מוסר",
    tools_build_1: "דשבורדים ופאנלים לניהול",
    tools_build_2: "מערכות workflow ופורטלים פנימיים",
    tools_build_3: "חוזי UI משותפים בין צוותים ופלטפורמות",
    tools_build_4: "כלים עם AI למשימות צוות חוזרות",
    tools_outcomes_title: "למה צוותים מביאים אותי",
    tools_outcomes_1: "להפחית עבודה חוזרת וחיכוך בין שלבים",
    tools_outcomes_2: "לרכז תהליכים מבולגנים לממשק אחד שימושי",
    tools_outcomes_3: "להחליף פיזור אקסלים בממשקים ייעודיים",
    tools_outcomes_4: "לשחרר משהו שימושי מהר ולשפר לפי שימוש אמיתי",
    tools_example_chip_1: "Creator Console",
    tools_example_title_1:
      "משטח תפעולי אחד שמרכז אינבנטורי, viewport וצ'אט runtime",
    tools_example_body_1:
      "ב-AGE קונסולת היוצר איחדה דפדפן תוכן, חלון סימולציה וצ'אט סוכן כדי לעבוד בלי קפיצות הקשר.",
    tools_example_chip_2: "LiveUI Editor",
    tools_example_title_2: "זרימת עריכת ווידג'טים עם אימות חזותי מיידי",
    tools_example_body_2:
      "זרימת LiveUI מאפשרת עריכת רכיבי ממשק, תצוגה מיידית ושמירה על התאמה לחוזי state משותפים.",
    tools_example_chip_3: "Viewport Controls",
    tools_example_title_3: "בקרות ידידותיות למפעיל לשינויים מהירים בסימולציה",
    tools_example_body_3:
      "בקרות drag/rotate/scale ומתגי איכות נחשפו לאיטרציה מהירה שמתאימה למקלדת ולתהליכי QA.",
    tools_step_1_title: "למפות את ה-workflow",
    tools_step_1_body:
      "מאפיינים את צוואר הבקבוק, את העבודה הכפולה ואת ההחלטות שצריכות ממשק ברור יותר.",
    tools_step_2_title: "לבנות קודם את המשטח השימושי",
    tools_step_2_body:
      "מתחילים מהדשבורד, הפאנל או הזרימה שמורידים את הכי הרבה חיכוך.",
    tools_step_3_title: "לחדד את הלולאה",
    tools_step_3_body:
      "נותנים לצוות להשתמש מהר, מזהים מקרי קצה ופשוטים על סמך שימוש אמיתי.",
    tools_step_4_title: "להוסיף אוטומציה היכן שזה מועיל",
    tools_step_4_body:
      "מכניסים AI או אוטומציית workflow למשימות הצרות שבהן זה חוסך זמן בצורה אמינה.",
    tools_cta_title: "צריך כלי פנימי שבאמת מתאים ל-workflow?",
    tools_cta_body:
      "אם התהליך הנוכחי מפוזר בין אקסלים, שיחות צ'אט ומעקבים ידניים, אני יכול לעזור להפוך אותו למערכת אחת שימושית.",
    tools_cta_button: "דברו איתי על כלי",
    contact_panel_eyebrow: "יצירת קשר ישירה",
    contact_panel_title: "בחרו את ערוץ הקשר המועדף.",
    contact_panel_copy:
      "אימייל מתאים למפרטים מפורטים. וואטסאפ מתאים לתיאום מהיר.",
    contact_channel_email_label: "אימייל",
    contact_channel_email_note: "מפרטים מפורטים",
    contact_channel_whatsapp_label: "וואטסאפ ישראל",
    contact_channel_whatsapp_note: "תיאום מהיר",
    contact_channel_thailand_label: "וואטסאפ תאילנד",
    contact_channel_thailand_note: "שעון בנגקוק",
    contact_channel_linkedin_label: "לינקדאין",
    contact_channel_linkedin_note: "רקע",
    interactive_title:
      "מערכות Unreal ו-VR שנבנות לאינטראקציה תובענית בזמן אמת.",
    interactive_lead:
      "אני מוסר מערכות הדרכה אימרסיביות, משחקים וחוויות אינטראקטיביות לאורך כל מחזור ההפקה ב-Unreal.",
    interactive_eyebrow: "פיתוח Unreal Engine / VR",
    interactive_build_title: "מה אני מוסר",
    interactive_build_1: "פיתוח Unreal Engine לחוויות תלת-ממד אינטראקטיביות",
    interactive_build_2: "מערכות הדרכה ב-VR וסימולציה מבוססת תרחישים",
    interactive_build_3: "Gameplay, UI, כלים ומערכות אינטראקציה בזמן אמת",
    interactive_build_4: "אופטימיזציה, QA, פריסה ומסירה לפלטפורמות",
    interactive_for_title: "איפה אני משתלב",
    interactive_for_1: "צוותים שמוסרים מוצרי הדרכה או סימולציה ב-VR",
    interactive_for_2: "סטודיואים שצריכים פיתוח Unreal בכיר ובעלות על מערכות",
    interactive_for_3:
      "ארגונים שמשיקים תלת-ממד אינטראקטיבי ב-PC, מובייל, iOS או VR",
    interactive_for_4: "צוותי הפקה שצריכים מוביל טכני hands-on",
    immersive_work_eyebrow: "עבודות אינטראקטיביות נבחרות",
    immersive_work_title:
      "עבודות שנמסרו בתחומי הדרכה, משחקים ומערכות אינטראקטיביות",
    immersive_chip_1: "סימולציית הדרכה",
    immersive_title_1: "תוכניות סימולציה רפואיות וחירום",
    immersive_body_1:
      "הובלתי מסירה של סביבות AR/VR ממוקדות סימולציה עבור שירותי חירום, בתי חולים והדרכות ארגוניות.",
    immersive_chip_2: "כותרת VR שיצאה לשוק",
    immersive_title_2: "Hover The Edge",
    immersive_body_2:
      "בניתי ושחררתי כותרת VR ב-Steam תוך ניהול תהליכי Unreal מהקונספט ועד ההשקה.",
    immersive_chip_3: "מסירה בזמן אמת",
    immersive_title_3: "הפקת Unreal חוצת פלטפורמות בחמש פלטפורמות",
    immersive_body_3:
      "סיפקתי עבודות Unreal Engine 4/5 ל-PC, מובייל, iOS, VR וצינורות קולנועיים, עם איזון בין ביצועים, אינטראקציה ופריסה.",
    immersive_link: "צפה ב-Steam",
    interactive_cta_title: "צריכים תמיכת הפקה מנוסה ב-Unreal Engine או VR?",
    interactive_cta_body:
      "אני יכול לקחת בעלות על מערכות ליבה, אינטראקציה, אופטימיזציה, QA ומסירה לאורך מחזור ההפקה ב-Unreal.",
    interactive_cta_button: "בואו נדבר על עבודת Unreal / VR",
    gallery_eyebrow: "גלריית פרויקטים",
    gallery_title: "פריימים מעבודות שפורסמו ומעבודות ללקוחות",
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
      "בנייה של Playtika VR bingo לשם סקירת UI ואינטראקציה, עם דגש על קריאות קלפים ומשוב מהיר על מצב המשחק.",
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
    founder_process_title: "מגדירים את הגרסה הנכונה ואז בונים אותה במשמעת.",
    founder_examples_eyebrow: "דוגמאות",
    founder_examples_title:
      "מערכות המוצר של Lighthouse שנבנו סביב אימוץ, אמון ומעורבות יומית.",
    tools_examples_eyebrow: "דוגמאות",
    tools_examples_title:
      "דוגמאות מ-AGE Creator Console שממוקדות במהירות פנימית, עקביות ובקרת QA.",
    tools_process_eyebrow: "תהליך",
    tools_process_title:
      "מאתרים את החיכוך, בונים את הממשק השימושי, ומחדדים לפי שימוש אמיתי.",
    contact_widget_eyebrow: "בקשת פרויקט",
    contact_widget_title: "ספרו לי על העבודה",
    contact_widget_copy: "שתפו פלטפורמה, היקף ולוח זמנים.",
    contact_widget_name: "שם",
    contact_widget_contact: "אימייל או וואטסאפ",
    contact_widget_message_label: "בקשת בנייה",
    contact_widget_name_placeholder: "השם שלך",
    contact_widget_contact_placeholder: "איך הכי נוח לחזור אליך",
    contact_widget_message_placeholder: "פלטפורמה, היקף, לוח זמנים ויעד מסירה",
    contact_widget_submit: "שליחת בקשה",
    contact_widget_note: "",
    contact_widget_sending: "הבקשה נשלחת...",
    contact_widget_success: "נשלח. אחזור אליך בקרוב.",
    contact_widget_error:
      "משהו השתבש. אפשר לשלוח לי מייל ישירות ל-Larion1@gmail.com.",
    background_eyebrow: "רקע",
    background_title:
      "שילוב של הובלת מסירה, פיתוח hands-on וחשיבה מוצרית בביצוע.",
    skills_eyebrow: "יכולות",
    skills_title:
      "כיסוי טכני רחב, הכי חזק במקום שבו הפקה בזמן אמת פוגשת אינטראקציה מורכבת.",
    skill_product_title: "פיתוח מוצר",
    skill_product_desc:
      "הגדרת היקף מוצר, מיפוי workflow, תכנון השקה ופיתוח hands-on עם חשיבה מוצרית חזקה.",
    toolstack_title: "סט כלי עבודה",
    language_title: "רמת שפות",
    contact_eyebrow: "יצירת קשר",
    contact_title: "בואו נגדיר את הבנייה.",
    contact_copy: "שלחו בריף קצר ואחזור אליכם עם הצעדים הבאים.",
    contact_linkedin: "פרופיל לינקדאין",
    footer_text: "לריון סימנטס | Unreal Engine, VR והפקה בזמן אמת",
  },
};

const i18nNodes = Array.from(document.querySelectorAll("[data-i18n]"));
const langToggle = document.querySelector("[data-lang-toggle]");
const langLabel = document.querySelector("[data-lang-label]");
let activeLanguage = "en";

const getTranslation = (key) =>
  i18n[activeLanguage]?.[key] ?? i18n.en[key] ?? "";

const updateLanguageToggleUi = () => {
  if (!langLabel || !langToggle) return;
  const nextLanguage = activeLanguage === "en" ? "HE" : "EN";
  langLabel.textContent = nextLanguage;
  langToggle.setAttribute(
    "aria-label",
    activeLanguage === "en"
      ? "Switch language to Hebrew"
      : "Switch language to English",
  );
};

const applyLanguage = (language) => {
  activeLanguage = language === "he" ? "he" : "en";
  const dictionary = i18n[activeLanguage];

  i18nNodes.forEach((node) => {
    const key = node.dataset.i18n;
    const translated = dictionary[key] ?? i18n.en[key];
    if (!translated) return;

    if (node.dataset.i18nHtml === "true") {
      node.innerHTML = translated;
    } else if (node.dataset.i18nPreserve !== "true") {
      node.textContent = translated;
    }

    if (node.dataset.i18nAttrs) {
      node.dataset.i18nAttrs
        .split(",")
        .map((attribute) => attribute.trim())
        .filter(Boolean)
        .forEach((attribute) => node.setAttribute(attribute, translated));
    }
  });

  document.documentElement.lang = activeLanguage;
  document.documentElement.dir = activeLanguage === "he" ? "rtl" : "ltr";
  document.body.classList.toggle("lang-he", activeLanguage === "he");
  updateLanguageToggleUi();

  try {
    window.localStorage.setItem("portfolio_lang", activeLanguage);
  } catch {
    // Language still works when storage is unavailable.
  }

  window.dispatchEvent(
    new CustomEvent("portfolio-language-change", {
      detail: { lang: activeLanguage },
    }),
  );
};

let storedLanguage = null;
try {
  storedLanguage = window.localStorage.getItem("portfolio_lang");
} catch {
  storedLanguage = null;
}

const browserLanguageIsHebrew = window.navigator.language
  ?.toLowerCase()
  .startsWith("he");
applyLanguage(
  storedLanguage === "en" || storedLanguage === "he"
    ? storedLanguage
    : browserLanguageIsHebrew
      ? "he"
      : "en",
);

langToggle?.addEventListener("click", () => {
  applyLanguage(activeLanguage === "en" ? "he" : "en");
});

const revealItems = Array.from(document.querySelectorAll(".reveal"));

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");

const setMenuState = (open) => {
  document.body.classList.toggle("menu-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  const menuLabel = menuToggle?.querySelector(".sr-only");
  if (menuLabel)
    menuLabel.textContent = open ? "Close navigation" : "Open navigation";
};

menuToggle?.addEventListener("click", () => {
  setMenuState(!document.body.classList.contains("menu-open"));
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuState(false);
});

const header = document.querySelector("[data-header]");
const progress = document.querySelector("[data-scroll-progress]");
const parallaxMedia = document.querySelector("[data-parallax-media]");
let scrollFrame = null;

const updateScrollUi = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollRange = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const scrollProgress = Math.min(1, Math.max(0, scrollTop / scrollRange));

  header?.classList.toggle("is-scrolled", scrollTop > 24);
  progress?.style.setProperty("--scroll-progress", String(scrollProgress));

  if (
    parallaxMedia &&
    !prefersReducedMotion &&
    scrollTop < window.innerHeight * 1.15
  ) {
    parallaxMedia.style.translate = `0 ${Math.min(42, scrollTop * 0.045)}px`;
  }

  scrollFrame = null;
};

const requestScrollUiUpdate = () => {
  if (scrollFrame !== null) return;
  scrollFrame = window.requestAnimationFrame(updateScrollUi);
};

window.addEventListener("scroll", requestScrollUiUpdate, { passive: true });
window.addEventListener("resize", requestScrollUiUpdate, { passive: true });
updateScrollUi();

const contactForms = document.querySelectorAll("[data-contact-form]");
const contactFormStateMessages = {
  idle: () => getTranslation("contact_widget_note"),
  sending: () => getTranslation("contact_widget_sending"),
  success: () => getTranslation("contact_widget_success"),
  error: () => getTranslation("contact_widget_error"),
};

contactForms.forEach((form) => {
  const statusElement = form.querySelector(".contact-request-note");
  const submitButton = form.querySelector(".contact-submit");
  const contactInput = form.querySelector('input[name="contact"]');
  const endpoint = "https://formsubmit.co/ajax/Larion1@gmail.com";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+()\d\s.-]{7,}$/;

  if (statusElement) {
    statusElement.setAttribute("role", "status");
    statusElement.setAttribute("aria-live", "polite");
    statusElement.setAttribute("aria-atomic", "true");
  }

  const setStatus = (message, state = "idle") => {
    if (!statusElement) return;
    statusElement.textContent = message;
    statusElement.dataset.state = state;
    form.dataset.contactState = state;
  };

  const refreshStatusForLanguage = () => {
    const state = form.dataset.contactState || "idle";
    setStatus(
      (contactFormStateMessages[state] ?? contactFormStateMessages.idle)(),
      state,
    );
  };

  contactInput?.addEventListener("input", () =>
    contactInput.setCustomValidity(""),
  );
  refreshStatusForLanguage();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const contactValue = String(formData.get("contact") || "").trim();

    if (!emailPattern.test(contactValue) && !phonePattern.test(contactValue)) {
      contactInput?.setCustomValidity(
        "Enter a valid email address or WhatsApp number.",
      );
      contactInput?.reportValidity();
      return;
    }

    formData.set(
      "_subject",
      form.dataset.requestSubject || "Website request from portfolio",
    );
    formData.set("_template", "table");
    formData.set("_captcha", "false");
    if (emailPattern.test(contactValue)) formData.set("_replyto", contactValue);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }
    setStatus(getTranslation("contact_widget_sending"), "sending");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (!response.ok)
        throw new Error(
          `Form submission failed with status ${response.status}`,
        );
      form.reset();
      setStatus(getTranslation("contact_widget_success"), "success");
    } catch (error) {
      console.error("Contact form submission failed:", error);
      setStatus(getTranslation("contact_widget_error"), "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });

  window.addEventListener(
    "portfolio-language-change",
    refreshStatusForLanguage,
  );
});
