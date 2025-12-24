// =====================================
// HaloCyberlife main_v2_0_0.js (safe)
// Works across ALL pages (no crashes)
// =====================================

(() => {
  // -----------------------------
  // Helpers
  // -----------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // -----------------------------
  // 1) Neon header nav toggle (legacy pages)
  // -----------------------------
  const neonToggle = $(".neon-nav-toggle");
  const neonNav = $(".neon-nav");

  if (neonToggle && neonNav) {
    neonToggle.addEventListener("click", () => {
      neonNav.classList.toggle("open");
    });
  }

  // -----------------------------
  // 2) Site header nav toggle (current header)
  // -----------------------------
  const siteToggle = $(".nav-toggle");
  const siteNav = $(".main-nav");

  if (siteToggle && siteNav) {
    const setExpanded = (open) => siteToggle.setAttribute("aria-expanded", String(open));

    siteToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      setExpanded(isOpen);
    });

    // Close menu when clicking any nav link (mobile UX)
    $$("a", siteNav).forEach((a) => {
      a.addEventListener("click", () => {
        if (siteNav.classList.contains("open")) {
          siteNav.classList.remove("open");
          setExpanded(false);
        }
      });
    });

    // Close menu when resizing to desktop width
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820 && siteNav.classList.contains("open")) {
        siteNav.classList.remove("open");
        setExpanded(false);
      }
    });
  }

  // -----------------------------
  // 3) Footer year
  // -----------------------------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // -----------------------------
  // 4) Back to top button
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
  // 5) Contact form submit (stable)
  // - Uses form[data-endpoint] if provided
  // - Falls back to /api/contact
  // - Safe on pages without the form/status elements
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

    // Endpoint priority:
    // 1) <form data-endpoint="https://...">
    // 2) form.action if you set action="https://..."
    // 3) fallback /api/contact
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

      // Honeypot: if filled, silently pretend success
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

      // Basic validation
      if (!payload.name || !payload.email || !payload.subject || !payload.message) {
        setStatus("❌ Please fill out all required fields.");
        setBusy(false);
        return;
      }

      // Light email sanity check (no overkill)
      const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
      if (!looksLikeEmail) {
        setStatus("❌ Please enter a valid email address.");
        setBusy(false);
        return;
      }

      const endpoint = getEndpoint();

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // Try to read json for error messages (if any)
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const msg =
            data?.error ||
            data?.message ||
            `❌ Could not send right now. (HTTP ${res.status}) Please try again later.`;
          setStatus(msg);
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
  // 6) Vision Slider (optional GLOBAL)
  // Safe if missing.
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

      // Swipe support
      let startX = 0;
      let isDown = false;
      const viewport = $(".vision-slider__viewport", slider);

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



































