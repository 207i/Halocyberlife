// ===============================
// HaloCyberlife v2.0.2 Navigation
// ===============================

// Neon nav mobile toggle
const neonToggle = document.querySelector('.neon-nav-toggle');
const neonNav = document.querySelector('.neon-nav');

if (neonToggle && neonNav) {
    neonToggle.addEventListener('click', () => {
        neonNav.classList.toggle('open');
    });
}

// ===== Contact form submit (POST to /api/contact) =====
document.getElementById("contactForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("formStatus");
  const form = e.target;

  status.textContent = "Sending...";

  // Honeypot: if filled, silently stop (spam bots)
  const company = form.querySelector('input[name="company"]')?.value?.trim();
  if (company) {
    status.textContent = "✅ Sent.";
    form.reset();
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());

  // Basic front-end validation
  if (!data.name || !data.email || !data.subject || !data.message) {
    status.textContent = "❌ Please fill out all required fields.";
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

    status.textContent = "✅ Sent. Thank you — your message was received.";
    form.reset();
  } catch (err) {
    status.textContent = "❌ Could not send right now. Please try again later.";
  }
});
