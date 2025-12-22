// /js/contact.js
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "Sending...";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: new FormData(form), // keep as FormData
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        statusEl.textContent = `❌ Could not send right now. (HTTP ${res.status}) ${data.error || "Please try again later."}`;
        return;
      }

      statusEl.textContent = "✅ Sent! Thank you.";
      form.reset();
    } catch (err) {
      statusEl.textContent = "❌ Network error. Please try again.";
    }
  });
}
