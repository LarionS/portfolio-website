import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, ArrowRight, ArrowLeft, Check, X, Plus, Minus, List, Play, Pause, CornersOut, Monitor, VirtualReality, Heartbeat, ChartLineUp, GameController, EnvelopeSimple, WhatsappLogo } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import hero from "../assets/brand/editorial/playframe-worlds-hero.webp";
import heroSmall from "../assets/brand/editorial/playframe-worlds-hero-960.webp";
import clinical from "../assets/brand/photography/clinical-training.webp";
import clinicalSmall from "../assets/brand/photography/clinical-training-960.webp";
import connected from "../assets/brand/photography/connected-training.webp";
import connectedSmall from "../assets/brand/photography/connected-training-960.webp";
import emergency from "../assets/brand/photography/emergency-training.webp";
import emergencySmall from "../assets/brand/photography/emergency-training-960.webp";
import hoverPoster from "../assets/journey/hover-the-edge/hover-story-v2-poster.jpg";
import hoverVideo from "../assets/journey/hover-the-edge/hover-story-v2-web.mp4";
import flyboxPoster from "../assets/journey/flybox/flybox-story-v2-poster.jpg";
import flyboxVideo from "../assets/journey/flybox/flybox-story-v2-web.mp4";
import lighthouse from "../assets/journey/apps/lighthouse-feed-stories.webp";
import moneyNest from "../assets/journey/apps/moneynest-home.webp";
import biteSync from "../assets/journey/apps/bitesync-health-chat.webp";

const EMAIL = "Larion1@gmail.com";
const WHATSAPP = "https://wa.me/972504931021";
const ease = [0.22, 1, 0.36, 1] as const;

function Mark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 110" fill="currentColor" aria-hidden="true"><path d="M43 5a5 5 0 0 1 6-4l40 14a10 10 0 0 1 7 10v58a6 6 0 0 1-8 6L62 79l18-12V31L43 18V5Z" /><path d="M57 105a5 5 0 0 1-6 4L11 95a10 10 0 0 1-7-10V27a6 6 0 0 1 8-6l26 10-18 12v36l37 13v13Z" /></svg>;
}
function Brand() { return <span className="brand"><Mark /><span>playframe<span className="brand-period">.</span></span></span>; }
function Label({ children, light = false }: { children: ReactNode; light?: boolean }) { return <p className={`eyebrow${light ? " eyebrow-light" : ""}`}><span aria-hidden="true" />{children}</p>; }
function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: 0.7, ease, delay: reduced ? 0 : delay }}>{children}</motion.div>;
}
function Picture({ src, small, alt, eager = false }: { src: string; small?: string; alt: string; eager?: boolean }) {
  return <picture>{small && <source media="(max-width: 700px)" srcSet={small} />}<img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : "auto"} /></picture>;
}

function useCompactLayout() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const update = () => setCompact(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return compact;
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 70);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const close = () => menu.current?.close();
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <a href="#top" aria-label="Playframe home"><Brand /></a>
      <span className="header-studio">Independent studio.<br />Unreal possibilities.</span>
      <nav className="desktop-nav" aria-label="Main navigation"><a href="#work">Selected work <span>01</span></a><a href="#expertise">Our expertise <span>02</span></a><a className="nav-contact" href="#contact">Let’s talk <ArrowUpRight aria-hidden="true" /></a></nav>
      <button className="mobile-menu-button" type="button" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => { menu.current?.showModal(); setMenuOpen(true); }}><List /></button>
    </header>
    <dialog id="mobile-menu" className="menu-dialog" ref={menu} onClose={() => setMenuOpen(false)}>
      <div className="menu-inner"><div className="menu-top"><Brand /><button className="icon-button" type="button" onClick={close} aria-label="Close navigation"><X /></button></div>
        <nav aria-label="Mobile navigation"><a href="#work" onClick={close}><span>01</span>Selected work<ArrowUpRight /></a><a href="#expertise" onClick={close}><span>02</span>Our expertise<ArrowUpRight /></a><a href="#contact" onClick={close}><span>03</span>Let’s talk<ArrowUpRight /></a></nav>
        <a className="menu-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </div>
    </dialog>
  </>;
}

