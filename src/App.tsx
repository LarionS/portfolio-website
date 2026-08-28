import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  ChatCircleDots,
  EnvelopeSimple,
  List,
  Pause,
  Play,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import mark from "../assets/brand/playframe-mark-ultramarine.webp";
import hero from "../assets/brand/photography/hero-training-room.webp";
import hero960 from "../assets/brand/photography/hero-training-room-960.webp";
import clinical from "../assets/brand/photography/clinical-training.webp";
import clinical960 from "../assets/brand/photography/clinical-training-960.webp";
import connected from "../assets/brand/photography/connected-training.webp";
import connected960 from "../assets/brand/photography/connected-training-960.webp";
import emergency from "../assets/brand/photography/emergency-training.webp";
import emergency960 from "../assets/brand/photography/emergency-training-960.webp";
import hoverPoster from "../assets/journey/hover-the-edge/hover-story-v2-poster.jpg";
import hoverVideo from "../assets/journey/hover-the-edge/hover-story-v2-web.mp4";
import flyboxPoster from "../assets/journey/flybox/flybox-story-v2-poster.jpg";
import flyboxVideo from "../assets/journey/flybox/flybox-story-v2-web.mp4";
import lighthouse from "../assets/journey/apps/lighthouse-feed-stories.webp";
import moneyNest from "../assets/journey/apps/moneynest-home.webp";
import biteSync from "../assets/journey/apps/bitesync-health-chat.webp";

const contact = {
  email: "mailto:Larion1@gmail.com?subject=New%20Playframe%20project",
  whatsapp: "https://wa.me/66922470654",
};

const ease = [0.22, 1, 0.36, 1] as const;

type PictureProps = {
  src: string;
  srcSmall: string;
  alt: string;
  className?: string;
  eager?: boolean;
};

function ResponsivePicture({ src, srcSmall, alt, className, eager = false }: PictureProps) {
  return (
    <picture className={className}>
      <source media="(max-width: 720px)" srcSet={srcSmall} />
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}

function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-lockup" data-compact={compact || undefined}>
      <img src={mark} alt="" aria-hidden="true" />
      <span>PLAYFRAME</span>
    </span>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <header className="site-header" data-scrolled={scrolled || undefined}>
        <a href="#top" aria-label="Playframe home" onClick={close}>
          <BrandLockup compact />
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#system">The system</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#studio">Studio</a>
        </nav>

        <a className="header-contact" href="#contact">
          Discuss a project <ArrowDownRight weight="bold" aria-hidden="true" />
        </a>

        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X weight="bold" /> : <List weight="bold" />}
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.28, ease }}
          >
            <a href="#work" onClick={close}>Work</a>
            <a href="#system" onClick={close}>The system</a>
            <a href="#capabilities" onClick={close}>Capabilities</a>
            <a href="#studio" onClick={close}>Studio</a>
            <a href="#contact" onClick={close}>Discuss a project</a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

function Eyebrow({ children, index }: { children: React.ReactNode; index?: string }) {
  return (
    <div className="eyebrow">
      {index && <span>{index}</span>}
      <p>{children}</p>
    </div>
  );
}

function Reveal({ children, className = "", delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div className={className} data-sequence={delay || undefined}>
      {children}
    </div>
  );
}

function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <motion.div
        className="hero-media"
        initial={reduced ? false : { opacity: 0, scale: 1.035 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.25, ease }}
      >
        <ResponsivePicture
          src={hero}
          srcSmall={hero960}
          alt="Multi-user VR training suite with trainees, haptic hardware, an instructor console and a live emergency scenario"
          eager
        />
      </motion.div>

      <div className="hero-shade" aria-hidden="true" />

      <motion.div
        className="hero-copy"
        initial={reduced ? false : { opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.86, delay: 0.22, ease }}
      >
        <p className="hero-kicker">UNREAL ENGINE / VR / CONNECTED SYSTEMS</p>
        <h1 id="hero-title">Unreal Engine &amp; VR systems for high-stakes training.</h1>
        <p className="hero-summary">
          Multiplayer simulations, instructor control, live hardware and measurable outcomes.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#contact">
            Discuss a project <ArrowDownRight weight="bold" aria-hidden="true" />
          </a>
          <a className="text-link" href="#work">
            Explore the work <ArrowDown aria-hidden="true" />
          </a>
        </div>
        <p className="hero-sectors">Hospitals · Defense · Emergency services</p>
      </motion.div>

      <div className="hero-proof" aria-label="Core capabilities">
        <span>UNREAL ENGINE</span>
        <span>MULTI-USER VR</span>
        <span>HARDWARE INTEGRATION</span>
        <span>INSTRUCTOR CONTROL</span>
      </div>
    </section>
  );
}

