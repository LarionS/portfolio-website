import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ErrorInfo, MouseEvent as ReactMouseEvent, ReactNode } from "react";
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
  const initialStage = useRef((() => {
    if (typeof window === "undefined") return 0;
    const hash = window.location.hash.slice(1);
    const chapterIndex = chapters.findIndex((chapter) => chapter.id === hash);
    if (chapterIndex >= 0) return chapterIndex + 1;
    return hash === "contact" ? 7 : 0;
  })()).current;
  const progress = useRef(initialStage);
  const [activeStage, setActiveStage] = useState(initialStage);

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
      const nextActive = Math.max(0, Math.min(7, Math.round(nextProgress)));
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
    if (initialStage > 0) {
      const target = document.querySelector<HTMLElement>(window.location.hash);
      if (target) {
        const root = document.documentElement;
        const previousBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        target.scrollIntoView({ block: "start" });
        root.style.scrollBehavior = previousBehavior;
      }
    }
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [initialStage]);

  return { progress, activeStage };
}

type JumpHandler = (
  event: ReactMouseEvent<HTMLAnchorElement>,
  id: string,
  stage: number,
) => void;

function Header({ activeStage, onJump }: { activeStage: number; onJump: JumpHandler }) {
  const chapterNumber = activeStage > 0 && activeStage < 7 ? activeStage : 0;
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Larion Siments, home" onClick={(event) => onJump(event, "top", 0)}>
        <span className="wordmark__mark">LS</span>
        <span className="wordmark__text">
          <b>Larion Siments</b>
          <small>Unreal / VR systems</small>
        </span>
      </a>

      <div className="header-status" aria-live="polite">
        <span>{chapterNumber ? String(chapterNumber).padStart(2, "0") : "00"}</span>
        <i />
        <span>06</span>
      </div>

      <div className="header-actions">
        <a className="skip-experience" href="#contact" onClick={(event) => onJump(event, "contact", 7)}>
          Skip journey
        </a>
        <a className="header-cta" href={contact.emailHref}>
          Start a project <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}

function JourneyRail({ activeStage, onJump }: { activeStage: number; onJump: JumpHandler }) {
  return (
    <nav className="journey-rail" aria-label="Project journey" id="project-index">
      <span className="journey-rail__track" aria-hidden="true">
        <i style={{ transform: `scaleY(${Math.max(0, Math.min(1, activeStage / 6))})` }} />
      </span>
      {chapters.map((chapter, index) => {
        const stage = index + 1;
        return (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            onClick={(event) => onJump(event, chapter.id, stage)}
            className={activeStage === stage ? "is-active" : ""}
            aria-current={activeStage === stage ? "step" : undefined}
            aria-label={`${chapter.nav}, chapter ${chapter.number}`}
          >
            <b>{chapter.nav}</b>
            <span>{chapter.number}</span>
          </a>
        );
      })}
    </nav>
  );
}

