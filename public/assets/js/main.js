/* =========================================================
   SOLARE — site interactions
   ========================================================= */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  const D = window.SOLARE;
  const C = D.contact;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tbc = st => st === "tbc" ? '<span class="tbc">TBC</span>' : st === "demo" ? '<span class="tbc">Demo</span>' : "";

  /* ---------- Contact links & fields ---------- */
  const waLink = (text = C.whatsappGreeting) =>
    `https://wa.me/${C.whatsapp.number}?text=${encodeURIComponent(text)}`;
  $$("[data-wa]").forEach(a => a.href = waLink());
  $$("[data-tel]").forEach(a => a.href = C.phone.tel ? `tel:${C.phone.tel}` : "#contact");
  $$("[data-mail]").forEach(a => a.href = C.email.status === "tbc" ? "#contact" : `mailto:${C.email.display}`);

  const fields = {
    phone:    esc(C.phone.display) + tbc(C.phone.status),
    whatsapp: esc(C.whatsapp.display) + tbc(C.whatsapp.status),
    email:    esc(C.email.display) + tbc(C.email.status),
    address:  C.address.lines.map(esc).join(", ") + tbc(C.address.status),
    hours:    esc(C.hours),
    licence:  esc(C.licence.number) + tbc(C.licence.status)
  };
  $$("[data-field]").forEach(el => el.innerHTML = fields[el.dataset.field] || "");

  const socialIcons = { facebook: "fa-facebook-f", instagram: "fa-instagram", tiktok: "fa-tiktok", youtube: "fa-youtube" };
  const socialHtml = Object.entries(C.social).map(([k, url]) =>
    `<a href="${esc(url)}" aria-label="Solare on ${k}" target="_blank" rel="noopener"><i class="fa-brands ${socialIcons[k]}"></i></a>`).join("");
  $$("[data-socials]").forEach(el => el.innerHTML = socialHtml);
  $("#year").textContent = new Date().getFullYear();

  /* Programmes, stats, sectors, reasons, steps, gallery and FAQ are written into
     index.html by build.js (run `node build.js` after editing data.js). */

  // Marquee (content doubled for a seamless loop)
  const blossom = '<svg viewBox="-34 -34 68 68" aria-hidden="true"><g fill="#fff">' +
    [0, 72, 144, 216, 288].map(r => `<path transform="rotate(${r})" d="M0 0C-11-7-14-22-7-33Q-3-29 0-31Q3-29 7-33C14-22 11-7 0 0Z"/>`).join("") +
    '</g><circle r="5" fill="#FFD12D"/></svg>';
  const mItems = D.sectors.map(s => `<span class="marquee-item">${blossom}${esc(s.title)} <span class="jp">${esc(s.jp)}</span></span>`).join("");
  $("#marqueeTrack").innerHTML = mItems + mItems;

  // Pre-select programme / sector when a card link is clicked
  document.addEventListener("click", e => {
    const p = e.target.closest("[data-program]"); if (p) $("#fProgram").value = p.dataset.program;
    const s = e.target.closest("[data-sector]");  if (s) $("#fSector").value = s.dataset.sector;
  });

  /* ---------- Header / back-to-top ---------- */
  const header = $("#siteHeader"), toTop = $("#toTop");
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    toTop.classList.toggle("show", y > 700);
  };
  onScroll(); addEventListener("scroll", onScroll, { passive: true });
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // Active nav link
  const navLinks = $$('.main-nav a[href^="#"]:not(.btn-sl)');
  const spy = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach(a => { const t = $(a.getAttribute("href")); if (t) spy.observe(t); });

  /* ---------- Scroll reveal + counters ---------- */
  const countUp = el => {
    const end = +el.dataset.count, dur = 1600, t0 = performance.now();
    const step = t => {
      const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e).toLocaleString();
      if (k < 1) requestAnimationFrame(step);
    };
    reduceMotion ? (el.textContent = end) : requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    $$("[data-count]", en.target).forEach(countUp);
    io.unobserve(en.target);
  }), { threshold: .15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  /* ---------- Sakura petals ---------- */
  function Petals(canvas, opts) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0, petals = [], running = false, raf = 0;
    const colors = opts.colors;

    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(initial) {
      const r = opts.size[0] + Math.random() * (opts.size[1] - opts.size[0]);
      return {
        x: Math.random() * w * 1.2 - w * .1,
        y: initial ? Math.random() * h : -20 - Math.random() * 60,
        r, vy: opts.speed[0] + Math.random() * (opts.speed[1] - opts.speed[0]),
        vx: .3 + Math.random() * .6,
        sway: Math.random() * Math.PI * 2, swaySp: .01 + Math.random() * .02,
        rot: Math.random() * Math.PI * 2, rotSp: (Math.random() - .5) * .04,
        flip: Math.random() * Math.PI * 2, flipSp: .02 + Math.random() * .04,
        c: colors[(Math.random() * colors.length) | 0],
        a: opts.alpha[0] + Math.random() * (opts.alpha[1] - opts.alpha[0])
      };
    }
    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(Math.max(Math.abs(Math.cos(p.flip)), .25), 1);   // 3D tumble
      ctx.globalAlpha = p.a;
      const r = p.r;
      const g = ctx.createLinearGradient(0, -r, 0, r);
      g.addColorStop(0, p.c[0]); g.addColorStop(1, p.c[1]);
      ctx.fillStyle = g;
      ctx.beginPath();                                            // sakura petal with notched tip
      ctx.moveTo(0, r);
      ctx.bezierCurveTo(r * 1.1, r * .4, r * .9, -r * .8, r * .25, -r);
      ctx.lineTo(0, -r * .72);
      ctx.lineTo(-r * .25, -r);
      ctx.bezierCurveTo(-r * .9, -r * .8, -r * 1.1, r * .4, 0, r);
      ctx.fill();
      ctx.restore();
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.sway += p.swaySp; p.rot += p.rotSp; p.flip += p.flipSp;
        p.y += p.vy; p.x += p.vx + Math.sin(p.sway) * .9;
        if (p.y > h + 30 || p.x > w + 40) petals[i] = make(false);
        drawPetal(p);
      }
      if (running) raf = requestAnimationFrame(frame);
    }
    this.start = () => { if (running || reduceMotion) return; running = true; raf = requestAnimationFrame(frame); };
    this.stop  = () => { running = false; cancelAnimationFrame(raf); };
    resize();
    const n = innerWidth < 768 ? opts.count[0] : opts.count[1];
    for (let i = 0; i < n; i++) petals.push(make(true));
    addEventListener("resize", resize);
    if (reduceMotion) frame();                                   // one still frame
  }

  const pink = [["#FFE3EC", "#F48FB1"], ["#FFF0F5", "#F7A8C2"], ["#FFD1DF", "#E8467F"], ["#FFFFFF", "#F9C5D5"]];
  const heroPetals = new Petals($("#heroPetals"), { count: [26, 55], size: [6, 13], speed: [.8, 1.8], alpha: [.75, 1], colors: pink });
  const sitePetals = new Petals($("#sitePetals"), { count: [5, 10], size: [4, 8], speed: [.5, 1.1], alpha: [.45, .75], colors: pink });

  // Hero petals run while hero is visible; light site-wide petals take over below it
  const heroIO = new IntersectionObserver(([en]) => {
    if (en.isIntersecting) { heroPetals.start(); sitePetals.stop(); $("#sitePetals").style.opacity = 0; }
    else { heroPetals.stop(); sitePetals.start(); $("#sitePetals").style.opacity = 1; }
  }, { threshold: .05 });
  heroIO.observe($(".hero"));
  $("#sitePetals").style.transition = "opacity .8s";
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { heroPetals.stop(); sitePetals.stop(); }
    else if (scrollY < $(".hero").offsetHeight) heroPetals.start(); else sitePetals.start();
  });

  /* ---------- Enquiry form — posts to send.php ---------- */
  const form = $("#enquiryForm"), card = $("#formCard"), btn = $("#submitBtn"), alertBox = $("#formAlert");
  const fieldIds = { name: "fName", phone: "fPhone", email: "fEmail", age: "fAge", program: "fProgram", consent: "fConsent" };
  let token = "", turnstileOn = false;

  const loadTurnstile = key => {                                  // optional Cloudflare Turnstile
    if (turnstileOn) return;
    turnstileOn = true;
    const box = $("#turnstileBox"); box.hidden = false;
    box.innerHTML = `<div class="cf-turnstile" data-sitekey="${esc(key)}"></div>`;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"; s.async = true; s.defer = true;
    document.head.appendChild(s);
  };
  const getToken = () => fetch(form.action, { headers: { Accept: "application/json" }, cache: "no-store" })
    .then(r => r.json())
    .then(d => {
      if (!d.ok) return;
      token = d.token;
      if (d.turnstile) loadTurnstile(d.turnstile);
    })
    .catch(() => {});                                              // e.g. static preview with no PHP

  // Fetch the token (and the security check) only when the form is about to be seen
  let formReady = false;
  const prepareForm = () => { if (!formReady) { formReady = true; getToken(); } };
  new IntersectionObserver((entries, obs) => {
    if (entries.some(en => en.isIntersecting)) { prepareForm(); obs.disconnect(); }
  }, { rootMargin: "800px 0px" }).observe(form);
  form.addEventListener("focusin", prepareForm);

  const showAlert = msg => {
    alertBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i><span>${esc(msg)} ` +
      `<a href="${waLink()}" target="_blank" rel="noopener">Message us on WhatsApp</a></span>`;
    alertBox.hidden = false;
  };

  const validate = el => {
    let ok = el.checkValidity();
    if (el.id === "fPhone" && el.value) ok = ok && /^(\+94|0)?7\d[\s-]?\d{3}[\s-]?\d{4}$/.test(el.value.trim());
    el.classList.toggle("is-invalid", !ok);
    return ok;
  };
  $$("input, select, textarea", form).forEach(el => {
    el.addEventListener("blur", () => { if (el.value || el.type === "checkbox") validate(el); });
    el.addEventListener("input", () => { if (el.classList.contains("is-invalid")) validate(el); });
  });

  const setBusy = busy => {
    btn.disabled = busy;
    $(".lbl", btn).textContent = busy ? "Sending…" : "Send my request";
  };

  form.addEventListener("submit", async e => {
    e.preventDefault();
    alertBox.hidden = true;
    const els = $$("input:not([type=radio]):not(#fWebsite), select, textarea", form);
    const allOk = els.map(validate).every(Boolean);
    if (!allOk) { const first = $(".is-invalid", form); first && first.focus(); return; }

    setBusy(true);
    try {
      if (!token) await getToken();
      const fd = new FormData(form);
      fd.append("token", token);
      const res = await fetch(form.action, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      const d = await res.json().catch(() => ({ ok: false, message: "Something went wrong." }));
      if (!d.ok) {
        if (d.errors) Object.keys(d.errors).forEach(k => { const el = $("#" + fieldIds[k]); el && el.classList.add("is-invalid"); });
        if (d.refresh) getToken();
        if (window.turnstile && turnstileOn) window.turnstile.reset();
        showAlert(d.message || "Something went wrong.");
        return;
      }
      const v = Object.fromEntries(fd);
      $("#okName").textContent = v.name.trim().split(" ")[0];
      $("#okWa").href = waLink(
        `Hello Solare, my name is ${v.name}. I am ${v.age} years old and interested in ${v.program}` +
        `${v.sector ? " (" + v.sector + ")" : ""}. Japanese level: ${v.jlpt}. ${v.message || ""}`.trim());
      card.classList.add("is-sent");
      card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      getToken();                                                  // fresh token for "Send another"
    } catch (err) {
      showAlert("We could not reach the server. Please check your connection.");
    } finally {
      setBusy(false);
    }
  });
  $("#formReset").addEventListener("click", () => {
    form.reset(); $$(".is-invalid", form).forEach(el => el.classList.remove("is-invalid")); alertBox.hidden = true;
    card.classList.remove("is-sent"); $("#fName").focus();
  });
})();
