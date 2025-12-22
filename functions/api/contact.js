export async function onRequestPost({ request, env }) {
  try {
    const form = await request.formData();

    // Honeypot spam trap
    const company = (form.get("company") || "").toString().trim();
    if (company) {
      return json({ ok: true }); // silently succeed (bot)
    }

    const name = (form.get("name") || "").toString().trim();
    const email = (form.get("email") || "").toString().trim();
    const subject = (form.get("subject") || "").toString().trim();
    const message = (form.get("message") || "").toString().trim();

    if (!name || !email || !subject || !message) {
      return json({ error: "Missing required fields." }, 400);
    }

    // ✅ Send email via MailChannels (works on Cloudflare Workers/Pages)
    const toEmail = env.TO_EMAIL; // set in Pages env vars
    const fromEmail = env.FROM_EMAIL || "noreply@halocyberlife.com";

    const payload = {
      personalizations: [
        { to: [{ email: toEmail }], reply_to: { email, name } }
      ],
      from: { email: fromEmail, name: "Halocyberlife Contact Form" },
      subject: `[Halocyberlife] ${subject}`,
      content: [
        {
          type: "text/plain",
          value:
`New contact form submission:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
`
        }
      ]
    };

    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return json({ error: "Email service rejected the request.", detail: text }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ error: "Server error." }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