function SystemSection() {
  const items = [
    ["01", "Instructor", "Control the scenario from desktop or tablet."],
    ["02", "Trainees", "Connect multi-user teams over a local network."],
    ["03", "Hardware", "Track controllers, wearables, haptics and sensors."],
    ["04", "Telemetry", "Return session data for review and improvement."],
  ];

  return (
    <section className="system-section" id="system" aria-labelledby="system-title">
      <div className="system-intro">
        <Reveal>
          <Eyebrow>THE PLAYFRAME DIFFERENCE</Eyebrow>
          <h2 id="system-title">The system is the work.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p>
            A believable virtual world is only one layer. We engineer the complete loop around it—people,
            control, physical devices and the data that comes back.
          </p>
        </Reveal>
      </div>

      <div className="system-steps">
        {items.map(([number, title, body], index) => (
          <Reveal className="system-step" delay={index * 0.06} key={title}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

type CaseStudyProps = {
  index: string;
  eyebrow: string;
  title: string;
  body: string;
  src: string;
  srcSmall: string;
  alt: string;
  proof: string[];
  note: string;
};

function CaseStudy({ index, eyebrow, title, body, src, srcSmall, alt, proof, note }: CaseStudyProps) {
  return (
    <article className="case-study">
      <div className="case-media">
        <ResponsivePicture src={src} srcSmall={srcSmall} alt={alt} />
        <span className="case-index">{index}</span>
      </div>

      <div className="case-copy">
        <Reveal>
          <Eyebrow index={index}>{eyebrow}</Eyebrow>
          <h3>{title}</h3>
        </Reveal>
        <Reveal delay={0.08} className="case-detail">
          <p>{body}</p>
          <ul aria-label="System capabilities">
            {proof.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <small>{note}</small>
        </Reveal>
      </div>
    </article>
  );
}

function WorkSection() {
  return (
    <section className="work-section" id="work" aria-labelledby="work-title">
      <div className="section-heading">
        <Reveal>
          <Eyebrow>SELECTED SYSTEMS</Eyebrow>
          <h2 id="work-title">Built for decisions that matter.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p>
            Confidential work is reconstructed as original imagery. The capabilities are real; no client
            interfaces, personnel or operational material are shown.
          </p>
        </Reveal>
      </div>

      <CaseStudy
        index="01"
        eyebrow="CLINICAL TRAINING"
        title="A patient changes. The room responds."
        body="Configurable clinical scenarios connect patient state, trainee action, instructor intervention and replayable debrief."
        src={clinical}
        srcSmall={clinical960}
        alt="A nurse in VR responding to a medical training mannequin while an instructor controls the scenario"
        proof={["Scenario control", "Live patient state", "Debrief replay"]}
        note="Confidential deployment · Original reconstruction"
      />

      <CaseStudy
        index="02"
        eyebrow="CONNECTED DEFENSE TRAINING"
        title="One command. Six trainees respond."
        body="A LAN session joins six people, tracked training equipment, haptic feedback, a wearable and an instructor dashboard into one operating system."
        src={connected}
        srcSmall={connected960}
        alt="Six VR trainees in a tracked facility connected to an instructor control console"
        proof={["6-person LAN", "Wearables + haptics", "Instructor dashboard"]}
        note="Confidential deployment · Original reconstruction"
      />

      <CaseStudy
        index="03"
        eyebrow="COORDINATED RESPONSE"
        title="Three roles. One changing incident."
        body="Police, fire and medical teams rehearse their dependencies inside the same scenario, then review the response as one coordinated system."
        src={emergency}
        srcSmall={emergency960}
        alt="Police, firefighting and medical trainees coordinating in one emergency VR scenario"
        proof={["Shared scenario", "Role dependencies", "After-action review"]}
        note="Original category visualization · No client footage"
      />
    </section>
  );
}

type AutoVideoProps = {
  src: string;
  poster: string;
  label: string;
};

function AutoVideo({ src, poster, label }: AutoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sourceReady, setSourceReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSourceReady(true);
          preloadObserver.disconnect();
        }
      },
      { rootMargin: "85% 0px" },
    );
    preloadObserver.observe(video);
    return () => preloadObserver.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sourceReady || reduced) return;
    const playObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.12 },
    );
    playObserver.observe(video);
    return () => playObserver.disconnect();
  }, [reduced, sourceReady]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setSourceReady(true);
      void video.play().then(() => setPlaying(true));
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  return (
    <div className="film-frame">
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload={sourceReady ? "auto" : "none"}
        poster={poster}
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {sourceReady && <source src={src} type="video/mp4" />}
      </video>
      <button className="film-control" type="button" onClick={toggle} aria-label={playing ? `Pause ${label}` : `Play ${label}`}>
        {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
      </button>
    </div>
  );
}

