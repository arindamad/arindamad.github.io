/* =========================================================
   Arindam Sarkar — portfolio interactions
   GSAP + ScrollTrigger + SplitText + ScrambleText, Lenis smooth scroll.
   Falls back to a static (fully visible) page when GSAP is
   unavailable or the visitor prefers reduced motion.
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  // no 'js' class = crawler (see <head>): render the static, fully visible page
  var animate = hasGSAP && !reduceMotion && document.documentElement.classList.contains('js');
  var lenis = null;

  $('#year').textContent = new Date().getFullYear();

  /* ---------------- Static fallback ---------------- */
  function showEverything() {
    $$('[data-reveal],[data-hero],.hero__name,.section__title').forEach(function (el) { el.style.visibility = 'visible'; });
    var pre = $('.preloader'); if (pre) pre.remove();
    $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; });
    $$('.ring').forEach(function (ring) { setRing(ring, 1); });
    $$('.meter').forEach(function (m) { m.style.setProperty('--fill', 1); });
    var typer = $('.typer'); if (typer) typer.textContent = JSON.parse(typer.dataset.words)[0];
  }

  /* ---------------- Skill rings ---------------- */
  var RING_C = 2 * Math.PI * 52;
  function setRing(ring, progress) {
    var pct = +ring.dataset.pct;
    var fg = $('.ring__fg', ring);
    fg.style.strokeDasharray = RING_C;
    fg.style.strokeDashoffset = RING_C * (1 - (pct / 100) * progress);
    $('.ring__val', ring).textContent = Math.round(pct * progress);
  }
  $$('.ring').forEach(function (ring) { setRing(ring, 0); });

  /* ---------------- Smooth anchor scrolling ---------------- */
  function scrollToTarget(hash) {
    var target = hash === '#home' || hash === '#top' ? 0 : $(hash);
    if (target === null) return;
    if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(a.getAttribute('href'));
  });

  /* ---------------- Mobile menu ---------------- */
  var nav = $('.nav');
  var burger = $('.nav__burger');
  function closeMenu() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    if (open && animate) gsap.from('.nav__links a', { y: 16, autoAlpha: 0, stagger: 0.05, duration: 0.5, ease: 'power3.out' });
  });

  /* ---------------- Hero particle network (canvas) ---------------- */
  (function particles() {
    var canvas = $('.hero__canvas');
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pts = [], w = 0, h = 0, running = true;
    var mouse = { x: -9999, y: -9999 };
    var colors = ['124,92,255', '34,211,238', '244,114,182'];

    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(90, Math.floor((w * h) / 16000));
      pts = [];
      for (var i = 0; i < count; i++) {
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.6 + 0.6, c: colors[i % 3] });
      }
    }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 180) { p.vx -= dx / d * 0.02; p.vy -= dy / d * 0.02; }
        p.vx *= 0.99; p.vy *= 0.99;
        p.vx += (Math.random() - 0.5) * 0.01; p.vy += (Math.random() - 0.5) * 0.01;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], ex = p.x - q.x, ey = p.y - q.y, e = ex * ex + ey * ey;
          if (e < 16900) {
            ctx.strokeStyle = 'rgba(' + p.c + ',' + (0.18 * (1 - e / 16900)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(' + p.c + ',.85)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener('resize', resize);
    canvas.parentElement.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (vis && !running) { running = true; requestAnimationFrame(frame); }
      running = vis;
    }).observe(canvas);
    requestAnimationFrame(frame);
  })();

  /* ---------------- Solutions tabs (works with or without GSAP) ---------------- */
  var solTabs = $$('.sol-tab');
  var solPanels = $$('.sol-panel');
  var solIndex = 0;
  var solAutoplay = null;

  function animatePanelIn(panel) {
    if (!animate) return;
    if (panel._tl) panel._tl.progress(1).kill(); // finish any interrupted run so .from() end-states stay correct
    var copy = $$('.sol-copy > *', panel);
    var tl = gsap.timeline();
    tl.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      .from(copy, { y: 30, autoAlpha: 0, stagger: 0.07, duration: 0.7, ease: 'power3.out' }, 0)
      .from($('.mock', panel), { y: 40, rotateX: -12, autoAlpha: 0, transformPerspective: 800, duration: 0.8, ease: 'expo.out' }, 0.1);
    var kind = $('.mock', panel).className;
    if (kind.indexOf('kanban') > -1) {
      tl.from($$('.tk', panel), { scale: 0.6, autoAlpha: 0, stagger: 0.08, duration: 0.5, ease: 'back.out(2)' }, 0.3)
        .fromTo($('.tk--move', panel), { x: 0 }, { x: -12, yoyo: true, repeat: 3, duration: 0.4, ease: 'sine.inOut' }, 0.9);
    } else if (kind.indexOf('dash') > -1) {
      tl.from($$('.kpis span', panel), { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, 0.3)
        .from($$('.bars i', panel), { scaleY: 0, stagger: 0.06, duration: 0.9, ease: 'elastic.out(1,0.6)' }, 0.4);
    } else if (kind.indexOf('flow') > -1) {
      var path = $('.flow-line', panel);
      tl.from($$('.node', panel), { scale: 0, autoAlpha: 0, stagger: 0.15, duration: 0.5, ease: 'back.out(2.5)' }, 0.3)
        .fromTo(path, { strokeDashoffset: 300 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 0.3);
    } else if (kind.indexOf('chat') > -1) {
      tl.from($$('.bub', panel), { y: 20, scale: 0.9, autoAlpha: 0, stagger: 0.35, duration: 0.5, ease: 'back.out(1.8)' }, 0.3);
    }
    panel._tl = tl;
  }

  function setSolution(i, fromUser) {
    if (i === solIndex && !fromUser) return;
    var prev = solPanels[solIndex];
    solIndex = i;
    solTabs.forEach(function (t, k) {
      t.classList.toggle('is-active', k === i);
      t.setAttribute('aria-selected', String(k === i));
      if (animate) gsap.set($('.sol-tab__bar i', t), { scaleX: 0 });
    });
    solPanels.forEach(function (p, k) { p.classList.toggle('is-active', k === i); });
    if (animate && prev && prev !== solPanels[i]) gsap.fromTo(prev, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25, clearProps: 'visibility' });
    animatePanelIn(solPanels[i]);
    if (solAutoplay) solAutoplay.restart(i);
  }
  solTabs.forEach(function (t, k) { t.addEventListener('click', function () { setSolution(k, true); }); });

  if (!animate) { showEverything(); return; }

  /* =========================================================
     GSAP animation layer
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);
  var hasSplit = typeof window.SplitText !== 'undefined';
  var hasScramble = typeof window.ScrambleTextPlugin !== 'undefined';
  if (hasSplit) gsap.registerPlugin(SplitText);
  if (hasScramble) gsap.registerPlugin(ScrambleTextPlugin);
  gsap.defaults({ ease: 'power3.out' });

  /* ---- Lenis smooth scroll synced with ScrollTrigger ---- */
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.portfolioLenis = lenis;
  }

  /* ---- Preloader -> hero intro ---- */
  var counter = { v: 0 };
  var preTl = gsap.timeline({ onComplete: heroIntro });
  if (lenis) lenis.stop();
  preTl
    .to(counter, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: function () { $('.preloader__num').textContent = Math.round(counter.v); } })
    .to('.preloader__bar i', { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0)
    .to('.preloader__inner', { y: -40, autoAlpha: 0, duration: 0.5, ease: 'power2.in' })
    .to('.preloader__panel.p1', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '-=0.1')
    .to('.preloader__panel.p2', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, '<')
    .set('.preloader', { display: 'none' });

  function gradientChars(chars) {
    var n = chars.length;
    chars.forEach(function (c, i) {
      c.style.backgroundImage = 'var(--grad)';
      c.style.backgroundSize = (n * 100) + '% 100%';
      c.style.backgroundPosition = (n > 1 ? (i / (n - 1)) * 100 : 0) + '% 0';
      c.style.webkitBackgroundClip = 'text';
      c.style.backgroundClip = 'text';
      c.style.color = 'transparent';
    });
  }

  function heroIntro() {
    if (lenis) lenis.start();
    var names = $$('.hero__name');
    var chars = [];
    names.forEach(function (el) {
      el.style.visibility = 'visible';
      if (hasSplit) {
        var split = SplitText.create(el, { type: 'chars', charsClass: 'char' });
        if (el.classList.contains('gradient-text')) { el.style.animation = 'none'; gradientChars(split.chars); }
        chars = chars.concat(split.chars);
      } else chars.push(el);
    });

    var tl = gsap.timeline();
    tl.from(chars, { yPercent: 120, rotate: 14, autoAlpha: 0, stagger: 0.035, duration: 1.2, ease: 'expo.out' })
      .fromTo('[data-hero]:not(.hero__visual)', { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 1 }, 0.25)
      .fromTo('.hero__visual', { autoAlpha: 0, scale: 0.7, rotate: -12, clipPath: 'circle(0% at 50% 50%)' },
        { autoAlpha: 1, scale: 1, rotate: 0, clipPath: 'circle(75% at 50% 50%)', duration: 1.6, ease: 'expo.out', clearProps: 'clipPath' }, 0.1)
      .from('.chip', { scale: 0, autoAlpha: 0, stagger: 0.12, duration: 0.7, ease: 'back.out(2.2)' }, 0.8)
      .from('.code-card', { x: 60, y: 30, rotate: 6, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.9)
      .add(countUp, 0.7)
      .add(startTyper, 0.6);

    // Floating chips and drifting aurora blobs
    $$('.chip').forEach(function (chip, i) {
      gsap.to(chip, { y: i % 2 ? 14 : -14, x: i % 2 ? -6 : 6, duration: 2.4 + i * 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.5 });
    });
    $$('.aurora__blob').forEach(function (b, i) {
      gsap.to(b, { xPercent: gsap.utils.random(-25, 25), yPercent: gsap.utils.random(-20, 20), scale: gsap.utils.random(0.85, 1.2), duration: 9 + i * 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    });
    gsap.to('.code-card', { y: -10, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });
  }

  function countUp() {
    $$('[data-count]').forEach(function (el) {
      var o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 2, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
    });
  }

  function startTyper() {
    var el = $('.typer');
    var words = JSON.parse(el.dataset.words);
    if (!hasScramble) { el.textContent = words[0]; return; }
    var tl = gsap.timeline({ repeat: -1 });
    words.forEach(function (w) {
      tl.to(el, { duration: 1.1, scrambleText: { text: w, chars: '01<>/{}*#$', revealDelay: 0.3, speed: 0.6 }, ease: 'none' })
        .to({}, { duration: 2 });
    });
  }

  /* ---- Hero scroll parallax ---- */
  var heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero__text', { yPercent: -18, autoAlpha: 0.15, ease: 'none', scrollTrigger: heroST });
  gsap.to('.hero__visual', { yPercent: 22, ease: 'none', scrollTrigger: heroST });
  gsap.to('.orbit', { rotate: 18, scale: 1.08, ease: 'none', scrollTrigger: heroST });
  gsap.to('.aurora', { yPercent: 30, ease: 'none', scrollTrigger: heroST });
  gsap.to('.scroll-cue', { autoAlpha: 0, scrollTrigger: { trigger: '.hero', start: 'top top', end: '15% top', scrub: true } });

  /* ---- Avatar 3D tilt + shine ---- */
  (function avatarTilt() {
    var vis = $('.hero__visual'), av = $('.avatar');
    if (!finePointer) return;
    gsap.set(av, { transformPerspective: 900 });
    var rx = gsap.quickTo(av, 'rotationX', { duration: 0.8, ease: 'power3' });
    var ry = gsap.quickTo(av, 'rotationY', { duration: 0.8, ease: 'power3' });
    vis.addEventListener('pointermove', function (e) {
      var r = vis.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 20); rx(-(py - 0.5) * 20);
      av.style.setProperty('--sx', px * 100 + '%'); av.style.setProperty('--sy', py * 100 + '%');
    });
    vis.addEventListener('pointerleave', function () { rx(0); ry(0); });
  })();

  /* ---- Scroll progress + nav state ---- */
  gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  ScrollTrigger.create({
    start: 'top -60', end: 'max',
    onToggle: function (self) { nav.classList.toggle('is-scrolled', self.isActive); },
    onUpdate: function (self) {
      var hide = self.direction === 1 && self.scroll() > 500 && !nav.classList.contains('is-open');
      gsap.to(nav, { yPercent: hide ? -160 : 0, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
    }
  });
  $$('.nav__links a').forEach(function (a) {
    var sec = $(a.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 45%', end: 'bottom 45%',
      onToggle: function (self) { if (self.isActive) { $$('.nav__links a').forEach(function (x) { x.classList.remove('is-active'); }); a.classList.add('is-active'); } else a.classList.remove('is-active'); }
    });
  });

  /* ---- Section titles: masked word reveal ---- */
  $$('.section__title').forEach(function (title) {
    title.style.visibility = 'visible';
    if (!hasSplit) {
      gsap.from(title, { y: 50, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: title, start: 'top 85%' } });
      return;
    }
    SplitText.create(title, {
      type: 'words', mask: 'words', wordsClass: 'word', autoSplit: true,
      onSplit: function (self) {
        $$('.gradient-text', title).forEach(function (g) { g.style.animation = 'none'; gradientChars($$('.word', g)); });
        return gsap.from(self.words, { yPercent: 110, rotate: 4, duration: 1.1, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: title, start: 'top 85%' } });
      }
    });
  });

  /* ---- Generic reveals ---- */
  var generic = $$('[data-reveal]').filter(function (el) { return !el.matches('.section__title, .card, .ring'); });
  gsap.set(generic, { autoAlpha: 0, y: function (i, el) { return el.dataset.reveal === 'scale' ? 0 : 50; }, scale: function (i, el) { return el.dataset.reveal === 'scale' ? 0.92 : 1; } });
  ScrollTrigger.batch(generic, {
    start: 'top 88%', once: true,
    onEnter: function (batch) { gsap.to(batch, { autoAlpha: 1, y: 0, scale: 1, stagger: 0.1, duration: 1.1, ease: 'expo.out' }); }
  });

  /* ---- Bento cards: 3D flip-in + inner art ---- */
  var cards = $$('.bento .card');
  gsap.set(cards, { autoAlpha: 0, y: 90, rotationX: -18, transformPerspective: 1000, transformOrigin: '50% 0%' });
  ScrollTrigger.batch(cards, {
    start: 'top 90%', once: true,
    onEnter: function (batch) {
      gsap.to(batch, { autoAlpha: 1, y: 0, rotationX: 0, stagger: 0.12, duration: 1.3, ease: 'expo.out' });
      batch.forEach(function (card) {
        var lines = $$('.card__art--code span', card);
        if (lines.length) gsap.from(lines, { scaleX: 0, stagger: 0.08, duration: 0.9, delay: 0.4, ease: 'expo.out' });
        var meter = $('.meter', card);
        if (meter) setTimeout(function () { meter.style.setProperty('--fill', 1); }, 400);
      });
    }
  });
  gsap.to('.ai-orb span:nth-child(2)', { scale: 1.15, autoAlpha: 0.3, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.ai-orb span:nth-child(3)', { rotate: 360, duration: 18, repeat: -1, ease: 'none' });
  gsap.to('.ai-orb span:nth-child(1)', { scale: 0.92, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  /* ---- Tilt + spotlight on cards ---- */
  if (finePointer) {
    $$('.tilt').forEach(function (el) {
      if (el.classList.contains('avatar')) return;
      var max = +(el.dataset.tilt || 6);
      var rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
      var ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        gsap.set(el, { transformPerspective: 1000 });
        ry((px - 0.5) * max * 2); rx(-(py - 0.5) * max * 2);
      });
      el.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });
  }
  $$('.spotlight').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px');
      el.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });

  /* ---- Magnetic buttons + cursor glow ---- */
  if (finePointer) {
    $$('.magnetic').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' });
      });
    });
    var glow = $('.cursor-glow');
    var gx = gsap.quickTo(glow, 'x', { duration: 0.9, ease: 'power3' });
    var gy = gsap.quickTo(glow, 'y', { duration: 0.9, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { gx(e.clientX); gy(e.clientY); });
  }

  /* ---- Marquee: infinite loop that speeds up and skews with scroll velocity ---- */
  var loops = $$('.marquee__track').map(function (track, i) {
    track.innerHTML += track.innerHTML; // duplicate so -50% loops seamlessly
    var rev = i % 2 === 1;
    return gsap.fromTo(track, { xPercent: rev ? -50 : 0 }, { xPercent: rev ? 0 : -50, duration: rev ? 40 : 34, ease: 'none', repeat: -1 });
  });
  var skewTo = gsap.quickTo('.marquee__track', 'skewX', { duration: 0.5, ease: 'power3' });
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: function (self) {
      var v = self.getVelocity();
      var boost = gsap.utils.clamp(1, 6, 1 + Math.abs(v) / 400);
      loops.forEach(function (t) {
        gsap.to(t, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: function () { gsap.to(t, { timeScale: 1, duration: 1.2 }); } });
      });
      skewTo(gsap.utils.clamp(-12, 12, v / -250));
      clearTimeout(self._skewReset);
      self._skewReset = setTimeout(function () { skewTo(0); }, 120);
    }
  });

  /* ---- Solutions autoplay ---- */
  solPanels.forEach(function (p, k) { if (k !== solIndex) gsap.set(p, { autoAlpha: 0 }); });
  solAutoplay = (function () {
    var tween = null, paused = false, inView = false;
    function run(i) {
      if (tween) tween.kill();
      tween = gsap.fromTo($('.sol-tab__bar i', solTabs[i]), { scaleX: 0 }, {
        scaleX: 1, duration: 6, ease: 'none', paused: paused || !inView,
        onComplete: function () { setSolution((solIndex + 1) % solTabs.length); }
      });
    }
    var stage = $('.solutions');
    stage.addEventListener('pointerenter', function () { paused = true; if (tween) tween.pause(); });
    stage.addEventListener('pointerleave', function () { paused = false; if (tween && inView) tween.play(); });
    ScrollTrigger.create({
      trigger: stage, start: 'top 75%', end: 'bottom 20%',
      onToggle: function (self) {
        inView = self.isActive;
        if (!tween) { run(solIndex); animatePanelIn(solPanels[solIndex]); }
        if (inView && !paused) tween.play(); else tween.pause();
      }
    });
    return { restart: function (i) { run(i); } };
  })();

  /* ---- Process line draws with scroll, steps light up ---- */
  var steps = $$('.step');
  gsap.to('.process__line span', {
    scaleX: 1, ease: 'none',
    scrollTrigger: {
      trigger: '.process', start: 'top 75%', end: 'bottom 55%', scrub: 0.6,
      onUpdate: function (self) {
        steps.forEach(function (s, i) { s.classList.toggle('is-lit', self.progress >= (i / (steps.length - 1)) * 0.97); });
      }
    }
  });

  /* ---- About mini cards drift ---- */
  gsap.to('.about__grid .mini:nth-child(odd)', { y: -30, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.about__grid .mini:nth-child(even)', { y: 30, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---- Skill rings ---- */
  var rings = $$('.ring');
  gsap.set(rings, { autoAlpha: 0, y: 60, scale: 0.85 });
  ScrollTrigger.batch(rings, {
    start: 'top 88%', once: true,
    onEnter: function (batch) {
      gsap.to(batch, { autoAlpha: 1, y: 0, scale: 1, stagger: 0.08, duration: 1, ease: 'back.out(1.6)' });
      batch.forEach(function (ring, i) {
        var o = { p: 0 };
        gsap.to(o, { p: 1, duration: 1.8, delay: 0.2 + i * 0.08, ease: 'power3.inOut', onUpdate: function () { setRing(ring, o.p); } });
      });
    }
  });

  /* ---- AI section: glow follows pointer ---- */
  (function aiGlow() {
    var sec = $('.ai-section'), glowEl = $('.ai-section__glow');
    if (!finePointer) return;
    var x = gsap.quickTo(glowEl, 'x', { duration: 1.2, ease: 'power3' });
    var y = gsap.quickTo(glowEl, 'y', { duration: 1.2, ease: 'power3' });
    sec.addEventListener('pointermove', function (e) {
      var r = sec.getBoundingClientRect();
      x(e.clientX - r.left - r.width / 2); y(e.clientY - r.top - r.height / 2);
    });
  })();
  gsap.from('.prompt-chips button', { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.7, scrollTrigger: { trigger: '.prompt-chips', start: 'top 90%' } });

  /* ---- CTA zoom-in ---- */
  gsap.fromTo('.cta__box', { scale: 0.86, borderRadius: 80 }, { scale: 1, borderRadius: 32, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'center center', scrub: true } });

  /* ---- Footer ---- */
  gsap.from('.footer__grid > *', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 1, scrollTrigger: { trigger: '.footer', start: 'top 92%' } });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
