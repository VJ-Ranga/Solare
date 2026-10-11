# Solare Foreign Employment — Project Notes

Client: Solare Foreign Employment (Pvt) Ltd — Sri Lankan agency sending workers to Japan.
Programmes: Engineer / Humanities, Specified Skilled Worker (SSW), Employment for Skill Development.

## Status
- [x] HTML landing page — `public/index.html` (Bootstrap 5, Font Awesome, Poppins)
- [x] Working enquiry form — `public/send.php` + PHPMailer (no WordPress)
- [ ] Client review
- [x] Live on cPanel at https://solarejapan.com.lk (repo in ~/solare-repo, web root ~/solarejapan.com.lk, private files ~/private)
- [x] SPF / DKIM / DMARC set; Cloudflare Turnstile on the form
- [x] SEO: static HTML, sitemap.xml, robots.txt, FAQ + agency structured data, branded preview image, local photos
- [ ] Google Search Console: verify domain and submit sitemap
- [ ] Google Business Profile (client)

## Waiting on client
- Hotline phone number
- WhatsApp number
- SLBFE licence number
- Office address + Google Maps pin
- Real office / team / departure photos (site uses stock photos stored in `public/assets/img/photos/`)
- Real headline numbers (stats section shows demo figures)
- Social media links (Facebook, Instagram, TikTok, YouTube)

## Confirmed
- Domain: solarejapan.com.lk (confirmed 2026-10-09)
- Email: info@solarejapan.com.lk (confirmed 2026-10-09)

## Email
- Sender (SMTP login): web@solarejapan.com.lk — password only in `private/config.php` on the server
- Enquiries go to: info@solarejapan.com.lk (client's inbox)
- Applicant gets an auto-reply (from web@, Reply-To info@) if they give an email
- Every enquiry is also saved to `private/storage/leads.csv`; errors go to `private/storage/error.log`

## Folder layout
- `public/`  → goes in public_html (web root)
- `private/` → goes next to public_html as `private/` (config, PHPMailer, storage — never web-accessible)
- `deploy.sh` → run on the server to pull from GitHub and copy files

## Deploy (terminal)
First time on the server (SSH):
```
git clone https://github.com/VJ-Ranga/Solare.git ~/solare-repo
cd ~/solare-repo
./deploy.sh ~/public_html                              # cPanel
./deploy.sh ~/web/solarejapan.com.lk/public_html       # Hestia
nano ~/private/config.php                              # cPanel path; Hestia: ~/web/solarejapan.com.lk/private/config.php
php ~/private/test-mail.php info@solarejapan.com.lk    # check SMTP works
```
In config.php set: smtp host (server mail hostname), port 465 + ssl, password, and a secret:
`php -r "echo bin2hex(random_bytes(32));"`

Every update after that:
```
cd ~/solare-repo && ./deploy.sh ~/public_html
```

## Local testing
`php -S localhost:8131 -t public` — local `private/config.php` points SMTP at a fake mail sink (no real email).

## Editing content
All contact details and section content live in `public/assets/data.js`.
After editing it, run `node build.js` — this writes the programmes, sectors, steps, gallery, FAQ
and the Google structured data into `public/index.html` as real HTML, and refreshes `sitemap.xml`.
Then commit, push and run `deploy.sh` on the server.

## Fonts, icons and photos (all stored locally for speed)
- `python3 tools/fonts.py` — rebuilds the small font files. Run it if new Japanese or Sinhala text is added
  (the Japanese and Sinhala fonts only contain the characters used on the site).
- `python3 tools/icons.py` — rebuilds the Font Awesome subset. Run it after using a new `fa-...` icon.
- Photos live in `public/assets/img/photos/` as WebP. Bootstrap is in `public/assets/vendor/`.
Items with `status: "tbc"` show a yellow TBC badge until replaced.

## Brand
- Logo colours: sky #0EA5EF, sun #FF6A1A → #FF9A21, leaf #16A34A, charcoal #282828, gold #FFD12D
- Campaign colours (banner): sakura pink #D8166A, maroon #6E1430
- Fonts: Poppins (EN), Noto Sans Sinhala (SI), Noto Serif JP (Japanese accents)

## Preview locally
`php -S localhost:8131 -t public` then open http://localhost:8131
