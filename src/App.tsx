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
import hospitalBackdrop from "../assets/journey/worlds/hospital-world.webp";
import tacticalBackdrop from "../assets/journey/worlds/tactical-world.webp";
import emergencyBackdrop from "../assets/journey/worlds/emergency-world.webp";

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
  const journeyComplete = activeStage === 7;
  const chapterNumber = Math.max(0, Math.min(6, activeStage));
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Larion Siments, home" onClick={(event) => onJump(event, "top", 0)}>
        <span className="wordmark__mark">LS</span>
        <span className="wordmark__text">
          <b>Larion Siments</b>
          <small>Unreal / VR systems</small>
        </span>
      </a>

      <div
        className="header-status"
        data-complete={journeyComplete || undefined}
        aria-label={journeyComplete
          ? "Journey complete, six of six"
          : chapterNumber === 0
            ? "Journey entry, six chapters"
            : `Chapter ${chapterNumber} of 6`}
        aria-live="polite"
      >
        <span>{String(chapterNumber).padStart(2, "0")}</span>
        <i />
        <span>{journeyComplete ? "DONE" : "06"}</span>
      </div>

      <div className="header-actions">
        <a
          className="skip-experience"
          href={journeyComplete ? "#top" : "#contact"}
          onClick={(event) => onJump(event, journeyComplete ? "top" : "contact", journeyComplete ? 0 : 7)}
        >
          {journeyComplete ? "Replay journey" : "Skip journey"}
        </a>
        <a className="header-cta" href={contact.emailHref}>
          Discuss a project <span aria-hidden="true">↗</span>
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
  const chapter = chapters.find((item) => item.world === world);
  const asset = world === "clinical"
    ? hospitalBackdrop
    : world === "tactical"
      ? tacticalBackdrop
      : world === "emergency"
        ? emergencyBackdrop
        : world === "hover" || world === "flybox"
          ? chapter?.poster
          : world === "mobile"
            ? mobileProducts[1].screen
            : hospitalBackdrop;

  return (
    <div className={`world-fallback world-fallback--${world}`} aria-hidden="true">
      <img src={asset} alt="" loading="lazy" decoding="async" />
    </div>
  );
}

function Hero({ onJump }: { onJump: JumpHandler }) {
  return (
    <section className="hero" id="top" data-stage="0" aria-labelledby="hero-title">
      <WorldFallback world="clinical" />
      <article className="hero__content">
        <p className="hero__eyebrow">Larion Siments · Production Unreal Engine + VR systems</p>
        <h1 id="hero-title">
          Immersive training.
          <span>Engineered for reality.</span>
        </h1>
        <p className="hero__lede">
          I design and ship Unreal Engine and VR systems for hospitals, defense teams
          and emergency services—multiplayer, instructor-controlled and connected to real hardware.
        </p>
        <ul className="hero__proof" aria-label="Core production capabilities">
          <li><strong>UE</strong><span>Production systems</span></li>
          <li><strong>06</strong><span>Participants over LAN</span></li>
          <li><strong>I/O</strong><span>Wearables + tracked hardware</span></li>
        </ul>
        <div className="hero__actions">
          <a className="primary-button" href="#clinical" onClick={(event) => onJump(event, "clinical", 1)}>
            Explore the systems <span aria-hidden="true">↓</span>
          </a>
          <a className="quiet-link" href={contact.emailHref}>
            Discuss a VR project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>
      <div className="hero__system-note" aria-hidden="true">
        <span>Scroll through six production systems</span>
        <i />
        <span>Use each control to inspect the build</span>
      </div>
    </section>
  );
}

function ProductNames({
  interactive,
  selected,
  onSelect,
}: {
  interactive: boolean;
  selected: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="product-names" role="group" aria-label="Select a mobile product">
      {mobileProducts.map((product, index) => (
        <span
          key={product.name}
          className={selected === index ? "is-selected" : undefined}
          data-selected={selected === index || undefined}
          data-muted={selected >= 0 && selected !== index || undefined}
        >
          <button
            type="button"
            disabled={!interactive}
            aria-pressed={selected === index}
            aria-label={`${product.name}: ${product.line}`}
            onClick={() => onSelect(index)}
          >
            <i>{String(index + 1).padStart(2, "0")}</i>
            <b>{product.name}</b>
            <small>{product.line}</small>
          </button>
        </span>
      ))}
    </div>
  );
}

type InteractionState = "idle" | "active" | "reset";

function dispatchSceneAction(world: Chapter["world"], count = 1) {
  for (let eventIndex = 0; eventIndex < count; eventIndex += 1) {
    window.dispatchEvent(new CustomEvent("larion:scene-action", { detail: world }));
  }
}

