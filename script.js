(function () {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

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

  function setupContactForm() {
    const form = document.getElementById("contactForm");
    if (!form || form.dataset.bound === "true") {
      return;
    }

    form.dataset.bound = "true";

    const status = form.querySelector(".form-status");

    function showStatus(message, isError) {
      if (!status) {
        return;
      }

      status.textContent = message;
      status.classList.remove("hidden", "text-red-400", "text-primary");
      status.classList.add(isError ? "text-red-400" : "text-primary");
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = (form.elements.name?.value || "").trim();
      const email = (form.elements.email?.value || "").trim();
      const projectType = form.elements.projectType?.value || "General Enquiry";
      const brief = (form.elements.brief?.value || "").trim();

      if (!name || !email || !brief) {
        showStatus("Please fill Name, Email, and Brief.", true);
        return;
      }

      const subject = `Arcway Brief: ${projectType}`;
      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Project Type: ${projectType}`,
        "",
        "Brief:",
        brief,
      ].join("\n");

      const mailtoUrl = `mailto:connect.arcway@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      showStatus("Opening your email app with this brief...", false);
      window.location.href = mailtoUrl;
    });
  }

  setupContactForm();

  function setupMobileMenu() {
    const menuButton = document.getElementById("mobileMenuButton");
    const mobileMenu = document.getElementById("mobileMenu");

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

  const hasGsap = typeof window.gsap !== "undefined";
  const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
  const scrollContainer = document.querySelector("[data-scroll-container]");
  const topLink = document.querySelector(".back-to-top");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  if (!scrollContainer || !hasGsap || !hasScrollTrigger) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const sections = Array.from(document.querySelectorAll("main > section"));
  sections.forEach((section) => {
    section.setAttribute("data-scroll-section", "");
  });

  let locoScroll = null;
  let currentScroller = window;

  function initLocomotive() {
    if (
      prefersReducedMotion ||
      typeof window.LocomotiveScroll === "undefined"
    ) {
      return;
    }

    locoScroll = new window.LocomotiveScroll({
      el: scrollContainer,
      smooth: true,
      lerp: 0.16,
      multiplier: 0.9,
      smartphone: { smooth: false },
      tablet: { smooth: false },
    });

    locoScroll.on("scroll", () => {
      ScrollTrigger.update();
    });

    ScrollTrigger.scrollerProxy(scrollContainer, {
      scrollTop(value) {
        if (arguments.length) {
          locoScroll.scrollTo(value, { duration: 0, disableLerp: true });
          return;
        }
        return locoScroll.scroll.instance.scroll.y;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: scrollContainer.style.transform ? "transform" : "fixed",
    });

    ScrollTrigger.addEventListener("refresh", () => {
      locoScroll.update();
    });

    currentScroller = scrollContainer;
  }

  function revealOnScroll(selector, yOffset) {
    gsap.utils.toArray(selector).forEach((element) => {
      gsap.from(element, {
        y: isMobile ? Math.min(yOffset, 22) : yOffset,
        autoAlpha: 0,
        force3D: true,
        duration: isMobile ? 0.6 : 0.9,
        ease: "power2.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: element,
          scroller: currentScroller,
          start: isMobile ? "top 92%" : "top 85%",
          once: true,
          fastScrollEnd: true,
        },
      });
    });
  }

  function setupPageAnimations() {
    gsap.from(
      [
        "section:first-of-type .mono-label",
        "section:first-of-type h1",
        "section:first-of-type p",
        "section:first-of-type .flex.flex-wrap",
      ],
      {
        y: isMobile ? 28 : 50,
        autoAlpha: 0,
        duration: isMobile ? 0.75 : 1,
        stagger: isMobile ? 0.07 : 0.12,
        ease: "power3.out",
      },
    );

    if (!isMobile) {
      gsap.to(".hero-glow", {
        yPercent: 8,
        scale: 1.04,
        ease: "none",
        scrollTrigger: {
          trigger: "section:first-of-type",
          scroller: currentScroller,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }

    revealOnScroll("#about .grid > div", 45);
    revealOnScroll("#services .grid > div", 45);
    revealOnScroll("#portfolio .grid > div", 40);
    revealOnScroll("#contact .grid > div", 45);
    revealOnScroll("section.py-32.px-6 .space-y-24 > div", 35);
    revealOnScroll("section.py-32.px-6.bg-surface-container-low .group", 35);

    const processLine = document.querySelector(".process-line");
    if (processLine) {
      gsap.from(processLine, {
        scaleY: 0,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: {
          trigger: processLine,
          scroller: currentScroller,
          start: "top 75%",
          end: "bottom 30%",
          scrub: true,
        },
      });
    }

    if (!isTouch) {
      document.querySelectorAll("#portfolio .group").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -8,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            y: 0,
            duration: 0.35,
            ease: "power2.out",
          });
        });
      });
    }
  }

  function setupAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      const href = anchor.getAttribute("href");
      if (!href || href.length <= 1) {
        return;
      }

      anchor.addEventListener("click", (event) => {
        const target = document.querySelector(href);
        if (!target) {
          return;
        }

        event.preventDefault();
        if (locoScroll) {
          locoScroll.scrollTo(target, {
            offset: -30,
            duration: 900,
            easing: [0.25, 0.0, 0.35, 1.0],
          });
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    if (topLink) {
      topLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (locoScroll) {
          locoScroll.scrollTo(0, {
            duration: 850,
            easing: [0.25, 0.0, 0.35, 1.0],
          });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  }

  window.addEventListener("load", () => {
    window.scrollTo(0, 0);

    initLocomotive();

    if (locoScroll) {
      locoScroll.scrollTo(0, {
        duration: 0,
        disableLerp: true,
      });
    }

    setupPageAnimations();
    setupAnchorScroll();
    ScrollTrigger.refresh();
  });

  window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
    if (locoScroll) {
      locoScroll.update();
    }
  });
})();
