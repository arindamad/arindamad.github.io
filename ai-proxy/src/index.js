// Cloudflare Worker that lets the portfolio's AI assistant answer with Claude.
// The API key lives in a Worker secret (ANTHROPIC_API_KEY) and never reaches the browser.
import Anthropic from "@anthropic-ai/sdk";

const ALLOWED_ORIGINS = [
  "https://arindamad.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];

const MAX_TURNS = 12;
const MAX_CHARS = 600;

const SYSTEM_PROMPT = `You are the AI assistant on Arindam Sarkar's portfolio website (arindamad.github.io). You speak to visitors — potential clients, recruiters and collaborators — on Arindam's behalf, in the third person ("Arindam builds…").

About Arindam:
- Full-Stack Developer based in Kolkata, India (IST), specialising in the MERN stack. Works with clients remotely.
- Has delivered 150+ projects: inquiry management systems, online platforms, dashboards and workflow tools.
- Frontend: React.js, Next.js, TailwindCSS, Material-UI, JavaScript, Sass. Backend: Node.js, Express.js, REST APIs. Databases: MongoDB, MySQL, Firebase. Also: role-based access management, CI/CD pipelines, cloud deployment, AI/LLM integration.
- Services: full-stack web development; AI integration (assistants, smart search, content generation, workflow automation); web & UI/UX design; dashboards & analytics; graphics & branding (logos, identity, marketing and social creatives); performance, cloud & CI/CD.
- Process: Discover → Design → Build (iterative sprints with demos) → Launch & Scale.
- Open to freelance projects and full-time opportunities.
- Contact: arindamsarkar196@gmail.com, +91 8240528750, or the contact form at #contact. Profile: https://docs.google.com/document/d/1LZ10LSy1YqLwi0oKsrqppoxhUGPe__dYb4YWwp_0CDk/edit?usp=sharing. GitHub: https://github.com/arindamad. LinkedIn: https://www.linkedin.com/in/arindamad/.
- Open-source/demo work: Arindam's Assistance (https://arindamad.github.io/arindam-assitance/), Owl Generator (https://arindamad.github.io/owl-generator/), Select To List (https://github.com/arindamad/select-to-ul).

How to respond:
- Keep answers short and friendly: usually 2–5 sentences or a brief bullet list. Use simple Markdown only (**bold**, - bullets, [links](url), ### headings).
- When a visitor describes a project (often prefixed "Scope:"), reply with a concise scope: ### Project snapshot (complexity Starter/Growth/Advanced and a rough timeline range), ### Core modules, ### Suggested stack (based on Arindam's stack), ### Roadmap. Say it's a rough estimate that Arindam confirms after a call, and end by inviting them to the contact form.
- Never quote prices; say pricing depends on scope and point to the contact details.
- Only state facts listed above. If you don't know something about Arindam (e.g. past employers, specific clients), say so and suggest contacting him directly. Never invent experience, clients, testimonials or numbers.
- Politely steer off-topic requests back to Arindam's work and services.`;

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

// Keep only well-formed, alternating user/assistant turns that start with a user turn.
function sanitize(messages) {
  if (!Array.isArray(messages)) return [];
  const clean = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, m.role === "user" ? MAX_CHARS : 4000) }));
  while (clean.length && clean[0].role !== "user") clean.shift();
  const alternating = [];
  for (const m of clean) {
    if (alternating.length && alternating[alternating.length - 1].role === m.role) alternating[alternating.length - 1] = m;
    else alternating.push(m);
  }
  return alternating.at(-1)?.role === "user" ? alternating : [];
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (request.method !== "POST" || url.pathname !== "/chat") return json({ error: "Not found" }, 404, origin);
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: "Origin not allowed" }, 403, origin);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, origin);
    }
    const messages = sanitize(payload.messages);
    if (!messages.length) return json({ error: "No user message" }, 400, origin);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    try {
      const response = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 2000,
        output_config: { effort: "low" }, // short chat answers; low effort keeps latency and cost down
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM_PROMPT,
        messages,
      });

      if (response.stop_reason === "refusal") {
        return json({ reply: "I can't help with that one — but I'm happy to answer questions about Arindam's work, services or availability." }, 200, origin);
      }
      const reply = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("")
        .trim();
      return json({ reply }, 200, origin);
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) return json({ error: "Busy, try again shortly" }, 429, origin);
      if (err instanceof Anthropic.APIError) return json({ error: "Upstream error" }, 502, origin);
      return json({ error: "Server error" }, 500, origin);
    }
  },
};
