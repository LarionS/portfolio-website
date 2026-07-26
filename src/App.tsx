import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ErrorInfo, ReactNode } from "react";
import { chapters, contact, mobileProducts } from "./content";
import type { Chapter } from "./content";

const Experience = lazy(() => import("./Experience"));

type BoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

class CanvasBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("3D experience unavailable", error, info);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function useJourneyProgress() {
  const progress = useRef(0);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    let frame = 0;
    let metrics: number[] = [];
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-stage]"));

    const measure = () => {
      metrics = sections.map(
        (section) => section.offsetTop + section.offsetHeight * 0.5,
      );
    };

    const update = () => {
      frame = 0;
      if (!metrics.length) measure();
      const viewportCenter = window.scrollY + window.innerHeight * 0.5;
      let nextProgress = 0;

      if (viewportCenter <= metrics[0]) {
        nextProgress = 0;
      } else if (viewportCenter >= metrics[metrics.length - 1]) {
        nextProgress = metrics.length - 1;
      } else {
        for (let index = 0; index < metrics.length - 1; index += 1) {
          if (viewportCenter >= metrics[index] && viewportCenter < metrics[index + 1]) {
            const span = metrics[index + 1] - metrics[index];
            nextProgress = index + (viewportCenter - metrics[index]) / span;
            break;
          }
        }
      }

      progress.current = nextProgress;
      const nextActive = Math.max(
        0,
        Math.min(metrics.length - 1, Math.round(nextProgress)),
      );
      setActiveStage((current) => (current === nextActive ? current : nextActive));
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
      requestUpdate();
    });
    sections.forEach((section) => resizeObserver.observe(section));

    measure();
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return { progress, activeStage };
}

