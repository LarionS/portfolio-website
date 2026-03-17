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
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let currentIndex = 0;
  let pointerStartX = 0;
  let isPointerDown = false;
  let autoRotateTimer = null;
  let wheelAccumulator = 0;
  let wheelResetTimer = null;

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
  };

  const startAutoRotate = () => {
    if (prefersReducedMotion || slides.length < 2) {
      return;
    }
    stopAutoRotate();
    autoRotateTimer = window.setInterval(goNext, 4200);
  };

  prevButton?.addEventListener("click", () => {
    goPrev();
    startAutoRotate();
  });

  nextButton?.addEventListener("click", () => {
    goNext();
    startAutoRotate();
  });

  slides.forEach((slide, index) => {
    slide.addEventListener("click", () => {
      if (index === currentIndex) {
        return;
      }
      goToIndex(index);
      startAutoRotate();
    });
  });

  scene?.addEventListener("pointerdown", (event) => {
    isPointerDown = true;
    pointerStartX = event.clientX;
    scene.setPointerCapture(event.pointerId);
    stopAutoRotate();
  });

  scene?.addEventListener("pointerup", (event) => {
    if (!isPointerDown) {
      return;
    }

    const distance = event.clientX - pointerStartX;
    if (Math.abs(distance) > 42) {
      if (distance < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    isPointerDown = false;
    startAutoRotate();
  });

  scene?.addEventListener("pointercancel", () => {
    isPointerDown = false;
    startAutoRotate();
  });

  scene?.addEventListener(
    "wheel",
    (event) => {
      const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(dominantDelta) < 4) {
        return;
      }

      event.preventDefault();
      stopAutoRotate();
      wheelAccumulator += dominantDelta;

      if (Math.abs(wheelAccumulator) >= 42) {
        if (wheelAccumulator > 0) {
          goNext();
        } else {
          goPrev();
        }
        wheelAccumulator = 0;
        startAutoRotate();
      }

      if (wheelResetTimer) {
        window.clearTimeout(wheelResetTimer);
      }
      wheelResetTimer = window.setTimeout(() => {
        wheelAccumulator = 0;
      }, 160);
    },
    { passive: false }
  );

  scene?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
      startAutoRotate();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
      startAutoRotate();
    }
  });

  carouselRoot.addEventListener("mouseenter", stopAutoRotate);
  carouselRoot.addEventListener("mouseleave", startAutoRotate);

  window.addEventListener("resize", renderCarousel);

  renderCarousel();
  startAutoRotate();
}
