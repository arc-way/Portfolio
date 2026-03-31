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
      document.body.style.overflow = isOpen ? "hidden" : "auto";
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

  // Back to top button
  const topLink = document.querySelector(".back-to-top");
  if (topLink) {
    topLink.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
