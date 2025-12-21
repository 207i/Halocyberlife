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

    // Close menu when clicking any nav link (nice mobile UX)
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
  const backToTopBtn = $(".back-to-top");
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
  // 5) Contact form submit (POST /api/contact)
  // Safe on pages without the form/status elements
  // -----------------------------
  const contactForm = $("#contactForm");
  if (contactForm) {
    const status = $("#formStatus");
    const setStatus = (msg) => {
      if (status) status.textContent = msg;
    };

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      setStatus("Sending...");

      // Honeypot: if filled, silently stop (spam bots)
      const company = contactForm.querySelector('input[name="company"]')?.value?.trim();
      if (company) {
        setStatus("✅ Sent.");
        contactForm.reset();
        return;
      }

      const data = Object.fromEntries(new FormData(contactForm).entries());

      // Basic validation
      if (!data.name || !data.email || !data.subject || !data.message) {
        setStatus("❌ Please fill out all required fields.");
        return;
      }

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
          }),
        });

        if (!res.ok) throw new Error("Request failed");

        setStatus("✅ Sent. Thank you — your message was received.");
        contactForm.reset();
      } catch (err) {
        setStatus("❌ Could not send right now. Please try again later.");
      }
    });
  }

  // -----------------------------
  // 6) Vision Slider (optional GLOBAL)
  // Keep this ONLY if you want the slider to work on any page that includes
  // the .vision-slider HTML. Safe if missing.
  // If you prefer inline JS inside the blog page, delete this section.
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

      // Build dots
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

      // Swipe support (mobile)
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
          if (Math.abs(dx) > 40) {
            dx < 0 ? next(true) : prev(true);
          }
        });

        viewport.addEventListener("pointercancel", () => {
          isDown = false;
        });
      }

      const startAutoplay = () => {
        stopAutoplay();
        timer = setInterval(() => next(false), 5000);
      };

      const stopAutoplay = () => {
        if (timer) clearInterval(timer);
        timer = null;
      };

      const restartAutoplay = () => startAutoplay();

      // Pause autoplay on hover
      slider.addEventListener("mouseenter", stopAutoplay);
      slider.addEventListener("mouseleave", startAutoplay);

      update();
      startAutoplay();
    }
  }
}






































