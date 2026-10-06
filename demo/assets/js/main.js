/* =========================================================
   SOLARE — Demo interactions
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
  $("#socials").innerHTML = Object.entries(C.social).map(([k, url]) =>
    `<a href="${esc(url)}" aria-label="Solare on ${k}" target="_blank" rel="noopener"><i class="fa-brands ${socialIcons[k]}"></i></a>`).join("");
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Render sections from data.js ---------- */
  const demoTag = '<span class="demo-tag"><i class="fa-solid fa-image"></i> Demo image</span>';

  $("#programGrid").innerHTML = D.programs.map((p, i) => `
    <div class="col-md-6 col-lg-4">
      <article class="prog-card reveal ${p.featured ? "is-featured" : ""}" style="--d:${i * .12}s">
        ${p.featured ? '<span class="ribbon">Most popular</span>' : ""}
        <div class="media">
          ${demoTag}
          <img src="${p.image}" alt="${esc(p.title)} programme" loading="lazy">
          <span class="tag-jp jp">${esc(p.tag)}</span>
        </div>
        <div class="body">
          <span class="icon-badge"><i class="fa-solid ${p.icon}"></i></span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.text)}</p>
          <ul class="check-list">${p.points.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
          <a class="link-arrow" href="#contact" data-program="${esc(p.title)}">Apply for this programme <i class="fa-solid fa-arrow-right"></i></a>
        </div>
      </article>
    </div>`).join("");

  $("#statGrid").innerHTML = D.stats.map((s, i) => `
    <div class="col-6 col-md-3 stat-col">
      <div class="stat reveal" style="--d:${i * .1}s">
        <div class="num"><span data-count="${s.value}">0</span><span class="suf">${esc(s.suffix)}</span></div>
        <div class="lbl">${esc(s.label)}</div>
      </div>
    </div>`).join("");

  $("#sectorGrid").innerHTML = D.sectors.map((s, i) => `
    <div class="col-sm-6 col-lg-3">
      <a class="sector-card reveal zoom" href="#contact" data-sector="${esc(s.title)}" style="--d:${(i % 4) * .08}s">
        ${demoTag}
        <img src="${s.image}" alt="" loading="lazy">
        <div class="inner">
          <span class="ico"><i class="fa-solid ${s.icon}"></i></span>
          <h3>${esc(s.title)}<span class="jp">${esc(s.jp)}</span></h3>
          <p>${esc(s.text)}</p>
        </div>
      </a>
    </div>`).join("") + `
    <div class="col-sm-6 col-lg-3">
      <div class="sector-cta reveal zoom" style="--d:.24s">
        <img class="bg-icon" src="assets/img/icon.webp" alt="" aria-hidden="true">
        <div>
          <span class="eyebrow" style="color:var(--sl-gold)">16 SSW fields</span>
          <h3>Don't see your job here?</h3>
          <p>Japan's SSW programme covers 16 industries, including driving, railway, cleaning and shipbuilding.</p>
        </div>
        <a class="btn-sl btn-sl--white btn-sl--sm align-self-start" href="#contact">Ask an advisor <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </div>`;

  $("#reasonGrid").innerHTML = D.reasons.map((r, i) => `
    <div class="col-sm-6">
      <div class="reason reveal" style="--d:${i * .08}s">
        <span class="ico"><i class="fa-solid ${r.icon}"></i></span>
        <div><h4>${esc(r.title)}</h4><p>${esc(r.text)}</p></div>
      </div>
    </div>`).join("");

  $("#stepList").innerHTML = D.steps.map((s, i) => `
    <li class="step reveal" style="--d:${i * .1}s">
      <span class="ico"><i class="fa-solid ${s.icon}"></i></span>
      <div class="txt"><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>
    </li>`).join("");

  $("#galleryGrid").innerHTML = D.gallery.map((g, i) => `
    <figure class="g-item reveal zoom m-0" style="--d:${i * .08}s">
      ${demoTag}
      <img src="${g.src}" alt="${esc(g.alt)}" loading="lazy">
      <figcaption>${esc(g.label)}</figcaption>
    </figure>`).join("");

  $("#faqList").innerHTML = D.faqs.map((f, i) => `
    <div class="accordion-item">
      <h3 class="accordion-header m-0">
        <button class="accordion-button ${i ? "collapsed" : ""}" type="button" data-bs-toggle="collapse" data-bs-target="#faq${i}" aria-expanded="${!i}" aria-controls="faq${i}">${esc(f.q)}</button>
      </h3>
      <div id="faq${i}" class="accordion-collapse collapse ${i ? "" : "show"}" data-bs-parent="#faqList">
        <div class="accordion-body">${esc(f.a)}</div>
      </div>
    </div>`).join("");

  // Marquee (content doubled for a seamless loop)
  const blossom = '<svg viewBox="-34 -34 68 68" aria-hidden="true"><g fill="#fff">' +
    [0, 72, 144, 216, 288].map(r => `<path transform="rotate(${r})" d="M0 0C-11-7-14-22-7-33Q-3-29 0-31Q3-29 7-33C14-22 11-7 0 0Z"/>`).join("") +
    '</g><circle r="5" fill="#FFD12D"/></svg>';
  const mItems = D.sectors.map(s => `<span class="marquee-item">${blossom}${esc(s.title)} <span class="jp">${esc(s.jp)}</span></span>`).join("");
  $("#marqueeTrack").innerHTML = mItems + mItems;

  // Sector dropdown in form
  $("#fSector").insertAdjacentHTML("beforeend", D.sectors.map(s => `<option>${esc(s.title)}</option>`).join(""));

  // Pre-select programme / sector when a card link is clicked
  document.addEventListener("click", e => {
    const p = e.target.closest("[data-program]"); if (p) $("#fProgram").value = p.dataset.program;
    const s = e.target.closest("[data-sector]");  if (s) $("#fSector").value = s.dataset.sector;
  });

  /* ---------- Demo bar ---------- */
  const bar = $("#demoBar");
  const setBarH = () => document.documentElement.style.setProperty("--demo-bar-h", bar && bar.isConnected ? bar.offsetHeight + "px" : "0px");
  setBarH(); addEventListener("resize", setBarH);
  $("#demoBarClose").addEventListener("click", () => { bar.remove(); document.body.classList.remove("has-demo-bar"); setBarH(); });

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

  /* ---------- Enquiry form (demo: validates, no data sent) ---------- */
  const form = $("#enquiryForm"), card = $("#formCard"), btn = $("#submitBtn");
  const loadedAt = Date.now();

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

  form.addEventListener("submit", e => {
    e.preventDefault();
    const els = $$("input:not([type=radio]):not(#fWebsite), select, textarea", form);
    const allOk = els.map(validate).every(Boolean);
    if (!allOk) { const first = $(".is-invalid", form); first && first.focus(); return; }

    // Spam checks (the live version repeats these on the server)
    if ($("#fWebsite").value || Date.now() - loadedAt < 3000) return;

    const d = Object.fromEntries(new FormData(form));
    btn.disabled = true;
    $(".lbl", btn).textContent = "Sending…";
    setTimeout(() => {                                           // simulate network request
      $("#okName").textContent = d.name.trim().split(" ")[0];
      $("#okWa").href = waLink(
        `Hello Solare, my name is ${d.name}. I am ${d.age} years old and interested in ${d.program}` +
        `${d.sector ? " (" + d.sector + ")" : ""}. Japanese level: ${d.jlpt}. ${d.message || ""}`.trim());
      card.classList.add("is-sent");
      btn.disabled = false; $(".lbl", btn).textContent = "Send my request";
      card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    }, 900);
  });
  $("#formReset").addEventListener("click", () => {
    form.reset(); $$(".is-invalid", form).forEach(el => el.classList.remove("is-invalid"));
    card.classList.remove("is-sent"); $("#fName").focus();
  });
})();