function Hero() {
  const reduced = useReducedMotion();
  return <section className="hero" id="top" aria-labelledby="hero-title">
    <motion.div className="hero-image" initial={reduced ? false : { scale: 1.035 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease }}><Picture src={hero} small={heroSmall} alt="Original visualization of a VR participant wearing a haptic vest, between a physical training stage and a virtual architectural world" eager /></motion.div>
    <div className="hero-shade" />
    <div className="hero-content"><motion.div initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.12, ease }}>
      <Label light>Unreal Engine / VR / Connected systems</Label><h2>Virtual worlds.<br />Real-world impact.</h2><p>We build immersive training and interactive experiences that connect people, software and the physical world.</p><a className="hero-link" href="#work">Explore our work <span><ArrowDown weight="bold" aria-hidden="true" /></span></a>
    </motion.div></div>
    <div className="hero-bottom"><motion.h1 id="hero-title" initial={reduced ? false : { opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.25, ease }}>PLAYFRAME</motion.h1><div className="hero-baseline"><span>From the first frame. To the real world.</span><span>Original studio visualization</span><a href="#work" aria-label="Scroll to selected work">Scroll to explore <ArrowDown aria-hidden="true" /></a></div></div>
  </section>;
}

type Project = { number: string; category: string; title: string; line: string; image: string; small: string; alt: string; description: string; capabilities: string[]; context: string };
const projects: Project[] = [
  { number: "01", category: "Healthcare & clinical training", title: "Practice before it matters.", line: "Immersive training for the people we depend on.", image: clinical, small: clinicalSmall, alt: "Original visualization of a clinician in VR, a patient mannequin and an instructor in a hospital training room", description: "Clinical and nursing simulations that let teams rehearse complex situations in a controlled virtual environment. Built for hospital training and emergency medicine, with the software and instructor tools that support the session.", capabilities: ["Unreal Engine & VR development", "Clinical scenarios and interactions", "Instructor-led training workflows"], context: "Work spans hospitals across Israel, nursing training and MADA. Project material is confidential; the image is an original visualization, not a client screenshot." },
  { number: "02", category: "Connected military training", title: "Six people. One reality.", line: "A complete multiplayer system, from command to feedback.", image: connected, small: connectedSmall, alt: "Original visualization of VR trainees and a connected instructor console", description: "An Unreal Engine multiplayer training system connecting up to six participants over LAN. Instructors control in-world events from a PC or tablet, while tracked equipment, wearable vitals and haptic feedback connect the physical and virtual experience.", capabilities: ["Up to six simultaneous LAN participants", "PC & tablet instructor control", "Galaxy Watch vitals integration", "Wonderfitter gun & rifle tracking", "bHaptics suit integration"], context: "The technical capabilities describe the project. The visualization and interactive overview protect confidential client environments, interfaces and operational details." },
  { number: "03", category: "Police, fire & emergency services", title: "Ready for the unexpected.", line: "Dynamic environments. Decisions with consequences.", image: emergency, small: emergencySmall, alt: "Original visualization of police, fire and medical training roles in an emergency scenario", description: "Virtual training for emergency-service roles, built around evolving incidents and decisions under pressure. Believable environments and purposeful interactions give teams a space to practise before facing the real situation.", capabilities: ["Interactive emergency scenarios", "Role-specific training experiences", "Unreal Engine environments & systems"], context: "Original category visualization. No client footage, operational material or confidential screenshots are displayed." },
];
function Work({ onSelect }: { onSelect: (project: Project) => void }) {
  return <section className="work-section section-pad" id="work" aria-labelledby="work-title">
    <div className="section-intro"><Reveal><Label>01 — Selected work</Label><h2 id="work-title">Made to be experienced.<br /><span>Built to make a difference.</span></h2></Reveal><Reveal className="intro-note" delay={0.08}><p>Training for critical moments.<br />Worlds that move you.<br />The engineering behind both.</p><svg className="direction-arrow" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M7 7 57 57M57 57V8M57 57H8" stroke="currentColor" strokeWidth="2" /></svg></Reveal></div>
    <div className="project-grid">{projects.map((project, index) => <Reveal className={`project project-${project.number}`} key={project.number} delay={index === 1 ? 0.1 : 0}><button className="project-open" type="button" onClick={() => onSelect(project)} aria-label={`Explore ${project.category}`}>
      <div className="project-image"><Picture src={project.image} small={project.small} alt={project.alt} /><span className="project-image-note">Original visualization</span><span className="project-view">Explore project <ArrowUpRight aria-hidden="true" /></span></div><div className="project-category"><span>{project.category}</span><span>/{project.number}</span></div><div className="project-title-row"><h3>{project.title}</h3><span className="project-arrow"><ArrowUpRight aria-hidden="true" /></span></div><p>{project.line}</p>
    </button></Reveal>)}
      <Reveal className="work-note"><Mark /><h3>The experience is only<br />half the story.</h3><p>Behind every virtual world: the controls, connections and physical hardware that make it work.</p><a className="text-link" href="#expertise">Meet the whole system <ArrowDown aria-hidden="true" /></a><small>Confidential work is shown through original visualizations. The capabilities are real; client material stays private.</small></Reveal>
    </div>
  </section>;
}

