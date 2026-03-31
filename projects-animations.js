(() => {
  function setupThemeToggle() {
    const toggles = Array.from(
      document.querySelectorAll("[data-theme-toggle]"),
    );
    if (!toggles.length) {
      return;
    }

    const root = document.documentElement;
    const storageKey = "arcway-theme";

    function isDarkMode() {
      return root.classList.contains("dark");
    }

    function renderToggleUi() {
      const dark = isDarkMode();
      toggles.forEach((toggle) => {
        const icon = toggle.querySelector("[data-theme-icon]");
        toggle.setAttribute(
          "aria-label",
          dark ? "Switch to light mode" : "Switch to dark mode",
        );
        toggle.setAttribute("title", dark ? "Light mode" : "Dark mode");
        if (icon) {
          icon.textContent = dark ? "light_mode" : "dark_mode";
        }
      });
    }

    function applyTheme(theme) {
      const dark = theme === "dark";
      root.classList.toggle("dark", dark);
      root.classList.toggle("light", !dark);
      try {
        localStorage.setItem(storageKey, dark ? "dark" : "light");
      } catch (error) {
        // Ignore storage failures and keep in-memory theme.
      }
      renderToggleUi();
    }

    toggles.forEach((toggle) => {
      if (toggle.dataset.boundTheme === "true") {
        return;
      }
      toggle.dataset.boundTheme = "true";
      toggle.addEventListener("click", () => {
        applyTheme(isDarkMode() ? "light" : "dark");
      });
    });

    renderToggleUi();
  }

  setupThemeToggle();

  function setupMobileMenu() {
    const menuButton = document.getElementById("mobileMenuButtonProjects");
    const mobileMenu = document.getElementById("mobileMenuProjects");

    if (!menuButton || !mobileMenu || menuButton.dataset.bound === "true") {
      return;
    }

    menuButton.dataset.bound = "true";
    const icon = menuButton.querySelector(".material-symbols-outlined");

    function setMenuState(isOpen) {
      mobileMenu.classList.toggle("hidden", !isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      if (icon) {
        icon.textContent = isOpen ? "close" : "menu";
      }
    }

    menuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setMenuState(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuState(false);
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (
        menuButton.getAttribute("aria-expanded") === "true" &&
        !mobileMenu.contains(target) &&
        !menuButton.contains(target)
      ) {
        setMenuState(false);
      }
    });

    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    if (desktopMedia.matches) {
      setMenuState(false);
    }
    desktopMedia.addEventListener("change", (event) => {
      if (event.matches) {
        setMenuState(false);
      }
    });
  }

  setupMobileMenu();

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const progressBar = document.querySelector("#scrollProgress");
  const nav = document.querySelector("nav");
  const heroSection = document.querySelector("main section");
  const revealEls = gsap.utils.toArray(".reveal");
  const projectPanels = gsap.utils.toArray(".project-panel");
  const counters = gsap.utils.toArray(".counter-value");
  const timelineProgress = document.querySelector("#timelineProgress");
  const stackChips = gsap.utils.toArray(".stack-chip");
  const sectionHeadings = gsap.utils.toArray("section h2");

  if (progressBar) {
    const setScaleX = gsap.quickSetter(progressBar, "scaleX");
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        setScaleX(self.progress);
      },
    });
  }

  if (prefersReducedMotion) {
    revealEls.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  heroTl
    .from(".hero-badge", { y: 24, opacity: 0, duration: 0.55 })
    .from(
      ".hero-line span",
      {
        yPercent: isMobile ? 90 : 120,
        stagger: isMobile ? 0.08 : 0.12,
        duration: isMobile ? 0.65 : 0.9,
      },
      "-=0.2",
    )
    .from(
      ".hero-copy",
      {
        y: isMobile ? 16 : 26,
        opacity: 0,
        duration: isMobile ? 0.45 : 0.65,
      },
      "-=0.45",
    )
    .from(
      ".hero-cta a",
      {
        y: isMobile ? 12 : 18,
        opacity: 0,
        duration: isMobile ? 0.35 : 0.45,
        stagger: isMobile ? 0.06 : 0.1,
      },
      "-=0.45",
    )
    .from(
      ".hero-kpis .stack-chip",
      {
        y: isMobile ? 14 : 22,
        opacity: 0,
        duration: isMobile ? 0.35 : 0.45,
        stagger: isMobile ? 0.05 : 0.08,
      },
      "-=0.35",
    );

  if (!isMobile) {
    gsap.to(".hero-orb", {
      y: -22,
      x: 14,
      duration: 5,
      ease: "sine.inOut",
      stagger: 0.4,
      repeat: -1,
      yoyo: true,
    });
  }

  if (nav) {
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const y = self.scroll();

        gsap.to(nav, {
          y: isMobile ? 0 : self.direction === 1 && y > 140 ? -84 : 0,
          duration: 0.28,
          ease: "power2.out",
          overwrite: true,
        });

        gsap.to(nav, {
          backgroundColor:
            y > 30 ? "rgba(18, 19, 21, 0.88)" : "rgba(18, 19, 21, 0.70)",
          borderColor:
            y > 30 ? "rgba(82, 68, 51, 0.45)" : "rgba(82, 68, 51, 0.2)",
          duration: 0.25,
          overwrite: true,
        });
      },
    });
  }

  if (heroSection && !isMobile) {
    gsap.to(".hero-copy", {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: 0.4,
      },
    });

    gsap.to(".hero-kpis", {
      yPercent: -12,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: 0.35,
      },
    });

    gsap.to(".hero-cta", {
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: 0.25,
      },
    });
  }

  revealEls.forEach((el) => {
    gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: isMobile ? 0.55 : 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: isMobile ? "top 93%" : "top 86%",
          once: true,
        },
      },
    );
  });

  projectPanels.forEach((panel) => {
    if (!isMobile) {
      gsap.fromTo(
        panel,
        { y: 26, rotateX: 1.4 },
        {
          y: -10,
          rotateX: 0,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        },
      );
    }

    const panelParts = panel.querySelectorAll(
      "h3, p, li, .bg-surface-container-low, .bg-surface-container, .bg-surface-container-high, .mono-label",
    );

    gsap.from(panelParts, {
      y: 22,
      opacity: 0,
      stagger: 0.03,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: panel,
        start: "top 80%",
        once: true,
      },
    });

    if (!isTouch) {
      panel.addEventListener("mouseenter", () => {
        gsap.to(panel, {
          y: -4,
          duration: 0.35,
          ease: "power2.out",
        });
      });

      panel.addEventListener("mouseleave", () => {
        gsap.to(panel, {
          y: 0,
          duration: 0.45,
          ease: "power3.out",
        });
      });
    }
  });

  if (!isTouch) {
    gsap.utils.toArray(".tilt-card").forEach((card) => {
      const limit = 8;

      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * limit;
        const rotateX = (0.5 - y) * limit;

        gsap.to(card, {
          rotateX,
          rotateY,
          scale: 1.01,
          duration: 0.35,
          ease: "power2.out",
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.5,
          ease: "power3.out",
        });
      });
    });
  }

  sectionHeadings.forEach((heading) => {
    gsap.from(heading, {
      y: 26,
      opacity: 0,
      duration: 0.75,
      ease: "power3.out",
      scrollTrigger: {
        trigger: heading,
        start: "top 88%",
        once: true,
      },
    });
  });

  counters.forEach((counter) => {
    const toValue = Number(counter.dataset.count || 0);
    const suffix = counter.dataset.suffix || "";
    const prefix = counter.dataset.prefix || "";

    ScrollTrigger.create({
      trigger: counter,
      start: "top 92%",
      once: true,
      onEnter: () => {
        const holder = { value: 0 };

        gsap.to(holder, {
          value: toValue,
          duration: 1.3,
          ease: "power2.out",
          onUpdate: () => {
            const current = Math.floor(holder.value);
            counter.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
          },
          onComplete: () => {
            counter.textContent = `${prefix}${toValue.toLocaleString()}${suffix}`;
          },
        });
      },
    });
  });

  if (timelineProgress) {
    gsap.to(timelineProgress, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#delivery-flow .timeline-wrap",
        start: "top 75%",
        end: "bottom 35%",
        scrub: 0.35,
      },
    });
  }

  gsap.utils.toArray(".timeline-item").forEach((item, index) => {
    gsap.fromTo(
      item,
      { x: 20, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.65,
        ease: "power2.out",
        delay: index * 0.02,
        scrollTrigger: {
          trigger: item,
          start: "top 88%",
          once: true,
        },
      },
    );
  });

  if (stackChips.length) {
    gsap.from(stackChips, {
      scale: 0.86,
      opacity: 0,
      duration: 0.6,
      stagger: {
        each: 0.05,
        from: "random",
      },
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: "#technology-spine",
        start: "top 82%",
        once: true,
      },
    });

    if (!isMobile) {
      stackChips.forEach((chip, index) => {
        gsap.to(chip, {
          y: -3,
          duration: 1.8 + (index % 4) * 0.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.08,
        });
      });
    }
  }

  const magneticTargets = gsap.utils.toArray(
    ".hero-cta a, nav a.bg-primary-container, a[href='index.html#contact']",
  );

  if (!isTouch) {
    magneticTargets.forEach((target) => {
      target.addEventListener("mousemove", (event) => {
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        gsap.to(target, {
          x: x * 0.12,
          y: y * 0.18,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      target.addEventListener("mouseleave", () => {
        gsap.to(target, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: "power3.out",
        });
      });
    });
  }

  if (!isMobile) {
    gsap.to(".grid-trace", {
      backgroundPosition: "60px 60px",
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.25,
      },
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  ScrollTrigger.refresh();
})();
