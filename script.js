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
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