const stages = [
  { title: "Set the scenario.", body: "The instructor changes the situation from a PC or tablet. The Unreal world responds.", status: "An instructor event enters the shared scenario." },
  { title: "Connect the team.", body: "Up to six trainees share the same session over LAN. Each person sees the same unfolding event.", status: "Six participants share one synchronized session." },
  { title: "Make it physical.", body: "Tracked equipment, Galaxy Watch vitals and bHaptics feedback bring the body into the loop.", status: "Tracked input, wearable vitals and haptics connect." },
  { title: "Close the loop.", body: "Actions and connected-device data flow back to the system, giving the instructor a view beyond the headset.", status: "Actions and device data return to instructor control." },
];
function SystemSection() {
  const compact = useCompactLayout();
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setActive((value) => Math.min(value + 1, 3)), 1800);
    const finish = window.setTimeout(() => { setRunning(false); setComplete(true); }, 7200);
    return () => { window.clearInterval(interval); window.clearTimeout(finish); };
  }, [running]);
  const select = (index: number) => { setRunning(false); setComplete(false); setActive(index); };
  const run = () => { if (running) { setRunning(false); return; } setComplete(false); if (reduced) { setActive(3); setComplete(true); return; } setActive(0); setRunning(true); };
  return <section className="system-section section-pad" id="expertise" aria-labelledby="system-title">
    <div className="system-heading"><Label light>02 — The complete system</Label><p>Software. People. Hardware.<br />Engineered as one.</p></div>
    <div className="system-layout"><div className="system-copy"><h2 id="system-title">One world.<br /><span>Everything connected.</span></h2><p className="system-summary">Great VR is more than what you see. We build the entire system around the experience.</p>
      <div className="system-tabs" role="tablist" aria-label="Explore the connected training system" aria-orientation={compact ? "horizontal" : "vertical"}>{stages.map((stage, index) => <button key={stage.title} id={`system-tab-${index}`} type="button" role="tab" aria-selected={active === index} aria-controls="system-panel" tabIndex={active === index ? 0 : -1} onClick={() => select(index)} onKeyDown={(event) => { let next = index; if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % stages.length; else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index + stages.length - 1) % stages.length; else if (event.key === "Home") next = 0; else if (event.key === "End") next = stages.length - 1; else return; event.preventDefault(); select(next); document.getElementById(`system-tab-${next}`)?.focus(); }}><span className="step-index">0{index + 1}</span><span className="step-copy"><strong>{stage.title}</strong><span>{stage.body}</span></span><ArrowUpRight className="step-arrow" aria-hidden="true" /></button>)}</div>
      <p className="mobile-system-description">{stages[active].body}</p>
    </div><div className="system-visual-wrap"><div className="system-visual" id="system-panel" role="tabpanel" aria-labelledby={`system-tab-${active}`} data-stage={active} data-running={running}>
      <div className="system-visual-top"><span>Connected training system</span><span className="demo-tag">Interactive overview</span></div>
      <div className="system-diagram"><div className={`diagram-instructor diagram-node${active === 0 || active === 3 ? " is-active" : ""}`}><Monitor weight="light" aria-hidden="true" /><div><span>PC / TABLET</span><strong>Instructor control</strong></div><span className="node-status" /></div><div className={`connector connector-top${active === 0 || active === 3 ? " is-active" : ""}`}><span /></div>
        <div className={`shared-world${active >= 1 ? " is-active" : ""}`}><div className="shared-world-title"><span>Shared Unreal Engine world</span><span>LAN / 06</span></div><div className="trainees">{Array.from({ length: 6 }, (_, i) => <div className="trainee" key={i}><VirtualReality weight="light" aria-hidden="true" /><span>0{i + 1}</span></div>)}</div></div>
        <div className={`connector connector-branch${active >= 2 ? " is-active" : ""}`}><span /><i /></div><div className="hardware-row"><div className={`diagram-node hardware-node${active >= 2 ? " is-active" : ""}`}><GameController weight="light" aria-hidden="true" /><strong>Tracked equipment</strong><span>WONDERFITTER</span></div><div className={`diagram-node hardware-node${active >= 2 ? " is-active" : ""}`}><Heartbeat weight="light" aria-hidden="true" /><strong>Vitals + haptics</strong><span>GALAXY WATCH / BHAPTICS</span></div></div>
        <div className={`connector connector-return${active === 3 ? " is-active" : ""}`}><span /><i /></div><div className={`diagram-review${active === 3 ? " is-active" : ""}`}><ChartLineUp weight="light" aria-hidden="true" /><span>Actions & device data</span><ArrowUpRight aria-hidden="true" /><span>Back to the instructor</span></div>
      </div><div className="system-status" aria-live="polite"><span className="status-light" /><p>{stages[active].status}</p></div><div className="system-visual-bottom"><span>Real capabilities. Simplified view.</span><button type="button" onClick={run}>{running ? <Pause weight="fill" /> : complete ? <Check /> : <Play weight="fill" />}{running ? "Pause sequence" : complete ? "Replay sequence" : "Run the sequence"}</button></div>
    </div></div></div><div className="capability-line"><span>Our toolkit, your possibilities.</span><p>Unreal Engine <i>/</i> Multiplayer <i>/</i> VR & XR <i>/</i> Hardware integration <i>/</i> Custom interfaces</p></div>
  </section>;
}