function ChapterSection({
  chapter,
  index,
  interactive,
  onJump,
}: {
  chapter: Chapter;
  index: number;
  interactive: boolean;
  onJump: JumpHandler;
}) {
  const [interactionState, setInteractionState] = useState<InteractionState>("idle");
  const [selectedProduct, setSelectedProduct] = useState(1);
  const isMobileChapter = chapter.world === "mobile";
  const interactionActive = interactionState === "active";
  const interactionStatus = interactionActive
    ? chapter.interaction.activeStatus
    : interactionState === "reset"
      ? chapter.interaction.resetStatus
      : chapter.interaction.idleStatus;

  useEffect(() => {
    if (!isMobileChapter) return;
    const handleProductFocus = (event: Event) => {
      const next = Number((event as CustomEvent<number>).detail);
      if (Number.isInteger(next) && next >= -1 && next < mobileProducts.length) {
        setSelectedProduct(next);
      }
    };
    window.addEventListener("larion:product-focused", handleProductFocus);
    return () => window.removeEventListener("larion:product-focused", handleProductFocus);
  }, [isMobileChapter]);

  const handleInteraction = () => {
    if (!interactive) return;
    if (interactionActive) {
      dispatchSceneAction(chapter.world, chapter.interaction.resetEvents ?? 1);
      setInteractionState("reset");
      return;
    }
    dispatchSceneAction(chapter.world);
    setInteractionState("active");
  };

  const handleProductSelect = (productIndex: number) => {
    if (!interactive || productIndex === selectedProduct) return;
    const eventsNeeded = selectedProduct < 0
      ? productIndex + 1
      : (productIndex - selectedProduct + mobileProducts.length) % mobileProducts.length;
    dispatchSceneAction("mobile", eventsNeeded);
    window.dispatchEvent(new CustomEvent("larion:product-select", {
      detail: {
        index: productIndex,
        name: mobileProducts[productIndex]?.name,
      },
    }));
    setSelectedProduct(productIndex);
  };

  const selectedProductName = selectedProduct >= 0
    ? mobileProducts[selectedProduct]?.name
    : null;

  return (
    <section
      className={`chapter chapter--${chapter.world} chapter--align-${chapter.alignment}`}
      id={chapter.id}
      data-stage={index + 1}
      data-alignment={chapter.alignment}
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
        <ul className="scene-caption__proof" aria-label="Project capabilities">
          {chapter.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>

        {isMobileChapter ? (
          <ProductNames
            interactive={interactive}
            selected={selectedProduct}
            onSelect={handleProductSelect}
          />
        ) : null}

        <div className="scene-caption__meta">
          {!isMobileChapter ? (
            <button
              className="scene-interaction"
              type="button"
              disabled={!interactive}
              aria-pressed={interactionActive}
              aria-describedby={`${chapter.id}-interaction-status`}
              onClick={handleInteraction}
            >
              <i aria-hidden="true" />
              {interactionActive ? chapter.interaction.resetLabel : chapter.interaction.label}
            </button>
          ) : null}
          <span
            className="scene-status scene-detail"
            id={`${chapter.id}-interaction-status`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {isMobileChapter
              ? selectedProductName
                ? `${selectedProductName} selected · interface focused in the 3D gallery.`
                : chapter.interaction.idleStatus
              : interactionStatus}
          </span>
          {chapter.noteDetail ? (
            <details className="scene-detail">
              <summary>Why this scene is reconstructed +</summary>
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
        onClick={(event) => onJump(
          event,
          chapters[index + 1]?.id ?? "contact",
          chapters[index + 1] ? index + 2 : 7,
        )}
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
        <p className="contact__eyebrow">Journey complete · Ready to scope the system</p>
        <h2 id="contact-title">Bring me the training challenge.</h2>
        <p>
          Tell me who needs to train, what has to feel real and which hardware or
          constraints are already in play. I’ll reply personally with the clearest next step.
        </p>
        <a className="contact__primary" href={contact.emailHref}>
          <span>Discuss your Unreal / VR project</span>
          <strong>{contact.email}</strong>
          <i aria-hidden="true">↗</i>
        </a>
        <a className="contact__secondary" href={contact.whatsapp} target="_blank" rel="noreferrer">
          Message on WhatsApp <span aria-hidden="true">↗</span>
        </a>
        <p className="availability"><i /> Bangkok · Building worldwide</p>
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
        <Hero onJump={handleJump} />
        {chapters.map((chapter, index) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            index={index}
            interactive={sceneInteractive}
            onJump={handleJump}
          />
        ))}
        <ContactSection />
      </main>
      <Footer onJump={handleJump} />
    </div>
  );
}