function FilmProject({
  number,
  eyebrow,
  title,
  body,
  src,
  poster,
  link,
  tags,
}: {
  number: string;
  eyebrow: string;
  title: string;
  body: string;
  src: string;
  poster: string;
  link?: string;
  tags: string[];
}) {
  return (
    <article className="film-project">
      <AutoVideo src={src} poster={poster} label={`${title} project film`} />
      <div className="film-copy">
        <Reveal>
          <Eyebrow index={number}>{eyebrow}</Eyebrow>
          <h3>{title}</h3>
          <p>{body}</p>
        </Reveal>
        <Reveal delay={0.08} className="film-meta">
          <ul>{tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
          {link && (
            <a href={link} target="_blank" rel="noreferrer">
              Watch the full film <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          )}
        </Reveal>
      </div>
    </article>
  );
}

function PhysicalProjects() {
  return (
    <section className="physical-section" aria-labelledby="physical-title">
      <div className="section-heading section-heading-dark">
        <Reveal>
          <Eyebrow>EMBODIED EXPERIENCES</Eyebrow>
          <h2 id="physical-title">When the body becomes the controller.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p>Two shipped projects built around balance, motion, physical feedback and real-time worlds.</p>
        </Reveal>
      </div>

      <FilmProject
        number="04"
        eyebrow="HOVER THE EDGE"
        title="Lean. Launch. Extract."
        body="A released Unreal Engine VR game where players steer a hoverboard with their body, race across a collapsing island and extract the artifact."
        src={hoverVideo}
        poster={hoverPoster}
        link="https://www.youtube.com/watch?v=yD0MdJfYck0"
        tags={["Released on Steam", "Body-steered VR", "Unreal Engine"]}
      />

      <FilmProject
        number="05"
        eyebrow="FLYBOXVR"
        title="Your body becomes the aircraft."
        body="A physical wind system lifts the participant while FlyboxVR maps balance and posture into real-time flight. The film is the project: body, air and virtual world acting as one."
        src={flyboxVideo}
        poster={flyboxPoster}
        tags={["Location-based VR", "Body-as-controller", "Real-time flight"]}
      />
    </section>
  );
}

const products = [
  { name: "Lighthouse", line: "Shared-home coordination, made calmer.", image: lighthouse },
  { name: "MoneyNest", line: "Personal finance without the noise.", image: moneyNest },
  { name: "BiteSync", line: "Nutrition and health patterns, made visible.", image: biteSync },
];

function ProductSection() {
  return (
    <section className="product-section" aria-labelledby="product-title">
      <div className="section-heading">
        <Reveal>
          <Eyebrow index="06">MOBILE PRODUCT ENGINEERING</Eyebrow>
          <h2 id="product-title">The same systems thinking, pocket-sized.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p>Focused mobile products for home coordination, personal finance and health data.</p>
        </Reveal>
      </div>

      <div className="product-gallery">
        {products.map((product, index) => (
          <article
            className="product-item"
            key={product.name}
            data-sequence={index + 1}
          >
            <div className="phone-shell">
              <img src={product.image} alt={`${product.name} mobile application interface`} loading="lazy" decoding="async" />
            </div>
            <h3>{product.name}</h3>
            <p>{product.line}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Capabilities() {
  const capabilities = [
    "Unreal Engine development",
    "VR / XR interaction",
    "Multi-user simulation",
    "Instructor control systems",
    "Wearables + haptics",
    "Tracked physical hardware",
    "Real-time telemetry",
    "Mobile product engineering",
  ];

  return (
    <section className="capabilities-section" id="capabilities" aria-labelledby="capabilities-title">
      <Reveal>
        <Eyebrow>CAPABILITIES</Eyebrow>
        <h2 id="capabilities-title">From engine to equipment.</h2>
      </Reveal>
      <div className="capability-list">
        {capabilities.map((capability, index) => (
          <Reveal className="capability-item" delay={(index % 4) * 0.04} key={capability}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{capability}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function StudioNote() {
  return (
    <section className="studio-section" id="studio" aria-labelledby="studio-title">
      <Reveal className="studio-mark-wrap">
        <img src={mark} alt="Playframe portal mark" />
      </Reveal>
      <Reveal className="studio-copy" delay={0.08}>
        <Eyebrow>PLAYFRAME STUDIO</Eyebrow>
        <h2 id="studio-title">Small studio. Complete systems.</h2>
        <p>
          Playframe works across real-time engineering, interaction design, physical integration and product
          direction. One point of ownership from the first system diagram to the working deployment.
        </p>
      </Reveal>
    </section>
  );
}

function Contact() {
  return (
    <footer className="contact-section" id="contact">
      <img
        className="contact-mark"
        src={mark}
        alt=""
        aria-hidden="true"
      />
      <Reveal className="contact-copy">
        <Eyebrow>PROJECT ENQUIRIES</Eyebrow>
        <h2>Build something that has to work.</h2>
        <p>
          Tell us what people need to practise, who needs to connect and what physical systems are involved.
        </p>
        <div className="contact-actions">
          <a className="button button-primary button-large" href={contact.email}>
            <EnvelopeSimple weight="bold" aria-hidden="true" /> Email Playframe
          </a>
          <a className="button button-quiet button-large" href={contact.whatsapp} target="_blank" rel="noreferrer">
            <ChatCircleDots weight="bold" aria-hidden="true" /> WhatsApp
          </a>
        </div>
      </Reveal>
      <div className="footer-line">
        <BrandLockup compact />
        <p>Unreal Engine / VR / Connected systems</p>
        <p>© {new Date().getFullYear()} Playframe</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <Hero />
        <SystemSection />
        <WorkSection />
        <PhysicalProjects />
        <ProductSection />
        <Capabilities />
        <StudioNote />
      </main>
      <Contact />
    </div>
  );
}