type Film = { name: string; body: string; src: string; poster: string; category: string; link?: string };
const films: Film[] = [
  { name: "Hover the Edge", body: "A body-steered VR hoverboard game. Race a collapsing island, recover the artifact, and find your way out.", src: hoverVideo, poster: hoverPoster, category: "Unreal Engine / VR game", link: "https://www.youtube.com/watch?v=yD0MdJfYck0" },
  { name: "FlyboxVR", body: "A real wind tunnel. A virtual world. Your posture and balance become the controls of an entirely different kind of flight.", src: flyboxVideo, poster: flyboxPoster, category: "Location-based VR / Physical integration" },
];
function AutoVideo({ film, onExpand, suspended }: { film: Film; onExpand: () => void; suspended: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useRef(false);
  const manuallyPaused = useRef(false);
  const userStarted = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const video = videoRef.current; if (!video) return;
    const load = () => { if (!video.getAttribute("src")) { video.src = film.src; video.preload = "auto"; video.load(); } };
    const sync = () => { if (visible.current && !document.hidden && !suspended && !manuallyPaused.current && (!reduced || userStarted.current)) { load(); void video.play().catch(() => { /* Keep the explicit play control available if autoplay is blocked. */ }); } else video.pause(); };
    const preloadObserver = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { load(); preloadObserver.disconnect(); } }, { rootMargin: "600px" });
    const playbackObserver = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting; sync(); }, { threshold: 0.01 });
    preloadObserver.observe(video); playbackObserver.observe(video); video.addEventListener("loadeddata", sync); document.addEventListener("visibilitychange", sync);
    return () => { preloadObserver.disconnect(); playbackObserver.disconnect(); video.removeEventListener("loadeddata", sync); document.removeEventListener("visibilitychange", sync); video.pause(); };
  }, [film.src, reduced, suspended]);
  const toggle = () => { const video = videoRef.current; if (!video) return; if (video.paused) { manuallyPaused.current = false; userStarted.current = true; if (!video.getAttribute("src")) video.src = film.src; void video.play().catch(() => setFailed(true)); } else { manuallyPaused.current = true; video.pause(); } };
  return <div className="film-media"><video ref={videoRef} muted loop playsInline preload="none" poster={film.poster} aria-label={`${film.name} project footage`} onPlay={() => { setPlaying(true); setFailed(false); }} onPause={() => setPlaying(false)} onError={() => setFailed(true)} /><div className="film-overlay"><span><span className="footage-dot" />Actual project footage</span><div><button type="button" className="film-control" onClick={toggle} aria-label={`${playing ? "Pause" : "Play"} ${film.name} preview`}>{playing ? <Pause weight="fill" /> : <Play weight="fill" />}</button><button type="button" className="film-control" onClick={onExpand} aria-label={`Expand ${film.name} film`}><CornersOut /></button></div></div>{failed && <div className="video-error">Preview unavailable. <button type="button" onClick={onExpand}>Open the film <ArrowUpRight /></button></div>}</div>;
}
function Experiences({ onFilm, filmOpen }: { onFilm: (film: Film) => void; filmOpen: boolean }) {
  return <section className="experiences-section section-pad" aria-labelledby="experiences-title"><div className="section-intro"><Reveal><Label>More than a screen</Label><h2 id="experiences-title">Some things have<br />to be <em>felt.</em></h2></Reveal><Reveal className="intro-note"><p>From the edge of an island<br />to the middle of a wind tunnel.<br />Play, with the whole body.</p></Reveal></div><div className="film-grid">{films.map((film, index) => <Reveal className={`film-project film-project-${index}`} key={film.name} delay={index * 0.08}><AutoVideo film={film} suspended={filmOpen} onExpand={() => onFilm(film)} /><div className="film-project-meta"><span>{film.category}</span><span>0{index + 4}</span></div><div className="film-title-row"><h3>{film.name}</h3><button className="project-arrow" type="button" onClick={() => onFilm(film)} aria-label={`Watch ${film.name}`}><ArrowUpRight /></button></div><p>{film.body}</p></Reveal>)}</div></section>;
}

