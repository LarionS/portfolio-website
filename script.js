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
  const track = carouselRoot.querySelector(".media-carousel-track");
  const slides = Array.from(carouselRoot.querySelectorAll(".media-slide"));
  const prevButton = carouselRoot.querySelector('[data-carousel-action="prev"]');
  const nextButton = carouselRoot.querySelector('[data-carousel-action="next"]');
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let currentIndex = 0;
  let dragStartX = 0;
  let isDragging = false;
  let autoRotateTimer = null;

  const angleStep = 360 / slides.length;

  const getRadius = () => Math.max(260, Math.min(560, window.innerWidth * 0.42));

  const renderCarousel = () => {
    const radius = getRadius();
    track.style.transform = `translateZ(-${radius}px) rotateY(${-currentIndex * angleStep}deg)`;

    slides.forEach((slide, index) => {
      slide.style.transform = `translate(-50%, -50%) rotateY(${index * angleStep}deg) translateZ(${radius}px)`;
      slide.classList.toggle("is-active", index === currentIndex);
      slide.setAttribute("aria-hidden", index === currentIndex ? "false" : "true");
    });
  };

  const goToIndex = (nextIndex) => {
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
    if (prefersReducedMotion) {
      return;
    }
    stopAutoRotate();
    autoRotateTimer = window.setInterval(goNext, 4800);
  };

  prevButton?.addEventListener("click", () => {
    stopAutoRotate();
    goPrev();
    startAutoRotate();
  });

  nextButton?.addEventListener("click", () => {
    stopAutoRotate();
    goNext();
    startAutoRotate();
  });

  scene?.addEventListener("pointerdown", (event) => {
    isDragging = true;
    dragStartX = event.clientX;
    scene.setPointerCapture(event.pointerId);
    stopAutoRotate();
  });

  scene?.addEventListener("pointerup", (event) => {
    if (!isDragging) {
      return;
    }

    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) > 42) {
      if (distance < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    isDragging = false;
    startAutoRotate();
  });

  scene?.addEventListener("pointercancel", () => {
    isDragging = false;
    startAutoRotate();
  });

  scene?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  });

  carouselRoot.addEventListener("mouseenter", stopAutoRotate);
  carouselRoot.addEventListener("mouseleave", startAutoRotate);

  window.addEventListener("resize", renderCarousel);

  renderCarousel();
  startAutoRotate();
}
