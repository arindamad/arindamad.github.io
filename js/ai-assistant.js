/* =========================================================
   Arindam's AI assistant
   - Works out of the box with a built-in knowledge base and a
     rule-based project scoper (no server, no API key).
   - Set AI_ENDPOINT to your deployed proxy (see ai-proxy/) to
     answer with Claude instead; it falls back to the local
     engine if the endpoint is unreachable.
   ========================================================= */
(function () {
  'use strict';

  var AI_ENDPOINT = ''; // e.g. 'https://arindam-ai.<your-subdomain>.workers.dev/chat'

  var $ = function (s) { return document.querySelector(s); };
  var chat = $('#chat'), body = $('#chat-body'), form = $('#chat-form'), input = $('#chat-input'), chipsEl = $('#chat-chips');
  var hasGSAP = typeof window.gsap !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var history = []; // [{role:'user'|'assistant', content}]
  var busy = false;
  var greeted = false;

  /* ---------------- Knowledge base ---------------- */
  var CONTACT = 'You can reach Arindam at **[arindamsarkar196@gmail.com](mailto:arindamsarkar196@gmail.com)**, call **[+91 8240528750](tel:+918240528750)**, or use the [contact form](#contact) on this page.';

  var INTENTS = [
    { id: 'greet', keys: ['hi', 'hello', 'hey', 'hola', 'namaste', 'good morning', 'good evening', 'yo'],
      reply: 'Hey there! 👋 I\'m Arindam\'s AI assistant. Ask me about his **services**, **tech stack**, **availability** — or describe your project and I\'ll sketch a scope for it.',
      chips: ['What services do you offer?', 'Scope my project', 'Are you available?'] },
    { id: 'about', keys: ['who', 'about', 'yourself', 'arindam', 'background', 'introduce'],
      reply: 'Arindam Sarkar is a **Full-Stack Developer** from Kolkata, India, specialising in the **MERN stack**. He builds scalable, user-focused products — inquiry management systems, online platforms, dashboards and workflow tools — and has delivered **150+ projects**. He\'s always learning new tech and loves collaborating on ambitious ideas.',
      chips: ['What\'s your tech stack?', 'What services do you offer?'] },
    { id: 'services', keys: ['service', 'offer', 'provide', 'what do you do', 'what can you', 'help with', 'speciali'],
      reply: 'Here\'s what Arindam offers:\n- **Full-stack web development** — MERN & Next.js apps, APIs, databases, integrations\n- **AI integration** — chat assistants, smart search, content & workflow automation\n- **Web & UI/UX design** — responsive interfaces and design systems\n- **Dashboards & analytics** — admin panels and real-time reporting\n- **Graphics & branding** — logos, identity, marketing and social creatives\n- **Performance, cloud & CI/CD** — fast builds and reliable deployments',
      chips: ['Can you add AI to my website?', 'Scope my project', 'How do you work?'] },
    { id: 'stack', keys: ['stack', 'tech', 'technolog', 'skill', 'language', 'framework', 'react', 'node', 'next', 'mongo', 'mysql', 'tailwind', 'javascript', 'tools'],
      reply: 'Arindam\'s core stack:\n- **Frontend:** React.js, Next.js, TailwindCSS, Material-UI, JavaScript, Sass\n- **Backend:** Node.js, Express.js, REST APIs\n- **Database:** MongoDB, MySQL, Firebase\n- **Other:** role-based access management, CI/CD pipelines, cloud deployment and AI/LLM integration',
      chips: ['What services do you offer?', 'Show me your projects'] },
    { id: 'ai', keys: ['ai', 'artificial', 'chatbot', 'chat bot', 'gpt', 'llm', 'claude', 'machine learning', 'automation', 'automate', 'assistant'],
      reply: 'Yes — Arindam integrates AI into new and existing products:\n- **Customer-facing assistants** trained on your own content (like me!)\n- **Smart search & recommendations**\n- **Content generation** — product descriptions, emails, summaries\n- **Workflow automation** — triaging inquiries, drafting replies, extracting data\n\nAPI keys stay on a secure server-side proxy, never in the browser, with guardrails and cost limits built in.',
      chips: ['Scope my project', 'How can I contact you?'] },
    { id: 'contact', keys: ['contact', 'email', 'mail', 'phone', 'reach', 'call', 'whatsapp', 'number', 'talk'],
      reply: CONTACT, chips: ['Are you available?', 'Scope my project'] },
    { id: 'hire', keys: ['available', 'availability', 'hire', 'freelance', 'full-time', 'full time', 'job', 'open to', 'work with', 'collaborat'],
      reply: 'Arindam is **open to freelance projects and full-time opportunities**. Share a few details about what you need and he\'ll get back to you soon.\n\n' + CONTACT,
      chips: ['Scope my project', 'What\'s your tech stack?'] },
    { id: 'pricing', keys: ['price', 'pricing', 'cost', 'budget', 'rate', 'charge', 'quote', 'how much', 'fee'],
      reply: 'Pricing depends on scope, features and timeline, so Arindam quotes per project. The quickest way to a number: describe your idea in the **AI Project Scoper** (or just type it here) to get a scope, then send it over via the [contact form](#contact).',
      chips: ['Scope my project', 'How can I contact you?'] },
    { id: 'location', keys: ['where', 'location', 'based', 'kolkata', 'india', 'timezone', 'time zone', 'city', 'remote'],
      reply: 'Arindam is based in **Kolkata, India** (IST, UTC+5:30) and works with clients remotely.',
      chips: ['Are you available?', 'How can I contact you?'] },
    { id: 'projects', keys: ['project', 'portfolio', 'work', 'experience', 'built', 'example', 'case', 'github'],
      reply: 'Arindam has delivered **150+ projects**, including inquiry management systems, online platforms, dashboards and workflow tools. Some open work:\n- [Arindam\'s Assistance](https://arindamad.github.io/arindam-assitance/)\n- [Owl Generator](https://arindamad.github.io/owl-generator/)\n- [Select To List](https://github.com/arindamad/select-to-ul)\n- More on [GitHub](https://github.com/arindamad)',
      chips: ['What\'s your tech stack?', 'Scope my project'] },
    { id: 'process', keys: ['process', 'how do you work', 'approach', 'timeline', 'methodology', 'steps', 'how long'],
      reply: 'Arindam\'s process:\n- **Discover** — goals, users, constraints and a realistic scope\n- **Design** — wireframes, UI and data model, validated before coding\n- **Build** — iterative sprints with regular demos\n- **Launch & scale** — deploy, monitor and improve\n\nTimelines depend on scope — try the project scoper for a rough estimate.',
      chips: ['Scope my project', 'How can I contact you?'] },
    { id: 'design', keys: ['design', 'logo', 'graphic', 'branding', 'brand', 'ui', 'ux', 'figma', 'illustration'],
      reply: 'On the design side Arindam covers **UI/UX** (responsive interfaces, user flows, design systems) and **graphics & branding** (logos, identity, marketing materials, social media creatives, illustrations). Check his work on [Dribbble](https://dribbble.com/arindamad).',
      chips: ['What services do you offer?', 'Scope my project'] },
    { id: 'dashboard', keys: ['dashboard', 'analytics', 'report', 'admin panel', 'kpi', 'metrics', 'chart'],
      reply: 'Dashboards are a specialty: **real-time KPIs, filters, exports and role-based views** built with React/Next.js on top of Node APIs and MongoDB/MySQL. Describe what you want to track and I\'ll scope it.',
      chips: ['Scope my project', 'How can I contact you?'] },
    { id: 'social', keys: ['linkedin', 'twitter', 'social', 'facebook', 'dribbble', 'stackoverflow', 'stack overflow', 'blog'],
      reply: 'Find Arindam online:\n- [LinkedIn](https://www.linkedin.com/in/arindamad/)\n- [GitHub](https://github.com/arindamad)\n- [Stack Overflow](https://stackoverflow.com/users/9540251/arindam-sarkar)\n- [Dribbble](https://dribbble.com/arindamad)\n- [Blog](http://arindamas.blogspot.com/)',
      chips: ['How can I contact you?'] },
    { id: 'resume', keys: ['resume', 'cv', 'profile', 'linkedin profile'],
      reply: 'Here\'s Arindam\'s [full profile](https://docs.google.com/document/d/1LZ10LSy1YqLwi0oKsrqppoxhUGPe__dYb4YWwp_0CDk/edit?usp=sharing).',
      chips: ['What\'s your tech stack?', 'Are you available?'] },
    { id: 'thanks', keys: ['thank', 'thanks', 'great', 'awesome', 'cool', 'nice'],
      reply: 'Happy to help! 🙌 Anything else you\'d like to know?',
      chips: ['Scope my project', 'How can I contact you?'] }
  ];

  var DEFAULT_CHIPS = ['What services do you offer?', 'What\'s your tech stack?', 'Scope my project', 'How can I contact you?'];

  /* ---------------- Project scoper (rule-based) ---------------- */
  var FEATURES = [
    { re: /shop|store|e-?commerce|sell|cart|checkout|product|catalog/, name: 'E-commerce', module: 'Product catalog, cart, checkout & order management', stack: 'Next.js storefront (SEO-friendly, fast)' },
    { re: /payment|pay\b|subscription|billing|razorpay|stripe|invoice/, name: 'Payments', module: 'Secure payments & billing (Razorpay / Stripe)', stack: 'Payment gateway + webhooks' },
    { re: /dashboard|analytic|report|admin|kpi|metric|insight/, name: 'Dashboard', module: 'Admin dashboard with KPIs, filters & exports', stack: 'Charting library + aggregated API endpoints' },
    { re: /\bai\b|chatbot|chat bot|assistant|gpt|llm|automat|smart|recommend/, name: 'AI', module: 'AI assistant / automation on your own content', stack: 'LLM API via a secure serverless proxy' },
    { re: /inquir|enquir|lead|crm|customer|ticket|support|helpdesk/, name: 'CRM', module: 'Inquiry / lead management with assignment & tracking', stack: 'Email/SMS notification hooks' },
    { re: /book|appointment|schedul|reservation|calendar|slot/, name: 'Booking', module: 'Booking & scheduling with reminders', stack: 'Calendar sync + reminder jobs' },
    { re: /login|sign ?up|account|role|permission|user|member|staff|team/, name: 'Auth & roles', module: 'Authentication with role-based access control', stack: 'JWT auth + RBAC middleware' },
    { re: /blog|cms|content|landing|portfolio|marketing|website|seo/, name: 'Content', module: 'Marketing pages / CMS-driven content', stack: 'Headless CMS or MDX content' },
    { re: /real-?time|live|notification|messag|socket/, name: 'Realtime', module: 'Real-time updates & notifications', stack: 'WebSockets (Socket.IO) or Firebase' },
    { re: /mobile|android|ios|\bapp\b|pwa/, name: 'Mobile', module: 'Mobile-first responsive UI / installable PWA', stack: 'PWA (offline support, install prompt)' },
    { re: /workflow|approval|process|task|kanban|pipeline/, name: 'Workflow', module: 'Multi-step workflows & approvals with audit trail', stack: 'State machine + audit log collection' }
  ];

  function scopeProject(text) {
    var t = text.toLowerCase();
    var found = FEATURES.filter(function (f) { return f.re.test(t); });
    var n = found.length;
    var tier = n <= 2 ? ['Starter', '2–4 weeks'] : n <= 4 ? ['Growth', '4–8 weeks'] : ['Advanced', '8–12+ weeks'];
    var services = ['Full-stack web development', 'Web & UI/UX design'];
    if (found.some(function (f) { return f.name === 'AI'; })) services.push('AI integration');
    if (found.some(function (f) { return f.name === 'Dashboard'; })) services.push('Dashboards & analytics');
    services.push('Cloud deployment & CI/CD');

    var out = '### Project snapshot\n';
    out += '- **Complexity:** ' + tier[0] + ' · rough timeline ' + tier[1] + '\n';
    out += '- **Detected needs:** ' + (n ? found.map(function (f) { return f.name; }).join(', ') : 'custom web application') + '\n';
    out += '### Core modules\n';
    out += (n ? found : [{ module: 'Responsive web app with clean UI' }, { module: 'REST API & database' }]).map(function (f) { return '- ' + f.module; }).join('\n') + '\n';
    out += '### Suggested stack\n';
    out += '- **Frontend:** React / Next.js + TailwindCSS\n- **Backend:** Node.js + Express REST API\n- **Database:** ' + (/(order|payment|invoice|booking|relation)/.test(t) ? 'MySQL for transactional data (MongoDB works too)' : 'MongoDB') + '\n';
    found.forEach(function (f) { out += '- ' + f.stack + '\n'; });
    out += '### Recommended services\n' + services.map(function (s) { return '- ' + s; }).join('\n') + '\n';
    out += '### Roadmap\n- **Week 1:** discovery, wireframes & data model\n- **Build sprints:** core modules with weekly demos\n- **Launch:** QA, deployment, analytics & handover\n\n';
    out += '_This is a rough estimate — Arindam confirms scope and timeline after a quick call._ Ready to start? [Send these details](#contact) or email **[arindamsarkar196@gmail.com](mailto:arindamsarkar196@gmail.com)**.';
    return out;
  }

  function looksLikeProject(t) {
    return /scope|i need|we need|i want|we want|looking for|build (me|a|an|my)|develop (a|an|my)|make (a|an|me)|create (a|an)|idea/.test(t) && t.length > 25;
  }

  function localReply(text) {
    var t = ' ' + text.toLowerCase().replace(/[^\w\s'-]/g, ' ') + ' ';
    if (/^\s*scope my project\s*$/.test(t)) {
      return { text: 'Sure! Describe your project in a sentence or two — what it does, who uses it, and any must-have features (payments, dashboard, AI, logins…). I\'ll draft a scope.', chips: ['An online store with payments and an admin dashboard', 'A booking app for my clinic with reminders'] };
    }
    if (looksLikeProject(t) || /^\s*scope:/.test(text.toLowerCase())) {
      return { text: scopeProject(text), chips: ['How can I contact you?', 'Can you add AI to my website?'] };
    }
    var best = null, bestScore = 0;
    INTENTS.forEach(function (intent) {
      var score = 0;
      intent.keys.forEach(function (k) {
        // short keys must be whole words ("hi" should not match "his"); longer keys may be prefixes ("technolog")
        var re = new RegExp('\\s' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + (k.length <= 3 ? '(?=\\s)' : ''));
        if (re.test(t)) score += k.length > 3 ? 2 : 1;
      });
      if (score > bestScore) { bestScore = score; best = intent; }
    });
    if (best) return { text: best.reply, chips: best.chips };
    return {
      text: 'I\'m not sure about that one — I know Arindam\'s **services, skills, projects, process and availability**. Or describe a project idea and I\'ll scope it. For anything else, ' + CONTACT.charAt(0).toLowerCase() + CONTACT.slice(1),
      chips: DEFAULT_CHIPS
    };
  }

  /* ---------------- Remote (Claude via proxy) ---------------- */
  function remoteReply() {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 30000);
    return fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-12) }),
      signal: ctrl.signal
    }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      if (!data || typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('empty reply');
      return { text: data.reply, chips: null };
    });
  }

  /* ---------------- Rendering ---------------- */
  function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function safeHref(u) { return /^(https?:|mailto:|tel:|#)/i.test(u) ? u : '#'; }
  function inline(s) {
    return s
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, txt, url) {
        var href = safeHref(url.replace(/&amp;/g, '&'));
        var ext = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '';
        return '<a href="' + esc(href) + '"' + ext + '>' + txt + '</a>';
      })
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|\s)_([^_]+)_(?=\s|$|[.,!?])/g, '$1<em>$2</em>');
  }
  function md(src) {
    var lines = esc(src).split('\n'), html = '', inList = false;
    lines.forEach(function (line) {
      var li = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)/);
      if (li) { if (!inList) { html += '<ul>'; inList = true; } html += '<li>' + inline(li[1]) + '</li>'; return; }
      if (inList) { html += '</ul>'; inList = false; }
      var h = line.match(/^#{1,4}\s+(.*)/);
      if (h) { html += '<h5>' + inline(h[1]) + '</h5>'; return; }
      if (line.trim() === '') { html += '<br>'; return; }
      html += inline(line) + '<br>';
    });
    if (inList) html += '</ul>';
    return html.replace(/(<br>)+$/, '').replace(/<br>(<ul>|<h5>)/g, '$1');
  }

  function scrollBottom() { body.scrollTop = body.scrollHeight; }

  function addMsg(role, html) {
    var el = document.createElement('div');
    el.className = 'msg msg--' + role;
    el.innerHTML = html;
    body.appendChild(el);
    if (hasGSAP) gsap.from(el, { y: 14, scale: 0.96, autoAlpha: 0, duration: 0.45, ease: 'back.out(1.6)', transformOrigin: role === 'user' ? '100% 100%' : '0% 100%' });
    scrollBottom();
    return el;
  }

  function typeOut(el, text) {
    return new Promise(function (resolve) {
      if (!hasGSAP) { el.innerHTML = md(text); scrollBottom(); return resolve(); }
      var state = { n: 0 };
      gsap.to(state, {
        n: text.length, duration: Math.min(2.4, 0.4 + text.length / 260), ease: 'none',
        onUpdate: function () { el.innerHTML = md(text.slice(0, Math.round(state.n))); scrollBottom(); },
        onComplete: function () { el.innerHTML = md(text); scrollBottom(); resolve(); }
      });
    });
  }

  function setChips(list) {
    chipsEl.innerHTML = '';
    (list || DEFAULT_CHIPS).forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = c;
      b.addEventListener('click', function () { send(c); });
      chipsEl.appendChild(b);
    });
    if (hasGSAP) gsap.from(chipsEl.children, { y: 10, autoAlpha: 0, stagger: 0.05, duration: 0.35 });
  }

  /* ---------------- Conversation ---------------- */
  function send(text) {
    text = (text || '').trim().slice(0, 600);
    if (!text || busy) return;
    busy = true;
    addMsg('user', esc(text));
    history.push({ role: 'user', content: text });
    input.value = '';
    chipsEl.innerHTML = '';
    var bot = addMsg('bot', '<span class="typing"><i></i><i></i><i></i></span>');

    var minDelay = new Promise(function (r) { setTimeout(r, 550); });
    var answer = AI_ENDPOINT
      ? remoteReply().catch(function () { return localReply(text); })
      : Promise.resolve(localReply(text));

    Promise.all([answer, minDelay]).then(function (res) {
      var reply = res[0];
      history.push({ role: 'assistant', content: reply.text });
      return typeOut(bot, reply.text).then(function () { setChips(reply.chips); });
    }).finally(function () { busy = false; });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });

  /* ---------------- Open / close ---------------- */
  function openChat(prefill) {
    if (!chat.classList.contains('is-open')) {
      chat.classList.add('is-open');
      chat.setAttribute('aria-hidden', 'false');
      document.body.classList.add('chat-open');
      if (hasGSAP) gsap.fromTo(chat, { autoAlpha: 0, scale: 0.6, y: 40, rotate: 4 }, { autoAlpha: 1, scale: 1, y: 0, rotate: 0, duration: 0.7, ease: 'expo.out' });
      else { chat.style.visibility = 'visible'; chat.style.opacity = 1; }
      if (!greeted) {
        greeted = true;
        var hello = addMsg('bot', '');
        typeOut(hello, 'Hi! I\'m **Arindam\'s AI assistant** ✦\nAsk me about his services, stack or availability — or describe your project and I\'ll draft a scope.').then(function () {
          if (!prefill) setChips(DEFAULT_CHIPS);
        });
      }
    }
    if (prefill) setTimeout(function () { send(prefill); }, greeted && body.children.length > 1 ? 0 : 900);
    else setTimeout(function () { input.focus({ preventScroll: true }); }, 300);
  }
  function closeChat() {
    chat.classList.remove('is-open');
    chat.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('chat-open');
    if (hasGSAP) gsap.to(chat, { autoAlpha: 0, scale: 0.85, y: 30, duration: 0.35, ease: 'power3.in' });
    else { chat.style.visibility = 'hidden'; chat.style.opacity = 0; }
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open-ai]');
    if (opener) { e.preventDefault(); openChat(); return; }
    var ask = e.target.closest('[data-ask]');
    if (ask) { openChat(ask.dataset.ask); return; }
    if (e.target.closest('.chat a[href^="#"]')) closeChat();
  });
  $('.chat__close').addEventListener('click', closeChat);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && chat.classList.contains('is-open')) closeChat(); });

  var scoper = $('#scoper');
  scoper.addEventListener('submit', function (e) {
    e.preventDefault();
    var idea = $('#scoper-input').value.trim();
    if (!idea) return;
    openChat('Scope: ' + idea);
    $('#scoper-input').value = '';
  });
})();