const products = [
  { name: "Lighthouse", category: "Home & community", line: "A shared home. A little more harmony.", body: "The conversations, people and everyday moments that make a place feel like home.", image: lighthouse },
  { name: "MoneyNest", category: "Personal finance", line: "A clearer picture of your money.", body: "A considered space for everyday finances, with useful insights close at hand.", image: moneyNest },
  { name: "BiteSync", category: "Health & nutrition", line: "Connect the dots in your daily health.", body: "Nutrition, activity and health conversations brought into one focused experience.", image: biteSync },
];
function Products() {
  const compact = useCompactLayout();
  const [active, setActive] = useState(0); const product = products[active]; const reduced = useReducedMotion();
  return <section className="products-section section-pad" id="mobile-products" aria-labelledby="products-title"><div className="products-copy"><Label>06 — Digital products</Label><h2 id="products-title">Beyond the<br />headset.</h2><p>The same care for interaction.<br />A different kind of world.</p><div className="product-tabs" role="tablist" aria-label="Explore mobile products" aria-orientation={compact ? "horizontal" : "vertical"}>{products.map((item, index) => <button key={item.name} type="button" role="tab" id={`product-tab-${index}`} aria-selected={active === index} aria-controls="product-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => { let next = index; if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % products.length; else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index + products.length - 1) % products.length; else if (event.key === "Home") next = 0; else if (event.key === "End") next = products.length - 1; else return; event.preventDefault(); setActive(next); document.getElementById(`product-tab-${next}`)?.focus(); }}><span><strong>{item.name}</strong><span>{item.category}</span></span><ArrowUpRight aria-hidden="true" /></button>)}</div></div>
    <div className="product-stage" id="product-panel" role="tabpanel" aria-labelledby={`product-tab-${active}`}><div className="product-stage-top"><span>Made for the everyday.</span><span>0{active + 1} / 03</span></div><div className="product-scene"><span className="product-watermark" aria-hidden="true">{product.name}</span><motion.div className="phone-shell" key={product.name} initial={reduced ? false : { opacity: 0, x: 20, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: -3 }} transition={{ duration: 0.45, ease }}><img src={product.image} alt={`${product.name} app — ${product.category.toLowerCase()} interface`} loading="lazy" decoding="async" /></motion.div></div><div className="product-stage-bottom"><div><h3>{product.line}</h3><p>{product.body}</p></div><div className="product-cycle"><button type="button" aria-label="Previous mobile product" onClick={() => setActive((active + products.length - 1) % products.length)}><ArrowLeft /></button><button type="button" aria-label="Next mobile product" onClick={() => setActive((active + 1) % products.length)}><ArrowRight /></button></div></div></div>
  </section>;
}

const services = [
  { title: "Unreal Engine & immersive worlds", body: "Production development for VR training, multiplayer simulations, interactive environments and games. From real-time logic and interaction to the experience inside the headset." },
  { title: "Connected hardware & control", body: "Instructor dashboards, tablet interfaces, tracked equipment, wearable integrations, haptics and real-time data. The physical and digital parts built to work together." },
  { title: "Interfaces & digital products", body: "Operator tools and mobile applications with purposeful interaction design. Clear, useful interfaces for the people running your system or using your product." },
];
function Studio() {
  return <section className="studio-section section-pad" aria-labelledby="studio-title"><Reveal className="studio-copy"><Label>The studio</Label><h2 id="studio-title">Creative ambition.<br />Technical ownership.</h2><p>Playframe is an independent development studio working at the intersection of real-time worlds and real-world systems.</p><p>A direct technical partner, from the first conversation through development, integration and deployment.</p></Reveal><div className="services">{services.map((service, index) => <details key={service.title} open={index === 0 ? true : undefined}><summary><span>0{index + 1}</span><h3>{service.title}</h3><Plus className="service-plus" /><Minus className="service-minus" /></summary><p>{service.body}</p></details>)}<a className="text-link" href="#contact">Tell us what you have in mind <ArrowUpRight aria-hidden="true" /></a></div></section>;
}
function Contact() {
  const [interest, setInterest] = useState("Unreal / VR");
  const topic = interest === "Unreal / VR" ? "Unreal Engine / VR" : interest === "A connected system" ? "connected hardware and software" : "a digital product";
  const body = `Hi Playframe,\n\nI'd like to discuss a project involving ${topic}.\n\nHere's what I have in mind:\n`;
  const email = `mailto:${EMAIL}?subject=${encodeURIComponent(`Let's build — ${interest}`)}&body=${encodeURIComponent(body)}`;
  return <footer className="contact-section" id="contact"><div className="contact-top section-pad"><Reveal><Label light>Every great experience starts somewhere.</Label><h2>What are we<br />building <em>next?</em></h2></Reveal><div className="contact-detail"><p>An ambitious idea. A complex brief.<br />Or just a “could we…?”<br /><span>We’d like to hear it.</span></p><fieldset className="interest-picker"><legend>I’m thinking about</legend>{["Unreal / VR", "A connected system", "A digital product"].map((item) => <label key={item}><input type="radio" name="project-interest" checked={interest === item} onChange={() => setInterest(item)} /><span>{item}{interest === item && <Check aria-hidden="true" />}</span></label>)}</fieldset><a className="contact-primary" href={email}>Start a conversation <span><ArrowUpRight weight="bold" aria-hidden="true" /></span></a><div className="contact-secondary"><a href={`mailto:${EMAIL}`}><EnvelopeSimple aria-hidden="true" />Email us</a><a href={WHATSAPP} target="_blank" rel="noreferrer"><WhatsappLogo aria-hidden="true" />WhatsApp <ArrowUpRight aria-hidden="true" /></a></div></div></div><div className="footer-brand" aria-hidden="true">PLAYFRAME<Mark /></div><div className="footer-baseline"><span>© {new Date().getFullYear()} Playframe</span><span>Unreal Engine. Real possibilities.</span><a href="#top">Back to top <ArrowUpRight aria-hidden="true" /></a></div></footer>;
}

function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null); useEffect(() => { if (project && !ref.current?.open) ref.current?.showModal(); }, [project]);
  return <dialog ref={ref} className="project-dialog" onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) ref.current?.close(); }} aria-labelledby="project-dialog-title">{project && <article className="project-dialog-content"><button className="dialog-close" type="button" onClick={() => ref.current?.close()} aria-label="Close project details" autoFocus><X /></button><div className="dialog-project-image"><Picture src={project.image} small={project.small} alt={project.alt} eager /><span>Original visualization</span></div><div className="dialog-project-copy"><Label>{project.number} — {project.category}</Label><h2 id="project-dialog-title">{project.title}</h2><p>{project.description}</p><h3>Inside the project</h3><ul>{project.capabilities.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul><small>{project.context}</small><a className="dialog-cta" href={`mailto:${EMAIL}?subject=${encodeURIComponent(`A project like ${project.category}`)}`}>Discuss a similar project <ArrowUpRight aria-hidden="true" /></a></div></article>}</dialog>;
}
function FilmDialog({ film, onClose }: { film: Film | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null); useEffect(() => { if (film && !ref.current?.open) ref.current?.showModal(); }, [film]);
  return <dialog ref={ref} className="film-dialog" onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) ref.current?.close(); }} aria-labelledby="film-dialog-title">{film && <div className="film-dialog-content"><div className="film-dialog-header"><h2 id="film-dialog-title">{film.name}</h2><button className="icon-button" type="button" onClick={() => ref.current?.close()} aria-label="Close film" autoFocus><X /></button></div><video key={film.src} src={film.src} controls autoPlay playsInline poster={film.poster} aria-label={`${film.name} film`} /><div className="film-dialog-caption"><span>Actual project footage</span>{film.link && <a href={film.link} target="_blank" rel="noreferrer">Watch on YouTube <ArrowUpRight /></a>}</div></div>}</dialog>;
}
export default function StudioApp() {
  const [project, setProject] = useState<Project | null>(null); const [film, setFilm] = useState<Film | null>(null);
  return <><Header /><main id="main"><Hero /><Work onSelect={setProject} /><SystemSection /><Experiences onFilm={setFilm} filmOpen={Boolean(film)} /><Products /><Studio /></main><Contact /><ProjectDialog project={project} onClose={() => setProject(null)} /><FilmDialog film={film} onClose={() => setFilm(null)} /></>;
}
