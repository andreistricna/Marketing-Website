/* ==========================================================
   ANDREI — INTERACTIONS
   Progressive enhancement, no dependencies
   ========================================================== */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const navLinks = document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-menu a[href^="#"]');
  const sections = document.querySelectorAll("main section[id]");

  // Fixed navigation state
  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Mobile menu with focus-safe state
  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Deschide meniul");
    mobileMenu.hidden = true;
    document.body.classList.remove("menu-open");
  };

  const openMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Închide meniul");
    mobileMenu.hidden = false;
    document.body.classList.add("menu-open");
    mobileMenu.querySelector("a")?.focus();
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 880) closeMenu();
  });

  // Scroll reveal: content remains visible if IntersectionObserver is unavailable
  const revealItems = document.querySelectorAll("[data-reveal]");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -55px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // Active menu link while scrolling
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
          link.classList.toggle("is-active", isCurrent);
          if (isCurrent) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      },
      { threshold: [0.25, 0.5], rootMargin: "-25% 0px -55%" }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Expertise tabs
  const expertiseContent = {
    strategy: {
      label: "DIRECȚIE STRATEGICĂ",
      title: "De la obiectiv de business la plan de marketing.",
      copy: "Clarific poziționarea, prioritățile, audiențele și rolul fiecărui canal înainte ca bugetul să fie împărțit.",
      tags: ["Market analysis", "Positioning", "Roadmap"]
    },
    acquisition: {
      label: "PERFORMANCE & DEMAND",
      title: "Cerere captată eficient. Bugete puse la lucru.",
      copy: "Construiesc și optimizez ecosisteme Google Ads și Meta Ads în jurul intenției, economiei unitare și calității conversiilor.",
      tags: ["Google Ads", "Meta Ads", "Lead Quality"]
    },
    authority: {
      label: "SEARCH & BRAND",
      title: "Un brand ușor de găsit, înțeles și recomandat.",
      copy: "Conectez SEO, AI SEO și conținutul de brand pentru a construi vizibilitate durabilă în căutarea clasică și conversațională.",
      tags: ["SEO", "AI Search", "Content Systems"]
    },
    measurement: {
      label: "ANALYTICS & INSIGHT",
      title: "Mai puține rapoarte. Mai multe decizii bune.",
      copy: "Organizez tracking-ul și indicatorii astfel încât marketingul să poată fi evaluat în contextul rezultatelor comerciale.",
      tags: ["GA4", "Attribution", "Dashboards"]
    }
  };

  const expertiseTabs = document.querySelectorAll("[data-expertise]");
  const expertisePanel = document.querySelector("#expertise-panel");
  const panelLabel = expertisePanel?.querySelector("[data-panel-label]");
  const panelTitle = expertisePanel?.querySelector("[data-panel-title]");
  const panelCopy = expertisePanel?.querySelector("[data-panel-copy]");
  const panelTags = expertisePanel?.querySelector("[data-panel-tags]");

  const activateExpertise = (tab) => {
    const data = expertiseContent[tab.dataset.expertise];
    if (!data || !expertisePanel || !panelLabel || !panelTitle || !panelCopy || !panelTags) return;

    expertiseTabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    panelLabel.textContent = data.label;
    panelTitle.textContent = data.title;
    panelCopy.textContent = data.copy;
    panelTags.replaceChildren(...data.tags.map((tag) => {
      const element = document.createElement("span");
      element.textContent = tag;
      return element;
    }));

    expertisePanel.classList.remove("is-changing");
    void expertisePanel.offsetWidth;
    expertisePanel.classList.add("is-changing");
  };

  expertiseTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateExpertise(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) return;
      event.preventDefault();
      const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
      const nextIndex = (index + direction + expertiseTabs.length) % expertiseTabs.length;
      expertiseTabs[nextIndex].focus();
      activateExpertise(expertiseTabs[nextIndex]);
    });
  });

  // Accessible FAQ accordion: a single answer remains open
  document.querySelectorAll("[data-accordion] .accordion-item").forEach((item) => {
    const trigger = item.querySelector("button");
    trigger?.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");

      document.querySelectorAll("[data-accordion] .accordion-item").forEach((otherItem) => {
        otherItem.classList.remove("is-open");
        otherItem.querySelector("button")?.setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Subtle mouse parallax is limited to pointer-precise devices
  const parallaxRoot = document.querySelector("[data-parallax-root]");
  const parallaxItems = parallaxRoot?.querySelectorAll("[data-parallax]");
  const precisePointer = window.matchMedia("(pointer: fine)").matches;

  if (parallaxRoot && parallaxItems && precisePointer && !reducedMotion) {
    let animationFrame;

    parallaxRoot.addEventListener("pointermove", (event) => {
      const rect = parallaxRoot.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        parallaxItems.forEach((item) => {
          const depth = Number(item.dataset.parallax) || 0;
          item.style.translate = `${x * 13 * depth}px ${y * 13 * depth}px`;
        });
      });
    });

    parallaxRoot.addEventListener("pointerleave", () => {
      cancelAnimationFrame(animationFrame);
      parallaxItems.forEach((item) => {
        item.style.translate = "0 0";
      });
    });
  }

  // Current year stays accurate without a manual edit
  document.querySelectorAll("[data-year]").forEach((item) => {
    item.textContent = String(new Date().getFullYear());
  });
})();
