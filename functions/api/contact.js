// functions/api/contact.js

export async function onRequestPost({ request, env }) {
  try {
    const form = await request.formData();

    // Honeypot (spam trap)
    const company = (form.get("company") || "").toString().trim();
    if (company) {
      // Pretend success (bots get nothing)
      return json({ ok: true });
    }

    const name = (form.get("name") || "").toString().trim();
    const email = (form.get("email") || "").toString().trim();
    const subject = (form.get("subject") || "").toString().trim();
    const message = (form.get("message") || "").toString().trim();

    if (!name || !email || !subject || !message) {
      return json({ ok: false, error: "Missing required fields." }, 400);
    }

    // Send email using MailChannels (works great on Cloudflare)
    const toEmail = env.TO_EMAIL;         // set in CF Pages env vars
    const fromEmail = env.FROM_EMAIL;     // set in CF Pages env vars (ex: noreply@halocyberlife.com)

    if (!toEmail || !fromEmail) {
      return json({ ok: false, error: "Server not configured (missing env vars)." }, 500);
    }

    const bodyText =
`New Contact Form Message

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
`;

    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: fromEmail, name: "Halocyberlife Contact" },
        reply_to: { email, name },
        subject: `Halocyberlife: ${subject}`,
        content: [{ type: "text/plain", value: bodyText }]
      })
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      return json({ ok: false, error: "Email provider rejected the request.", details: errText }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "Server error." }, 500);
  }
}

export async function onRequestGet() {
  // Helpful if you visit /api/contact in browser
  return new Response("OK - contact endpoint is alive. Use POST.", { status: 200 });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store"
    }
  });
}