function WorldFallback({ world }: { world: Chapter["world"] }) {
  return (
    <div className={`world-fallback world-fallback--${world}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <span />
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top" data-stage="0" aria-labelledby="hero-title">
      <WorldFallback world="clinical" />
      <article className="hero__content">
        <p className="hero__eyebrow">Larion Siments · Unreal Engine + VR systems</p>
        <h1 id="hero-title">
          Real-time worlds.
          <span>Real-world impact.</span>
        </h1>
        <p className="hero__lede">
          End-to-end Unreal Engine and VR systems—multiplayer simulation, instructor
          control, wearables, tracked hardware and production deployment.
        </p>
        <div className="hero__actions">
          <a className="primary-button" href="#clinical">
            Enter the journey <span aria-hidden="true">↓</span>
          </a>
          <a className="quiet-link" href={contact.emailHref}>
            Discuss a project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>
      <div className="hero__system-note" aria-hidden="true">
        <span>Scroll to move through the worlds</span>
        <i />
        <span>Move the cursor to wake the system</span>
      </div>
    </section>
  );
}

function ProductNames() {
  return (
    <div className="product-names" aria-label="Selected mobile products">
      {mobileProducts.map((product, index) => (
        <span key={product.name}>
          <i>{String(index + 1).padStart(2, "0")}</i>
          <b>{product.name}</b>
          <small>{product.line}</small>
        </span>
      ))}
    </div>
  );
}

function ChapterSection({
  chapter,
  index,
  interactive,
}: {
  chapter: Chapter;
  index: number;
  interactive: boolean;
}) {
  return (
    <section
      className={`chapter chapter--${chapter.world}`}
      id={chapter.id}
      data-stage={index + 1}
      aria-labelledby={`${chapter.id}-title`}
    >
      <WorldFallback world={chapter.world} />
      <article className="scene-caption">
        <p className="scene-caption__kicker">
          <span>{chapter.number}</span>
          {chapter.eyebrow}
        </p>
        <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
        <p className="scene-caption__body">{chapter.body}</p>
        <p className="scene-caption__proof">{chapter.tags.join("  /  ")}</p>

        {chapter.world === "mobile" ? <ProductNames /> : null}

        <div className="scene-caption__meta">
          <button
            className="scene-interaction"
            type="button"
            disabled={!interactive}
            onClick={() => window.dispatchEvent(new CustomEvent("larion:scene-action", { detail: chapter.world }))}
          >
            <i aria-hidden="true" /> {chapter.interaction}
          </button>
          {chapter.noteDetail ? (
            <details className="scene-detail">
              <summary>Project context +</summary>
              <p>{chapter.noteDetail}</p>
            </details>
          ) : null}
          {chapter.projectLink ? (
            <a
              className="project-link"
              href={chapter.projectLink.href}
              target="_blank"
              rel="noreferrer"
            >
              {chapter.projectLink.label} ↗
            </a>
          ) : null}
        </div>
      </article>

      <a
        className="chapter-next"
        href={`#${chapters[index + 1]?.id ?? "contact"}`}
        aria-label={`Continue to ${chapters[index + 1]?.nav ?? "contact"}`}
      >
        <span>{chapter.nextLabel}</span>
        <i aria-hidden="true">↓</i>
      </a>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="contact" id="contact" data-stage="7" aria-labelledby="contact-title">
      <article className="contact__content">
        <p className="contact__eyebrow">Your world is next</p>
        <h2 id="contact-title">Build the world people remember.</h2>
        <p>
          If it needs to train, connect, react or feel physically real, tell me what
          the experience has to achieve. I’ll reply personally.
        </p>
        <a className="contact__primary" href={contact.emailHref}>
          <span>Start a project</span>
          <strong>{contact.email}</strong>
          <i aria-hidden="true">↗</i>
        </a>
        <a className="contact__secondary" href={contact.whatsapp} target="_blank" rel="noreferrer">
          WhatsApp <span aria-hidden="true">↗</span>
        </a>
        <p className="availability"><i /> Bangkok · Available worldwide</p>
      </article>
    </section>
  );
}

function Footer({ onJump }: { onJump: JumpHandler }) {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} Larion Siments</p>
      <p>
        Healthcare, defense and emergency-service scenes are original reconstructions.
        No client interfaces, data, personnel or operational material are shown.
      </p>
      <a href="#top" onClick={(event) => onJump(event, "top", 0)}>Back to entry ↑</a>
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
  const [canvasRequested, setCanvasRequested] = useState(false);
  const [webglSupported] = useState(supportsWebGL);

  useEffect(() => {
    const reveal = () => setCanvasRequested(true);
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(reveal, { timeout: 700 });
      return () => window.cancelIdleCallback(idleId);
    }
    const timeoutId = setTimeout(reveal, 120);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    };
    const resetPointer = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
      document.body.style.cursor = "";
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

  const canvasCapable = webglSupported && !reducedMotion && !webglFailed;
  const shouldRenderCanvas = canvasRequested && canvasCapable;
  const sceneInteractive = shouldRenderCanvas && webglReady && !motionPaused;
  const handleJump = useCallback<JumpHandler>((event, id, stage) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    progress.current = stage;
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    target.scrollIntoView({ block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousBehavior;
    });
  }, [progress]);
  const pageClass = [
    "experience",
    webglReady ? "webgl-ready" : "",
    webglReady && canvasCapable ? "" : "no-webgl",
    motionPaused ? "motion-paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={pageClass} data-active-stage={activeStage}>
      <a className="skip-link" href="#main">Skip to selected work</a>
      <Header activeStage={activeStage} onJump={handleJump} />

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

      <JourneyRail activeStage={activeStage} onJump={handleJump} />
      {shouldRenderCanvas ? (
        <button
          className="motion-toggle"
          type="button"
          onClick={() => setMotionPaused((current) => !current)}
          aria-pressed={motionPaused}
        >
          <span aria-hidden="true">{motionPaused ? "▶" : "Ⅱ"}</span>
          {motionPaused ? "Resume world" : "Pause world"}
        </button>
      ) : null}

      <main id="main">
        <Hero />
        {chapters.map((chapter, index) => (
          <ChapterSection key={chapter.id} chapter={chapter} index={index} interactive={sceneInteractive} />
        ))}
        <ContactSection />
      </main>
      <Footer onJump={handleJump} />
    </div>
  );
}
