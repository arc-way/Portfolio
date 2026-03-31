// ===== Initial Page Load Animations =====
window.addEventListener("load", () => {
  // Animate hero section elements with stagger
  const heroSection = document.querySelector("section:first-of-type");

  if (heroSection) {
    const monoLabel = heroSection.querySelector(".mono-label");
    const heading = heroSection.querySelector("h1");
    const paragraph = heroSection.querySelector("p");

    const tl = gsap.timeline({
      defaults: {
        duration: 0.7,
        ease: "power2.out"
      },
      onComplete: () => {
        // Ensure visibility after animation
        if (monoLabel) monoLabel.style.opacity = "1";
        if (heading) heading.style.opacity = "1";
        if (paragraph) paragraph.style.opacity = "1";
      }
    });

    if (monoLabel) {
      tl.from(monoLabel, { opacity: 0, y: 20 }, 0);
    }

    if (heading) {
      tl.from(heading, { opacity: 0, y: 30 }, 0.1);
    }

    if (paragraph) {
      tl.from(paragraph, { opacity: 0, y: 20 }, 0.2);
    }

    // Safety: Force visibility after 2 seconds if animation hasn't completed
    setTimeout(() => {
      if (monoLabel) monoLabel.style.opacity = "1";
      if (heading) heading.style.opacity = "1";
      if (paragraph) paragraph.style.opacity = "1";
    }, 2000);
  }
});