/* =========================================================
   Space layer
   - Starfield: parallax stars that streak with scroll speed, plus shooting stars
   - Mission rail: a rocket travels from "Launch" (hero) to "Landing" (contact)
     as you scroll; each stop is a section link
   - Tech universe: the real stack orbiting in layers (frontend, backend, data, AI)
   - AI UFO: hovers over the project scoper and opens the assistant
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animate = !reduceMotion && typeof window.gsap !== 'undefined' && document.documentElement.classList.contains('js');
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------------- Starfield ---------------- */
  (function starfield() {
    var canvas = $('.space__stars');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, stars = [], shooters = [], nextShot = 0;
    var lastY = window.scrollY, vel = 0, mx = 0, tmx = 0, my = 0, tmy = 0;

    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(420, Math.floor((w * h) / 3600));
      stars = [];
      for (var i = 0; i < count; i++) {
        var r = Math.random();
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          z: Math.pow(Math.random(), 1.8) * 0.9 + 0.1, // depth: far stars are small, dim and slow
          phase: Math.random() * Math.PI * 2, speed: 0.4 + Math.random() * 1.8,
          tint: r < 0.1 ? '196,181,253' : r < 0.2 ? '165,243,252' : '255,255,255'
        });
      }
      if (reduceMotion) draw(0);
    }

    function draw(t) {
      var y = window.scrollY;
      vel += (y - lastY - vel) * 0.25;
      lastY = y;
      mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var py = (((s.y - y * s.z * 0.3 + my * s.z * 24) % h) + h) % h;
        var px = s.x + mx * s.z * 30;
        var tw = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(t * 0.001 * s.speed + s.phase);
        var a = (0.25 + 0.75 * s.z) * tw;
        var r = s.z * 1.6 + 0.25;
        // While scrolling, a short faint tail (max 0.2 opacity) trails each star — a subtle hint of motion.
        var streak = Math.min(14, Math.abs(vel) * s.z * 0.45);
        if (streak > 1.5) {
          ctx.strokeStyle = 'rgba(' + s.tint + ',' + Math.min(a, 0.2).toFixed(3) + ')';
          ctx.lineWidth = r;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + (vel > 0 ? streak : -streak)); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(' + s.tint + ',' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      }

      if (!reduceMotion) {
        if (t > nextShot) {
          shooters.push({ x: w * (0.3 + Math.random() * 0.8), y: h * Math.random() * 0.45, vx: -(7 + Math.random() * 6), vy: 2.5 + Math.random() * 3, life: 0, max: 50 + Math.random() * 40 });
          nextShot = t + 2800 + Math.random() * 5200;
        }
        for (var k = shooters.length - 1; k >= 0; k--) {
          var m = shooters[k];
          m.x += m.vx; m.y += m.vy; m.life++;
          var fade = 1 - m.life / m.max;
          var g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14);
          g.addColorStop(0, 'rgba(255,255,255,' + fade.toFixed(3) + ')');
          g.addColorStop(1, 'rgba(124,92,255,0)');
          ctx.strokeStyle = g; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14); ctx.stroke();
          if (m.life >= m.max) shooters.splice(k, 1);
        }
        requestAnimationFrame(draw);
      }
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (e) { tmx = e.clientX / w - 0.5; tmy = e.clientY / h - 0.5; });
    if (!reduceMotion) requestAnimationFrame(draw);
  })();

  /* ---------------- Mission rail ---------------- */
  (function missionRail() {
    var rail = $('.mission');
    if (!rail) return;
    var stops = $$('.mission__stop', rail);
    var sections = stops.map(function (a) { return $(a.getAttribute('href')); });
    var rocket = $('.mission__rocket', rail), fill = $('.mission__fill', rail), flame = $('.rocket__flame', rail);
    var tops = [], stopY = [], lastY = window.scrollY, heading = 180;
    var setY, setRot;
    if (animate) {
      gsap.set(rocket, { yPercent: -50, rotation: 180 });
      setY = gsap.quickTo(rocket, 'y', { duration: 0.35, ease: 'power3' });
      setRot = gsap.quickTo(rocket, 'rotation', { duration: 0.6, ease: 'power3' });
      gsap.to(flame, { scaleY: 'random(0.75, 1.35)', scaleX: 'random(0.85, 1.1)', transformOrigin: '50% 0%', duration: 0.09, repeat: -1, repeatRefresh: true, ease: 'none' });
    } else {
      setY = function (v) { rocket.style.transform = 'translateY(' + v + 'px) translateY(-50%) rotate(' + heading + 'deg)'; };
      setRot = function () {};
    }

    function measure() {
      if (!rail.offsetWidth) return;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      tops = sections.map(function (s, i) {
        return i === 0 ? 0 : Math.min(max, s.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35);
      });
      stopY = stops.map(function (a) { return a.offsetTop + a.offsetHeight / 2; });
      update();
    }

    function update() {
      if (!rail.offsetWidth || !tops.length) return;
      var y = window.scrollY, n = tops.length, i = 0;
      while (i < n - 1 && y >= tops[i + 1]) i++;
      var local = i === n - 1 ? 0 : clamp((y - tops[i]) / Math.max(1, tops[i + 1] - tops[i]), 0, 1);
      var pos = i === n - 1 ? stopY[n - 1] : stopY[i] + (stopY[i + 1] - stopY[i]) * local;
      var current = local > 0.5 ? i + 1 : i;

      if (y !== lastY) heading = y > lastY ? 180 : 0; // nose points the way you scroll
      lastY = y;
      setY(pos); setRot(heading);
      fill.style.transform = 'scaleY(' + (pos / stopY[n - 1]).toFixed(4) + ')';
      stops.forEach(function (a, k) {
        a.classList.toggle('is-passed', k < current);
        a.classList.toggle('is-current', k === current);
        if (k === current) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    }

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', measure);
    if (window.portfolioLenis) window.portfolioLenis.on('scroll', update);
    else window.addEventListener('scroll', update, { passive: true });
    if (animate) gsap.from(rail, { x: -60, autoAlpha: 0, duration: 1.2, delay: 3, ease: 'expo.out' });
  })();

  /* ---------------- Tech universe ---------------- */
  (function universe() {
    var uni = $('.universe');
    if (!uni) return;
    var rings = $$('.orbit-ring', uni);

    function place() {
      rings.forEach(function (ring) {
        var r = ring.offsetWidth / 2;
        $$('.planet', ring).forEach(function (p) {
          var a = (+p.dataset.a * Math.PI) / 180;
          var b = $('b', p), x = r * Math.cos(a), y = r * Math.sin(a);
          if (animate) gsap.set(b, { x: x, y: y, xPercent: -50, yPercent: -50 });
          else b.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
        });
      });
    }
    place();
    window.addEventListener('resize', place);
    if (!animate) return;

    // Each layer orbits at its own speed; labels counter-rotate so they stay readable.
    var loops = rings.map(function (ring, i) {
      var d = +ring.dataset.speed, dir = i % 2 ? -1 : 1;
      var tl = gsap.timeline({ repeat: -1 });
      tl.to(ring, { rotation: 360 * dir, duration: d, ease: 'none' }, 0)
        .to($$('.planet b', ring), { rotation: -360 * dir, duration: d, ease: 'none' }, 0);
      return tl;
    });
    // Hovering the system slows it down so labels are easy to read.
    uni.addEventListener('pointerenter', function () { loops.forEach(function (l) { gsap.to(l, { timeScale: 0.12, duration: 0.6 }); }); });
    uni.addEventListener('pointerleave', function () { loops.forEach(function (l) { gsap.to(l, { timeScale: 1, duration: 0.8 }); }); });
    gsap.to('.universe__sun', { scale: 1.06, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    // Planets pop into orbit when the section scrolls into view.
    gsap.from($$('.planet b', uni), {
      scale: 0, autoAlpha: 0, stagger: 0.06, duration: 0.7, ease: 'back.out(2)',
      scrollTrigger: { trigger: uni, start: 'top 80%' }
    });
  })();

  /* ---------------- AI UFO ---------------- */
  (function aiUfo() {
    var ufo = $('.ufo');
    if (!ufo || !animate) return;
    // hover bob runs on the inner svg so it doesn't fight the arrival tween on the button
    gsap.to($('svg', ufo), { y: -12, rotation: -3, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to($$('.ufo__light', ufo), { opacity: 0.25, duration: 0.35, stagger: { each: 0.15, repeat: -1, yoyo: true } });
    var beam = $('.ufo__beam', ufo);
    var hum = gsap.fromTo(beam, { scaleY: 0.55, opacity: 0.3 }, { scaleY: 1, opacity: 0.75, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    // Arrive from deep space when the AI section comes into view.
    gsap.from(ufo, { x: 260, y: -140, scale: 0.3, rotation: 25, autoAlpha: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '#ai', start: 'top 70%' } });
    // Strong beam when a project idea is submitted to the scoper.
    var scoper = $('#scoper');
    if (scoper) scoper.addEventListener('submit', function () {
      hum.pause();
      gsap.timeline({ onComplete: function () { hum.play(); } })
        .to(beam, { scaleY: 1.5, opacity: 1, duration: 0.25, ease: 'power2.out' })
        .to(beam, { scaleY: 0.55, opacity: 0.3, duration: 0.8, ease: 'power2.in' });
    });
  })();
})();
