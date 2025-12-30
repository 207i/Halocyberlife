// =====================================
// HaloCyberlife main_v3_0_0.js (safe)
// Works across ALL pages (no crashes)
// =====================================
// =====================================
// HaloCyberlife main_v2_0_0.js (clean full version)
// Works across ALL pages (legacy + modern)
// =====================================

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // -----------------------------
  // Neon header nav toggle (legacy header)
  // -----------------------------
  const neonToggle = $(".neon-nav-toggle");
  const neonNav = $(".neon-nav");

  if (neonToggle && neonNav) {
    neonToggle.addEventListener("click", () => {
      const isOpen = neonNav.classList.toggle("open");
      neonToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // -----------------------------
  // Site nav toggle (modern nav with .main-nav)
  // -----------------------------
  const siteToggle = $(".nav-toggle");
  const siteNav = $(".main-nav");

  if (siteToggle && siteNav) {
    const setExpanded = (open) => siteToggle.setAttribute("aria-expanded", String(open));

    siteToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      setExpanded(isOpen);
    });

    $$("a", siteNav).forEach((a) => {
      a.addEventListener("click", () => {
        if (siteNav.classList.contains("open")) {
          siteNav.classList.remove("open");
          setExpanded(false);
        }
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820 && siteNav.classList.contains("open")) {
        siteNav.classList.remove("open");
        setExpanded(false);
      }
    });
  }

  // -----------------------------
  // Smooth scroll for in-page anchor links with offset
  // -----------------------------
  $$('a[href^="#"]').forEach((el) => {
    el.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const id = href.startsWith("#") ? href.slice(1) : null;
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      e.preventDefault();
      const yOffset = -80; // offset for fixed header
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });

      // Close nav if open
      if (neonNav?.classList.contains("open")) {
        neonNav.classList.remove("open");
        neonToggle?.setAttribute("aria-expanded", "false");
      }
    });
  });

  // -----------------------------
  // Footer year
  // -----------------------------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // -----------------------------
  // Back to top button
  // -----------------------------
  const backToTopBtn = $(".back-to-top") || $("#backToTop");
  if (backToTopBtn) {
    const toggleBackToTop = () => {
      if (window.scrollY > 500) backToTopBtn.classList.add("show");
      else backToTopBtn.classList.remove("show");
    };

    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // -----------------------------
  // Contact form
  // -----------------------------
  const contactForm = $("#contactForm");
  if (contactForm) {
    const statusEl = $("#formStatus");
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    const setStatus = (msg) => {
      if (statusEl) statusEl.textContent = msg;
    };

    const setBusy = (busy) => {
      if (!submitBtn) return;
      submitBtn.disabled = busy;
      submitBtn.style.opacity = busy ? "0.75" : "1";
      submitBtn.style.cursor = busy ? "not-allowed" : "pointer";
    };

    const getEndpoint = () => {
      const ds = contactForm.dataset?.endpoint?.trim();
      if (ds) return ds;

      const action = (contactForm.getAttribute("action") || "").trim();
      if (action) return action;

      return "/api/contact";
    };

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      setStatus("Sending…");
      setBusy(true);

      const hp = contactForm.querySelector("#company");
      if (hp && hp.value.trim()) {
        setStatus("Sent ✅");
        contactForm.reset();
        setBusy(false);
        return;
      }

      const fd = new FormData(contactForm);
      const payload = {
        name: String(fd.get("name") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        subject: String(fd.get("subject") || "").trim(),
        message: String(fd.get("message") || "").trim(),
      };

      if (!payload.name || !payload.email || !payload.subject || !payload.message) {
        setStatus("❌ Please fill out all required fields.");
        setBusy(false);
        return;
      }

      const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
      if (!looksLikeEmail) {
        setStatus("❌ Please enter a valid email address.");
        setBusy(false);
        return;
      }

      try {
        const res = await fetch(getEndpoint(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus(data?.error || data?.message || `❌ Error (HTTP ${res.status})`);
          setBusy(false);
          return;
        }

        setStatus("Sent ✅ Thanks — message received.");
        contactForm.reset();
      } catch (err) {
        setStatus("❌ Network error. Please try again.");
      } finally {
        setBusy(false);
      }
    });
  }

  // -----------------------------
  // Vision slider (optional / only loads if present)
  // -----------------------------
  const slider = $(".vision-slider");
  if (slider) {
    const track = $(".vision-slider__track", slider);
    const slides = $$(".vision-slide", slider);
    const prevBtn = $(".vision-slider__btn--prev", slider);
    const nextBtn = $(".vision-slider__btn--next", slider);
    const dotsWrap = $(".vision-slider__dots", slider);

    if (track && slides.length && prevBtn && nextBtn && dotsWrap) {
      let index = 0;
      let timer = null;

      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "vision-slider__dot";
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
        dot.addEventListener("click", () => goTo(i, true));
        dotsWrap.appendChild(dot);
      });

      const dots = $$(".vision-slider__dot", slider);

      const update = () => {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, i) => d.setAttribute("aria-selected", i === index ? "true" : "false"));
      };

      const goTo = (i, userAction = false) => {
        index = (i + slides.length) % slides.length;
        update();
        if (userAction) restartAutoplay();
      };

      const next = (userAction = false) => goTo(index + 1, userAction);
      const prev = (userAction = false) => goTo(index - 1, userAction);

      prevBtn.addEventListener("click", () => prev(true));
      nextBtn.addEventListener("click", () => next(true));

      const viewport = $(".vision-slider__viewport", slider);
      let startX = 0;
      let isDown = false;

      if (viewport) {
        viewport.addEventListener("pointerdown", (e) => {
          isDown = true;
          startX = e.clientX;
        });

        viewport.addEventListener("pointerup", (e) => {
          if (!isDown) return;
          isDown = false;
          const dx = e.clientX - startX;
          if (Math.abs(dx) > 40) dx < 0 ? next(true) : prev(true);
        });

        viewport.addEventListener("pointercancel", () => {
          isDown = false;
        });
      }

      const startAutoplay = () => {
        stopAutoplay();
        timer = setInterval(() => next(false), 3000);
      };

      const stopAutoplay = () => {
        if (timer) clearInterval(timer);
        timer = null;
      };

      const restartAutoplay = () => startAutoplay();

      slider.addEventListener("mouseenter", stopAutoplay);
      slider.addEventListener("mouseleave", startAutoplay);

      update();
      startAutoplay();
    }
  }
})();













