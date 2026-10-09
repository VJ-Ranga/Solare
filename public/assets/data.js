/* =========================================================
   SOLARE — site data
   Edit this file to update contact details and content.
   Items marked  status: "tbc"  are waiting on the client.
   ========================================================= */
window.SOLARE = {

  /* ---------- Contact (WAITING ON CLIENT: phone, WhatsApp, email, licence) ---------- */
  contact: {
    phone:       { display: "+94 XX XXX XXXX", tel: "",            status: "tbc" },
    whatsapp:    { display: "+94 XX XXX XXXX", number: "",         status: "tbc" }, // digits only, e.g. 94771234567
    email:       { display: "info@solarejapan.com.lk", status: "ok" },
    address:     { lines: ["No. 00, Galle Road", "Colombo 03, Sri Lanka"], status: "demo" },
    hours:       "Mon – Sat · 9.00 am – 5.30 pm",
    licence:     { number: "XXXX", status: "tbc" },              // SLBFE licence number
    social: {
      facebook:  "#",
      instagram: "#",
      tiktok:    "#",
      youtube:   "#"
    },
    whatsappGreeting: "Hello Solare, I would like to know about jobs in Japan."
  },

  /* ---------- Headline numbers (DEMO FIGURES — replace with real ones) ---------- */
  stats: [
    { value: 500, suffix: "+", label: "Candidates guided" },
    { value: 16,  suffix: "",  label: "SSW job fields" },
    { value: 40,  suffix: "+", label: "Partner employers in Japan" },
    { value: 100, suffix: "%", label: "Transparent, written fees" }
  ],

  /* ---------- Visa programmes ---------- */
  programs: [
    {
      id: "engineer",
      tag: "技術・人文知識・国際業務",
      title: "Engineer / Humanities",
      text: "For graduates and diploma holders — IT, engineering, design, interpreting, sales and office roles with long-term career growth.",
      points: ["Degree or diploma required", "Renewable work visa", "Family can join you"],
      image: "https://images.pexels.com/photos/7580643/pexels-photo-7580643.jpeg?auto=compress&cs=tinysrgb&w=900",
      icon: "fa-user-tie"
    },
    {
      id: "ssw",
      tag: "特定技能",
      title: "Specified Skilled Worker (SSW)",
      text: "Japan's main route for skilled workers in 16 industries. Pass a skills test and a Japanese test, and work up to five years — longer with SSW (ii).",
      points: ["Skills test + JLPT N4 / JFT-Basic", "Same pay as Japanese staff", "Change employer within your field"],
      image: "https://images.pexels.com/photos/31212954/pexels-photo-31212954.jpeg?auto=compress&cs=tinysrgb&w=900",
      icon: "fa-helmet-safety",
      featured: true
    },
    {
      id: "esd",
      tag: "育成就労",
      title: "Employment for Skill Development",
      text: "Japan's new system replacing Technical Intern Training. Learn on the job for three years and build the skills to move up to SSW.",
      points: ["Entry level — training on the job", "Clear path to SSW", "Stronger worker protection"],
      image: "https://images.pexels.com/photos/5888168/pexels-photo-5888168.jpeg?auto=compress&cs=tinysrgb&w=900",
      icon: "fa-seedling"
    }
  ],

  /* ---------- Job sectors ---------- */
  sectors: [
    { title: "Caregiving",     jp: "介護",   icon: "fa-hand-holding-heart", text: "Nursing homes and elderly day-care.",       image: "https://images.pexels.com/photos/18870282/pexels-photo-18870282.jpeg?auto=compress&cs=tinysrgb&w=700" },
    { title: "Food service",   jp: "外食",   icon: "fa-utensils",           text: "Restaurants, kitchens and central kitchens.", image: "https://images.pexels.com/photos/12203618/pexels-photo-12203618.jpeg?auto=compress&cs=tinysrgb&w=700" },
    { title: "Manufacturing",  jp: "製造",   icon: "fa-gears",              text: "Factories, machinery and electronics.",      image: "https://images.pexels.com/photos/31091544/pexels-photo-31091544.jpeg?auto=compress&cs=tinysrgb&w=700" },
    { title: "Construction",   jp: "建設",   icon: "fa-trowel-bricks",      text: "Building, civil works and skilled trades.",  image: "https://images.unsplash.com/photo-1764685849160-e2bc5b07d15d?w=700&q=70&auto=format&fit=crop" },
    { title: "Agriculture",    jp: "農業",   icon: "fa-wheat-awn",          text: "Rice fields, farms and greenhouses.",          image: "https://images.pexels.com/photos/29039800/pexels-photo-29039800.jpeg?auto=compress&cs=tinysrgb&w=700" },
    { title: "Hospitality",    jp: "宿泊",   icon: "fa-bell-concierge",     text: "Hotels, ryokan and front-desk service.",     image: "https://images.pexels.com/photos/3770107/pexels-photo-3770107.jpeg?auto=compress&cs=tinysrgb&w=700" },
    { title: "IT & Engineering", jp: "技術", icon: "fa-microchip",          text: "Engineers, technicians and IT staff.",      image: "https://images.unsplash.com/photo-1581091212991-8891c7d4bd9b?w=700&q=70&auto=format&fit=crop" }
  ],

  /* ---------- How it works ---------- */
  steps: [
    { icon: "fa-comments",        title: "Free consultation", text: "Visit us or message on WhatsApp. We check your skills, age and goals and suggest the right programme." },
    { icon: "fa-language",        title: "Japanese training", text: "Classes for JLPT N5–N4 / JFT-Basic, plus workplace manners and daily-life Japanese." },
    { icon: "fa-clipboard-check", title: "Skills test & interview", text: "We prepare you for the skills test and online interviews with Japanese employers." },
    { icon: "fa-passport",        title: "Visa & documents", text: "Certificate of Eligibility, visa, SLBFE registration and medicals — handled step by step." },
    { icon: "fa-plane-departure", title: "Fly & settle in",   text: "Pre-departure briefing, airport pick-up and a contact person in Japan after you arrive." }
  ],

  /* ---------- Why Solare ---------- */
  reasons: [
    { icon: "fa-shield-halved",  title: "SLBFE licensed",      text: "A registered foreign-employment agency in Sri Lanka." },
    { icon: "fa-file-invoice",   title: "Fees in writing",     text: "Every cost explained before you sign. Receipts for every payment." },
    { icon: "fa-torii-gate",     title: "Japan specialists",   text: "We focus only on Japan, so we know each programme in detail." },
    { icon: "fa-people-group",   title: "Support after arrival", text: "We stay in touch with you and your employer once you land." }
  ],

  /* ---------- Life in Japan gallery ---------- */
  gallery: [
    { src: "https://images.unsplash.com/photo-1542931287-023b922fa89b?w=900&q=70&auto=format&fit=crop",  alt: "Tokyo side street under cherry blossoms", label: "Tokyo in spring" },
    { src: "https://images.unsplash.com/photo-1514337224818-9787cf717f2a?w=900&q=70&auto=format&fit=crop", alt: "Shinkansen bullet train at a station",   label: "Shinkansen" },
    { src: "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?w=900&q=70&auto=format&fit=crop", alt: "Kyoto street with Yasaka pagoda",        label: "Kyoto" },
    { src: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=900&q=70&auto=format&fit=crop", alt: "Shibuya crossing at night",              label: "Shibuya nights" },
    { src: "https://images.unsplash.com/photo-1744204876894-2591d3b1f42e?w=900&q=70&auto=format&fit=crop", alt: "Cherry blossoms over a river at night",  label: "Sakura season" }
  ],

  /* ---------- FAQ ---------- */
  faqs: [
    { q: "Do I need to speak Japanese before I apply?",
      a: "No. You can start with zero Japanese. SSW needs JLPT N4 or JFT-Basic (A2) before you fly, and our classes take you there. Engineer / Humanities roles depend on the employer." },
    { q: "How long does the whole process take?",
      a: "Most candidates fly within 6–12 months. It depends on your programme, how fast you pass the language and skills tests, and the employer's hiring schedule." },
    { q: "What does it cost?",
      a: "Costs depend on the programme. We give you a full written breakdown at your first consultation — nothing is hidden and every payment is receipted." },
    { q: "Is Solare a licensed agency?",
      a: "Yes. Solare Foreign Employment (Pvt) Ltd is licensed by the Sri Lanka Bureau of Foreign Employment (SLBFE). Our licence number is shown at the bottom of this page." },
    { q: "Can my family come with me?",
      a: "On Engineer / Humanities and SSW (ii) visas, your spouse and children can usually join you. SSW (i) and Skill Development do not allow family to accompany you." },
    { q: "What happens after I arrive in Japan?",
      a: "Your employer and a registered support organisation help with housing, a bank account and your residence card. Solare also stays in touch with you." }
  ]
};
