#!/usr/bin/env node
/**
 * Solare — static build.
 *
 * Writes the content from public/assets/data.js into public/index.html as real HTML
 * (so search engines and link previews can read it without running JavaScript),
 * and regenerates the structured data and sitemap.
 *
 * Run after editing data.js:   node build.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SITE = "https://solarejapan.com.lk/";
const PUB = path.join(__dirname, "public");
const htmlFile = path.join(PUB, "index.html");

// Load data.js (it assigns window.SOLARE)
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(PUB, "assets/data.js"), "utf8"), sandbox);
const D = sandbox.window.SOLARE;
const C = D.contact;

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const indent = (s, n) => s.split("\n").map(l => (l.trim() ? " ".repeat(n) + l : l)).join("\n");

/* ---------- Section templates ---------- */
const blocks = {};

blocks.programs = D.programs.map((p, i) => `<div class="col-md-6 col-lg-4">
  <article class="prog-card reveal${p.featured ? " is-featured" : ""}" style="--d:${(i * 0.12).toFixed(2)}s">${p.featured ? `
    <span class="ribbon">Most popular</span>` : ""}
    <div class="media">
      <img src="${esc(p.image)}" alt="${esc(p.title)} programme in Japan" loading="lazy" width="900" height="619">
      <span class="tag-jp jp" lang="ja">${esc(p.tag)}</span>
    </div>
    <div class="body">
      <span class="icon-badge"><i class="fa-solid ${p.icon}"></i></span>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.text)}</p>
      <ul class="check-list">
${p.points.map(x => `        <li>${esc(x)}</li>`).join("\n")}
      </ul>
      <a class="link-arrow" href="#contact" data-program="${esc(p.title)}">Apply for this programme <i class="fa-solid fa-arrow-right"></i></a>
    </div>
  </article>
</div>`).join("\n");

blocks.stats = D.stats.map((s, i) => `<div class="col-6 col-md-3 stat-col">
  <div class="stat reveal" style="--d:${(i * 0.1).toFixed(1)}s">
    <div class="num"><span data-count="${s.value}">${s.value}</span><span class="suf">${esc(s.suffix)}</span></div>
    <div class="lbl">${esc(s.label)}</div>
  </div>
</div>`).join("\n");

blocks.sectors = D.sectors.map((s, i) => `<div class="col-sm-6 col-lg-3">
  <a class="sector-card reveal zoom" href="#contact" data-sector="${esc(s.title)}" style="--d:${((i % 4) * 0.08).toFixed(2)}s">
    <img src="${esc(s.image)}" alt="${esc(s.title)} jobs in Japan" loading="lazy" width="700" height="700">
    <div class="inner">
      <span class="ico"><i class="fa-solid ${s.icon}"></i></span>
      <h3>${esc(s.title)}<span class="jp" lang="ja">${esc(s.jp)}</span></h3>
      <p>${esc(s.text)}</p>
    </div>
  </a>
</div>`).join("\n") + `
<div class="col-sm-6 col-lg-3">
  <div class="sector-cta reveal zoom" style="--d:.24s">
    <img class="bg-icon" src="assets/img/icon.webp" alt="" aria-hidden="true" width="256" height="256">
    <div>
      <span class="eyebrow" style="color:var(--sl-gold)">16 SSW fields</span>
      <h3>Don't see your job here?</h3>
      <p>Japan's SSW programme covers 16 industries, including driving, railway, cleaning and shipbuilding.</p>
    </div>
    <a class="btn-sl btn-sl--white btn-sl--sm align-self-start" href="#contact">Ask an advisor <i class="fa-solid fa-arrow-right"></i></a>
  </div>
</div>`;

blocks.reasons = D.reasons.map((r, i) => `<div class="col-sm-6">
  <div class="reason reveal" style="--d:${(i * 0.08).toFixed(2)}s">
    <span class="ico"><i class="fa-solid ${r.icon}"></i></span>
    <div><h4>${esc(r.title)}</h4><p>${esc(r.text)}</p></div>
  </div>
</div>`).join("\n");