function ProjectFilm({
  chapter,
  reducedMotion,
  motionPaused,
}: {
  chapter: Chapter;
  reducedMotion: boolean;
  motionPaused: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion || motionPaused) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && document.visibilityState === "visible") {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.42 },
    );

    const handleVisibility = () => {
      if (document.hidden) video.pause();
    };

    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [motionPaused, reducedMotion]);

  return (
    <figure className={`project-film project-film--${chapter.alignment}`}>
      <div className="project-film__frame">
        <video
          ref={videoRef}
          src={chapter.video}
          poster={chapter.poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${chapter.eyebrow} project footage`}
        />
        <span className="project-film__live" aria-hidden="true">
          <i /> Live artifact
        </span>
        <span className="project-film__corner project-film__corner--a" />
        <span className="project-film__corner project-film__corner--b" />
      </div>
      <figcaption>
        <span>{chapter.number}</span>
        {chapter.note}
      </figcaption>
    </figure>
  );
}

function MobileProductList() {
  return (
    <div className="mobile-product-list" aria-label="Selected mobile products">
      {mobileProducts.map((product) => (
        <article className="mobile-product" key={product.name}>
          <img src={product.icon} alt="" width="48" height="48" loading="lazy" />
          <div>
            <h3>{product.name}</h3>
            <p>{product.line}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function MobileFallback() {
  return (
    <div className="mobile-fallback" aria-hidden="true">
      {mobileProducts.map((product, index) => (
        <div className={`fallback-phone fallback-phone--${index + 1}`} key={product.name}>
          <img src={product.screen} alt="" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

function ChapterSection({
  chapter,
  index,
  reducedMotion,
  motionPaused,
}: {
  chapter: Chapter;
  index: number;
  reducedMotion: boolean;
  motionPaused: boolean;
}) {
  const nextId = chapters[index + 1]?.id ?? "contact";
  const fallback = chapter.image ?? chapter.poster;
  const style = {
    "--chapter-accent": chapter.accent,
    "--chapter-rgb": chapter.accentRgb,
    "--fallback-image": fallback ? `url(${fallback})` : "none",
  } as CSSProperties;

  return (
    <section
      className={`chapter chapter--${chapter.alignment}${chapter.video ? " chapter--film" : ""}`}
      id={chapter.id}
      data-stage={index + 1}
      style={style}
      aria-labelledby={`${chapter.id}-title`}
    >
      <div className="chapter__fallback" aria-hidden="true" />
      <div className="chapter__wash" aria-hidden="true" />
      <article className="chapter__copy">
        <p className="chapter__kicker">
          <span>{chapter.number}</span>
          {chapter.eyebrow}
        </p>
        <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
        <p className="chapter__body">{chapter.body}</p>
        <ul className="proof-list" aria-label={`${chapter.eyebrow} capabilities`}>
          {chapter.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>

        {chapter.world === "mobile" ? <MobileProductList /> : null}

        {chapter.note ? (
          chapter.noteDetail ? (
            <details className="media-note">
              <summary>{chapter.note}</summary>
              <p>{chapter.noteDetail}</p>
            </details>
          ) : (
            <p className="media-note media-note--plain">{chapter.note}</p>
          )
        ) : null}

        <div className="chapter__actions">
          <a className="journey-next" href={`#${nextId}`}>
            <span>Next</span>
            {chapter.nextLabel}
            <i aria-hidden="true">↓</i>
          </a>
          {chapter.projectLink ? (
            <a
              className="artifact-link"
              href={chapter.projectLink.href}
              target="_blank"
              rel="noreferrer"
            >
              {chapter.projectLink.label} <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </article>

      {chapter.video ? (
        <ProjectFilm
          chapter={chapter}
          reducedMotion={reducedMotion}
          motionPaused={motionPaused}
        />
      ) : null}
      {chapter.world === "mobile" ? <MobileFallback /> : null}
    </section>
  );
}

function JourneyRail({ activeStage }: { activeStage: number }) {
  return (
    <nav
      className={`journey-rail${activeStage === 7 ? " journey-rail--complete" : ""}`}
      aria-label="Project journey"
    >
      <span className="journey-rail__line" aria-hidden="true">
        <i style={{ transform: `scaleY(${Math.max(0, Math.min(1, (activeStage - 0.5) / 6))})` }} />
      </span>
      {chapters.map((chapter, index) => {
        const stage = index + 1;
        return (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            className={activeStage === stage ? "is-active" : ""}
            aria-current={activeStage === stage ? "step" : undefined}
          >
            <span>{chapter.number}</span>
            <b>{chapter.nav}</b>
          </a>
        );
      })}
    </nav>
  );
}

function Header({ activeStage }: { activeStage: number }) {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Larion, home">
        <span className="wordmark__mark">L</span>
        <span className="wordmark__text">
          <b>Larion</b>
          <small>Immersive systems</small>
        </span>
      </a>

      <nav className="header-nav" aria-label="Primary navigation">
        <a href="#clinical" className={activeStage > 0 && activeStage < 7 ? "is-active" : ""}>
          Journey
        </a>
        <a href="#mobile-products">Products</a>
      </nav>

      <a className="header-cta" href="#contact">
        Start a project
        <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top" data-stage="0" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__content">
        <p className="hero__eyebrow">Larion · Unreal Engine · VR · Interactive systems</p>
        <h1 id="hero-title">
          <span>Unreal Engine + VR</span>
          <span>for the real world.</span>
        </h1>
        <p className="hero__lede">
          I design and build immersive training, connected simulations and interactive
          experiences—bringing headsets, wearables, haptics and live controls into one
          working system.
        </p>
        <div className="hero__actions">
          <a className="primary-button" href="#clinical">
            Begin the journey <span aria-hidden="true">↓</span>
          </a>
          <a className="quiet-link" href="#contact">
            Start a project <span aria-hidden="true">↗</span>
          </a>
        </div>
        <ul className="hero__proof" aria-label="Core capabilities">
          <li>Immersive training</li>
          <li>Multi-user systems</li>
          <li>Hardware integration</li>
          <li>Shipped VR</li>
        </ul>
      </div>

      <div className="hero__journey-label" aria-hidden="true">
        <span>Selected work</span>
        <strong>01—06</strong>
        <small>Scroll-led case journey</small>
      </div>
      <a className="scroll-cue" href="#clinical" aria-label="Enter the first chapter">
        <span>Scroll to enter</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="contact" id="contact" data-stage="7" aria-labelledby="contact-title">
      <div className="contact__content">
        <p className="contact__eyebrow">The next chapter</p>
        <h2 id="contact-title">Let’s build the next world.</h2>
        <p>
          Planning an Unreal Engine training system, a VR experience or a connected
          interactive product? Tell me the problem, the audience and what the experience
          needs to achieve. A few sentences is enough.
        </p>
        <div className="contact__links">
          <a className="contact-card contact-card--primary" href={contact.emailHref}>
            <span>Email Larion</span>
            <strong>{contact.email}</strong>
            <i aria-hidden="true">↗</i>
          </a>
          <a
            className="contact-card"
            href={contact.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            <span>Start a conversation</span>
            <strong>WhatsApp</strong>
            <i aria-hidden="true">↗</i>
          </a>
        </div>
        <p className="availability">
          <i aria-hidden="true" /> Bangkok · Available worldwide
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} Larion Siments</p>
      <p>
        Selected healthcare, defense and emergency-services work is confidential.
        Recreated visuals contain no client data, interfaces, personnel or operational
        material.
      </p>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function App() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const compact = useMediaQuery("(max-width: 860px)");
  const { progress, activeStage } = useJourneyProgress();
  const pointer = useRef({ x: 0, y: 0 });
  const [webglReady, setWebglReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [motionPaused, setMotionPaused] = useState(false);
  const [webglSupported] = useState(supportsWebGL);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    };
    const resetPointer = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    const handleVisibility = () => setPageVisible(!document.hidden);

    window.addEventListener("pointermove", handlePointer, { passive: true });
    document.documentElement.addEventListener("mouseleave", resetPointer);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pointermove", handlePointer);
      document.documentElement.removeEventListener("mouseleave", resetPointer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const activeChapter = activeStage > 0 && activeStage < 7 ? chapters[activeStage - 1] : null;
  const accent = activeChapter?.accent ?? (activeStage === 7 ? "#d7ff4f" : "#74ecff");
  const accentRgb = activeChapter?.accentRgb ?? (activeStage === 7 ? "215, 255, 79" : "116, 236, 255");
  const shouldRenderCanvas = webglSupported && !reducedMotion && !webglFailed;
  const pageClass = useMemo(
    () =>
      [
        "experience",
        webglReady ? "webgl-ready" : "",
        shouldRenderCanvas ? "" : "no-webgl",
      ]
        .filter(Boolean)
        .join(" "),
    [shouldRenderCanvas, webglReady],
  );
  const style = {
    "--accent": accent,
    "--accent-rgb": accentRgb,
  } as CSSProperties;

  return (
    <div className={pageClass} style={style} data-active-stage={activeStage}>
      <a className="skip-link" href="#main">
        Skip to work
      </a>
      <Header activeStage={activeStage} />

      {shouldRenderCanvas ? (
        <CanvasBoundary onError={() => setWebglFailed(true)}>
          <Suspense fallback={null}>
            <Experience
              progress={progress}
              pointer={pointer}
              mobile={compact}
              visible={pageVisible && !motionPaused}
              onReady={() => setWebglReady(true)}
            />
          </Suspense>
        </CanvasBoundary>
      ) : null}

      <JourneyRail activeStage={activeStage} />
      {!reducedMotion ? (
        <button
          className="motion-toggle"
          type="button"
          onClick={() => setMotionPaused((current) => !current)}
          aria-pressed={motionPaused}
        >
          <span aria-hidden="true">{motionPaused ? "▶" : "Ⅱ"}</span>
          {motionPaused ? "Play motion" : "Pause motion"}
        </button>
      ) : null}

      <main id="main">
        <Hero />
        {chapters.map((chapter, index) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            index={index}
            reducedMotion={reducedMotion}
            motionPaused={motionPaused}
          />
        ))}
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