blocks.steps = D.steps.map((s, i) => `<li class="step reveal" style="--d:${(i * 0.1).toFixed(1)}s">
  <span class="ico"><i class="fa-solid ${s.icon}"></i></span>
  <div class="txt"><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>
</li>`).join("\n");

blocks.gallery = D.gallery.map((g, i) => `<figure class="g-item reveal zoom m-0" style="--d:${(i * 0.08).toFixed(2)}s">
  <img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy">
  <figcaption>${esc(g.label)}</figcaption>
</figure>`).join("\n");

blocks.faqs = D.faqs.map((f, i) => `<div class="accordion-item">
  <h3 class="accordion-header m-0">
    <button class="accordion-button${i ? " collapsed" : ""}" type="button" data-bs-toggle="collapse" data-bs-target="#faq${i}" aria-expanded="${!i}" aria-controls="faq${i}">${esc(f.q)}</button>
  </h3>
  <div id="faq${i}" class="accordion-collapse collapse${i ? "" : " show"}" data-bs-parent="#faqList">
    <div class="accordion-body">${esc(f.a)}</div>
  </div>
</div>`).join("\n");

blocks.sectorOptions = D.sectors.map(s => `<option>${esc(s.title)}</option>`).join("\n");

/* ---------- Structured data (only confirmed details are published) ---------- */
const confirmed = x => x && x.status !== "tbc" && x.status !== "demo";
const org = {
  "@context": "https://schema.org",
  "@type": "EmploymentAgency",
  "@id": SITE + "#organization",
  name: "Solare Foreign Employment (Pvt) Ltd",
  alternateName: "Solare Japan",
  slogan: "People beyond borders",
  description: "SLBFE-licensed foreign employment agency helping Sri Lankans find jobs in Japan through the SSW, Engineer / Humanities and Employment for Skill Development programmes.",
  url: SITE,
  logo: SITE + "assets/img/logo.png",
  image: SITE + "assets/img/og-image.jpg",
  areaServed: [{ "@type": "Country", name: "Sri Lanka" }, { "@type": "Country", name: "Japan" }],
  knowsAbout: ["Jobs in Japan", "Specified Skilled Worker (SSW) visa", "Engineer / Specialist in Humanities visa", "Employment for Skill Development", "Japanese language training (JLPT, JFT-Basic)"],
  address: { "@type": "PostalAddress", addressLocality: "Colombo", addressCountry: "LK" },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "17:30" }]
};
if (confirmed(C.email)) org.email = C.email.display;
if (confirmed(C.phone) && C.phone.tel) org.telephone = C.phone.tel;
if (confirmed(C.address)) org.address.streetAddress = C.address.lines[0];
const same = Object.values(C.social).filter(u => /^https?:\/\//.test(u));
if (same.length) org.sameAs = same;

const website = { "@context": "https://schema.org", "@type": "WebSite", name: "Solare Foreign Employment", url: SITE, inLanguage: "en-LK", publisher: { "@id": SITE + "#organization" } };
const faq = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: D.faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

blocks.schema = [org, website, faq]
  .map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n");

/* ---------- Write into index.html between <!--build:x--> markers ---------- */
let html = fs.readFileSync(htmlFile, "utf8");
for (const [name, content] of Object.entries(blocks)) {
  const re = new RegExp(`([ \\t]*)<!--build:${name}-->[\\s\\S]*?<!--/build:${name}-->`);
  if (!re.test(html)) { console.error(`Marker not found: ${name}`); process.exit(1); }
  html = html.replace(re, (_, sp) => `${sp}<!--build:${name}-->\n${indent(content, sp.length)}\n${sp}<!--/build:${name}-->`);
}
fs.writeFileSync(htmlFile, html);

/* ---------- sitemap.xml ---------- */
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(PUB, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <image:image><image:loc>${SITE}assets/img/og-image.jpg</image:loc></image:image>
  </url>
</urlset>
`);

console.log(`Built index.html (${Object.keys(blocks).length} blocks) and sitemap.xml — ${today}`);
