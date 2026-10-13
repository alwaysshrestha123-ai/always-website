
/* ============================================================
   ALWAYSSS — main.js
   Storage layer, UI components, portfolio, reviews, forms,
   admin dashboard, analytics, cookie consent
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- storage ---------------- */
  // Shared site data comes from the cloud (cloudGet/cloudSet/cloudAppend in data.js),
  // falling back to the defaults in data.js. Only per-browser analytics stay local.
  const SEED = key => JSON.parse(JSON.stringify(window.ALWAYSSS_SEED[key]));
  const DATA = {};
  const load = keys => Promise.all(keys.map(async k => { DATA[k] = await cloudGet(k, SEED(k)); }));
  const LOCAL = {
    get(key, fallback) { try { const raw = localStorage.getItem("aw_" + key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; } },
    set(key, val) { try { localStorage.setItem("aw_" + key, JSON.stringify(val)); } catch (e) {} }
  };

  const settings = () => Object.assign(SEED("settings"), DATA.settings);
  const projects = () => DATA.projects;
  const reviews = () => DATA.reviews;
  const clients = () => SEED("clients");
  const services = () => SEED("services");

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const uid = () => "id" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const IG_ICON = '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-9.6a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"/></svg>';
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17L17 7M9 7h8v8"/></svg>';

  /* ---------------- analytics (privacy-conscious, local) ---------------- */
  function track() {
    try {
      const data = LOCAL.get("analytics", []);
      data.push({ p: location.pathname.split("/").pop() || "index.html", t: Date.now(), ref: document.referrer || "direct", ua: navigator.userAgent, lang: navigator.language });
      if (data.length > 4000) data.splice(0, data.length - 4000);
      LOCAL.set("analytics", data);
      const ga = settings().gaId;
      if (ga && !window.__gaLoaded) {
        window.__gaLoaded = 1;
        const s = document.createElement("script"); s.async = true;
        s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ga);
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag("js", new Date()); window.gtag("config", ga);
      }
    } catch (e) {}
  }

  /* ---------------- nav / footer ---------------- */
  function renderChrome(active) {
    const s = settings();
    const nav = document.createElement("header");
    nav.className = "nav";
    nav.innerHTML =
      '<div class="nav-inner">' +
        '<a href="index.html" class="brand">ALWAYS<em>SSS</em></a>' +
        '<nav><ul class="nav-links">' +
          ["Home|index.html", "Work|work.html", "Services|services.html", "About|about.html", "Reviews|reviews.html", "Contact|contact.html"]
            .map(pair => { const [label, href] = pair.split("|");
              return '<li><a href="' + href + '"' + (active === href ? ' class="active"' : "") + ">" + label + "</a></li>"; }).join("") +
        '</ul></nav>' +
        '<div style="display:flex;align-items:center;gap:.7rem">' +
          '<a class="icon-btn" href="' + esc(s.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram">' + IG_ICON + "</a>" +
          '<a class="nav-cta" href="contact.html">Let\u2019s Work Together</a>' +
          '<button class="burger" aria-label="Menu"><span></span><span></span><span></span></button>' +
        "</div>" +
      "</div>";
    document.body.prepend(nav);

    const mm = document.createElement("div");
    mm.className = "mobile-menu";
    mm.innerHTML =
      ["Home|index.html", "Work|work.html", "Services|services.html", "About|about.html", "Reviews|reviews.html", "Contact|contact.html"]
        .map(pair => { const [label, href] = pair.split("|"); return '<a href="' + href + '">' + label + "</a>"; }).join("") +
      '<a href="' + esc(s.instagram) + '" target="_blank" rel="noopener" style="font-family:var(--font-body);font-size:.85rem;letter-spacing:.2em;color:var(--muted)">@always_shrestha</a>' +
      '<a class="mm-cta" href="contact.html">Let\u2019s Work Together</a>';
    document.body.appendChild(mm);

    const burger = $(".burger", nav);
    burger.addEventListener("click", () => {
      burger.classList.toggle("open"); mm.classList.toggle("open");
      document.body.style.overflow = mm.classList.contains("open") ? "hidden" : "";
    });
    $$("a", mm).forEach(a => a.addEventListener("click", () => {
      burger.classList.remove("open"); mm.classList.remove("open"); document.body.style.overflow = "";
    }));

    window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 24), { passive: true });

    const foot = document.createElement("footer");
    foot.innerHTML =
      '<div class="container">' +
        '<div class="foot-grid">' +
          "<div>" +
            '<div class="foot-brand">ALWAYS<em style="color:var(--accent);font-style:normal">SSS</em></div>' +
            "<p>" + esc(s.tagline) + ". Creating cinematic photography and film for hotels, brands, restaurants and travel — across 18 countries and 3 continents.</p>" +
          "</div>" +
          '<div class="foot-col"><b>Explore</b>' +
            '<a href="index.html">Home</a><a href="work.html">Work</a><a href="services.html">Services</a><a href="about.html">About</a><a href="reviews.html">Reviews</a><a href="contact.html">Contact</a>' +
          "</div>" +
          '<div class="foot-col"><b>Connect</b>' +
            '<a href="' + esc(s.instagram) + '" target="_blank" rel="noopener">Instagram</a>' +
            '<a href="mailto:' + esc(s.email) + '">' + esc(s.email) + "</a>" +
            '<a href="book.html">Book a Consultation</a>' +
            '<a href="admin.html">Client Login</a>' +
          "</div>" +
        "</div>" +
        '<div class="foot-bottom">' +
          "<span>© " + new Date().getFullYear() + " " + esc(s.name) + " — All rights reserved.</span>" +
          '<div style="display:flex;gap:1.4rem;align-items:center">' +
            '<a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms</a>' +
            '<a class="icon-btn" href="' + esc(s.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram" style="width:34px;height:34px">' + IG_ICON + "</a>" +
          "</div>" +
        "</div>" +
      "</div>";
    document.body.appendChild(foot);
  }

  /* ---------------- reveal on scroll ---------------- */
  function initReveal() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal, .reveal-img").forEach((el, i) => {
      if (!el.style.transitionDelay) el.style.transitionDelay = (i % 6) * 70 + "ms";
      io.observe(el);
    });
  }

  /* ---------------- stars ---------------- */
  const stars = n => "★".repeat(n) + '<span style="opacity:.25">' + "★".repeat(5 - n) + "</span>";

  /* ---------------- project cards ---------------- */
  function workCard(p, span) {
    return '<a class="work-card reveal ' + (span || "span-6") + '" href="project.html?id=' + encodeURIComponent(p.id) + '">' +
      '<div class="wc-media" style="--ar:' + (span === "span-7" || span === "span-12" ? "16/9" : "4/5") + '"><img src="' + esc(p.cover) + '" alt="' + esc(p.title) + ' — ' + esc(p.category) + ' photography by Alwaysss" loading="lazy" decoding="async"></div>' +
      '<div class="wc-arrow">' + ARROW + "</div>" +
      '<div class="wc-overlay"><div class="wc-cat">' + esc(p.category) + '</div>' +
      '<div class="wc-title">' + esc(p.title) + '</div>' +
      '<div class="wc-meta">' + esc(p.client) + " · " + esc(p.location) + "</div></div></a>";
  }

  /* ---------------- cookie banner ---------------- */
  function initCookie() {
    if (localStorage.getItem("aw_cookie")) return;
    const bar = document.createElement("div");
    bar.className = "cookie";
    bar.innerHTML = "<p>This site uses cookies to improve your experience and understand how visitors find me (including from Instagram). No personal data is sold.</p>" +
      '<button class="btn btn-solid btn-sm" id="ck-ok">Accept</button>' +
      '<button class="btn btn-ghost btn-sm" id="ck-no">Essential only</button>';
    document.body.appendChild(bar);
    setTimeout(() => bar.classList.add("show"), 1600);
    $("#ck-ok").onclick = () => { localStorage.setItem("aw_cookie", "all"); bar.remove(); };
    $("#ck-no").onclick = () => { localStorage.setItem("aw_cookie", "essential"); bar.remove(); };
  }

  /* ---------------- homepage ---------------- */
  function initHome() {
    renderChrome("index.html");
    const s = settings();
    $("#hero-title").textContent = s.name.toUpperCase();
    $("#hero-tag").textContent = s.tagline;
    $("#hero-ig").href = s.instagram;

    const feats = projects().filter(p => p.featured).slice(0, 3);
    const spans = ["span-7", "span-5", "span-12"];
    $("#featured-grid").innerHTML = feats.map((p, i) => workCard(p, spans[i])).join("");

    $("#clients-grid").innerHTML = clients().map(c =>
      c.link ? '<a class="client-cell reveal" href="' + esc(c.link) + '">' + esc(c.name) + "<span>" + esc(c.tag) + "</span></a>"
             : '<div class="client-cell reveal">' + esc(c.name) + "<span>" + esc(c.tag) + "</span></div>").join("");

    $("#services-grid").innerHTML = services().slice(0, 6).map((sv, i) =>
      '<a class="svc-card reveal" href="services.html#svc-' + i + '"><img src="' + esc(sv.img) + '" alt="' + esc(sv.title) + '" loading="lazy" decoding="async">' +
      '<div class="svc-num">0' + (i + 1) + '</div><div class="svc-body"><h3>' + esc(sv.title) + "</h3><p>" + esc(sv.desc) + "</p></div></a>").join("");

    const approved = reviews().filter(r => r.status === "approved");
    $("#testi-grid").innerHTML = (approved.filter(r => r.featured).length ? approved.filter(r => r.featured) : approved).slice(0, 3).map(reviewCard).join("");

    $("#ig-grid").innerHTML = ["aerial-bay","portrait-dress","pool-tropical","aerial-trancoso","food-plating","portrait-beach"].map(n =>
      '<a href="' + esc(s.instagram) + '" target="_blank" rel="noopener"><img src="assets/img/' + n + '.webp" alt="Instagram travel photography by @always_shrestha" loading="lazy" decoding="async"></a>').join("");
    $("#ig-handle").textContent = s.handle;
    $("#ig-link").href = s.instagram;
  }

  function reviewCard(r) {
    const initial = esc((r.name || "?").trim().charAt(0).toUpperCase());
    return '<div class="rev-card reveal"><div class="stars">' + stars(r.rating) + "</div>" +
      "<blockquote>&ldquo;" + esc(r.text) + "&rdquo;</blockquote>" +
      '<div class="rev-who"><div class="rev-avatar">' + (r.photo ? '<img src="' + esc(r.photo) + '" alt="">' : initial) + "</div>" +
      "<div><b>" + esc(r.name) + "</b><span>" + esc(r.company) + (r.projectType ? " · " + esc(r.projectType) : "") + "</span></div></div></div>";
  }

  /* ---------------- portfolio page ---------------- */
  function initWork() {
    renderChrome("work.html");
    const grid = $("#work-grid");
    function draw(filter) {
      const list = projects().filter(p => !filter || p.category === filter);
      const spans = ["span-7", "span-5", "span-6", "span-6", "span-5", "span-7", "span-12"];
      grid.innerHTML = list.map((p, i) => workCard(p, spans[i % spans.length])).join("") ||
        '<p class="muted">No projects in this category yet — new work coming soon.</p>';
      initReveal();
    }
    const cats = ["All"].concat(Array.from(new Set(projects().map(p => p.category))));
    $("#filters").innerHTML = cats.map((c, i) => '<button class="filter-btn' + (i === 0 ? " active" : "") + '" data-cat="' + (c === "All" ? "" : esc(c)) + '">' + esc(c) + "</button>").join("");
    $("#filters").addEventListener("click", e => {
      const b = e.target.closest(".filter-btn"); if (!b) return;
      $$(".filter-btn").forEach(x => x.classList.remove("active")); b.classList.add("active");
      draw(b.dataset.cat);
    });
    draw("");
  }

  /* ---------------- project page ---------------- */
  function initProject() {
    renderChrome("work.html");
    const id = new URLSearchParams(location.search).get("id");
    const list = projects();
    const p = list.find(x => x.id === id) || list[0];
    document.title = p.title + " — " + p.category + " | Alwaysss";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", p.description.slice(0, 155));
    let og = document.querySelector('meta[property="og:image"]');
    if (!og) { og = document.createElement("meta"); og.setAttribute("property", "og:image"); document.head.appendChild(og); }
    og.setAttribute("content", settings().baseUrl + "/" + p.cover.replace("assets/", "assets/"));

    $("#proj-cat").textContent = p.category;
    $("#proj-title").textContent = p.title;
    $("#proj-hero-img").src = p.cover;
    $("#proj-hero-img").alt = p.title + " — " + p.category + " by Alwaysss";
    $("#proj-desc").textContent = p.description;
    $("#m-client").textContent = p.client;
    $("#m-loc").textContent = p.location;
    $("#m-date").textContent = p.date;
    $("#m-cat").textContent = p.category;

    $("#proj-gallery").innerHTML = (p.gallery || []).map((g, i) =>
      '<img src="' + esc(g) + '" alt="' + esc(p.title) + ' — photo ' + (i + 1) + ' by Alwaysss" loading="lazy" decoding="async" class="' + (i === 0 ? "tall" : "") + '">').join("");

    $("#proj-services").innerHTML = (p.services || []).map(x => '<span class="chip">' + esc(x) + "</span>").join("");

    if (p.testimonial && p.testimonial.text) {
      $("#proj-testi").innerHTML = '<div class="stars" style="margin-bottom:1rem">' + stars(5) + "</div>" +
        "<blockquote>&ldquo;" + esc(p.testimonial.text) + "&rdquo;</blockquote>" +
        "<cite>" + esc(p.testimonial.author) + " — " + esc(p.testimonial.role) + "</cite>";
    } else $("#proj-testi-wrap").remove();

    if (p.clientUrl) { $("#proj-client-link").href = p.clientUrl; $("#proj-client-link").style.display = ""; }
    if (p.bts) { $("#proj-bts").src = p.bts; $("#proj-bts-wrap").style.display = ""; }
    if (p.videoUrl) {
      const v = $("#proj-video");
      v.src = p.videoUrl; v.closest(".form-card").style.display = ""; 
    }

    // lightbox
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = '<button class="lb-close" aria-label="Close">&times;</button><img alt="">';
    document.body.appendChild(lb);
    $("#proj-gallery").addEventListener("click", e => {
      if (e.target.tagName !== "IMG") return;
      $(".lightbox img").src = e.target.src; lb.classList.add("open");
      document.body.style.overflow = "hidden";
    });
    lb.addEventListener("click", e => { if (e.target !== $("img", lb)) { lb.classList.remove("open"); document.body.style.overflow = ""; } });

    // share
    const url = location.href;
    const shareText = p.title + " — " + p.category + " by Alwaysss";
    $("#sh-wa").href = "https://wa.me/?text=" + encodeURIComponent(shareText + " " + url);
    $("#sh-fb").href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
    $("#sh-ig").href = settings().instagram;
    $("#sh-copy").addEventListener("click", () => {
      navigator.clipboard.writeText(url).then(() => { $("#sh-copy").textContent = "Copied!"; setTimeout(() => $("#sh-copy").textContent = "Copy link", 1800); });
    });

    // pager
    const idx = list.indexOf(p);
    const prev = list[(idx - 1 + list.length) % list.length], next = list[(idx + 1) % list.length];
    $("#pg-prev").href = "project.html?id=" + encodeURIComponent(prev.id);
    $("#pg-prev-t").textContent = prev.title;
    $("#pg-next").href = "project.html?id=" + encodeURIComponent(next.id);
    $("#pg-next-t").textContent = next.title;
  }

  /* ---------------- services page ---------------- */
  function initServices() {
    renderChrome("services.html");
    $("#services-full").innerHTML = services().map((sv, i) =>
      '<a class="svc-card reveal" id="svc-' + i + '" href="contact.html?type=' + encodeURIComponent(sv.title) + '">' +
      '<img src="' + esc(sv.img) + '" alt="' + esc(sv.title) + ' by Alwaysss" loading="lazy" decoding="async">' +
      '<div class="svc-num">' + String(i + 1).padStart(2, "0") + '</div>' +
      '<div class="svc-body"><h3>' + esc(sv.title) + "</h3><p>" + esc(sv.desc) + "</p></div></a>").join("");
  }

  /* ---------------- about page ---------------- */
  function initAbout() {
    renderChrome("about.html");
    const s = settings();
    $("#about-ig").href = s.instagram;
    const approved = reviews().filter(r => r.status === "approved");
    $("#about-reviews").innerHTML = approved.slice(0, 2).map(reviewCard).join("");
  }

  /* ---------------- reviews page ---------------- */
  function initReviews() {
    renderChrome("reviews.html");
    const approved = reviews().filter(r => r.status === "approved");
    const avg = approved.length ? (approved.reduce((a, r) => a + r.rating, 0) / approved.length) : 0;
    $("#rev-summary").innerHTML =
      '<div class="grid-2" style="align-items:center">' +
        "<div><div class=\"stars\" style=\"font-size:1.6rem\">" + stars(Math.round(avg)) + "</div>" +
        '<div class="h-lg" style="margin-top:.5rem">' + avg.toFixed(1) + '<span class="muted" style="font-size:1.1rem;font-family:var(--font-body)"> / 5</span></div>' +
        '<p class="muted">Based on ' + approved.length + " verified client reviews</p></div>" +
        '<div>' + [5,4,3,2,1].map(n => {
          const c = approved.filter(r => r.rating === n).length;
          const pct = approved.length ? Math.round(c / approved.length * 100) : 0;
          return '<div class="bar-row"><span class="bar-label">' + n + ' star' + (n > 1 ? "s" : "") + '</span><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div><span style="width:36px;text-align:right;color:var(--muted)">' + pct + "%</span></div>";
        }).join("") + "</div></div>";

    function draw() {
      const list = reviews().filter(r => r.status === "approved");
      $("#reviews-grid").innerHTML = list.map(reviewCard).join("") || '<p class="muted">Reviews will appear here once approved.</p>';
      initReveal();
    }
    draw();

    // star input
    let rating = 5;
    const starBox = $("#star-input");
    function paint() { starBox.innerHTML = [1,2,3,4,5].map(n => '<button type="button" data-n="' + n + '" style="background:none;border:0;font-size:1.9rem;color:' + (n <= rating ? "var(--accent)" : "rgba(236,232,225,.2)") + ';padding:0 .15rem">★</button>').join(""); }
    paint();
    starBox.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { rating = +b.dataset.n; paint(); } });

    const form = $("#review-form");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!validateForm(form)) return;
      const btn = $("button[type=submit]", form);
      if (btn) btn.disabled = true;
      const photoFile = $("#rv-photo").files[0];
      const photo = photoFile ? await shrinkImage(photoFile, 400) : "";
      try {
        await cloudAppend("reviews", { name: $("#rv-name").value.trim(), company: $("#rv-company").value.trim(),
          email: $("#rv-email").value.trim(), rating, projectType: $("#rv-type").value,
          text: $("#rv-text").value.trim(), photo, website: $("#rv-url").value.trim() });
        form.style.display = "none"; $("#rev-confirm").classList.add("show");
      } catch (err) {
        alert("Sorry, your review could not be sent. Please try again in a moment.");
      } finally { if (btn) btn.disabled = false; }
    });
  }

  /* ---------------- image compression (keeps uploads small) ---------------- */
  function shrinkImage(file, max) {
    return new Promise(resolve => {
      if (!/^image\//.test(file.type)) return resolve("");
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        let q = 0.82, out = c.toDataURL("image/jpeg", q);
        while (out.length > 60000 && q > 0.4) { q -= 0.1; out = c.toDataURL("image/jpeg", q); }
        resolve(out.length <= 80000 ? out : "");
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(""); };
      img.src = url;
    });
  }

  /* ---------------- form validation ---------------- */
  function validateForm(form) {
    let ok = true;
    $$(".field", form).forEach(f => f.classList.remove("invalid"));
    $$("[required]", form).forEach(el => {
      const field = el.closest(".field");
      let bad = !el.value.trim();
      if (!bad && el.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim());
      if (bad) { field.classList.add("invalid"); ok = false; }
    });
    // honeypot + time trap
    const hp = $(".hp input", form);
    if (hp && hp.value) return false;
    const t0 = +form.dataset.t0 || 0;
    if (t0 && Date.now() - t0 < 2500) return false;
    return ok;
  }

  function serialize(form) {
    const data = {};
    $$("input,select,textarea", form).forEach(el => {
      if (!el.name || el.type === "file") return;
      if (el.type === "checkbox") { if (el.checked) { (data[el.name] = data[el.name] || []).push(el.value); } }
      else data[el.name] = el.value;
    });
    return data;
  }

  /* ---------------- contact page ---------------- */
  function initContact() {
    renderChrome("contact.html");
    const s = settings();
    $("#ct-email").href = "mailto:" + s.email;
    $("#ct-email-text").textContent = s.email;
    $("#ct-ig").href = s.instagram;

    const pre = new URLSearchParams(location.search).get("type");
    if (pre) { const sel = $("#eq-type"); Array.from(sel.options).forEach(o => { if (o.value === pre) sel.value = pre; }); }

    const form = $("#enquiry-form");
    form.dataset.t0 = Date.now();
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!validateForm(form)) return;
      const btn = $("button[type=submit]", form); btn.disabled = true;
      const d = serialize(form);
      delete d["bot-field"]; d.read = false;
      // save to the shared store (shown in admin) and also send through Netlify Forms
      const fd = new FormData(form); fd.append("form-name", "enquiry"); fd.append("bot-field", "");
      const [cloud, netlify] = await Promise.allSettled([
        cloudAppend("enquiries", d),
        fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(fd).toString() })
          .then(r => { if (!r.ok) throw new Error(r.status); })
      ]);
      btn.disabled = false;
      if (cloud.status === "rejected" && netlify.status === "rejected") {
        alert("Sorry, your enquiry could not be sent. Please try again, or email " + s.email + ".");
        return;
      }
      form.style.display = "none"; $("#enq-confirm").classList.add("show");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- booking page ---------------- */
  function initBook() {
    renderChrome("contact.html");
    const s = settings();
    $("#bk-email").textContent = s.email;
    const form = $("#book-form");
    form.dataset.t0 = Date.now();
    // available slots: next 14 days, exclude Sundays
    const sel = $("#bk-slot");
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      if (d.getDay() === 0) continue;
      ["10:00", "14:00", "17:00"].forEach(h => {
        const lbl = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) + " — " + h;
        sel.insertAdjacentHTML("beforeend", '<option value="' + d.toISOString().slice(0, 10) + " " + h + '">' + lbl + "</option>");
      });
    }
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!validateForm(form)) return;
      const btn = $("button[type=submit]", form); btn.disabled = true;
      try {
        await cloudAppend("bookings", serialize(form));
      } catch (err) {
        btn.disabled = false;
        alert("Sorry, your request could not be sent. Please try again, or email " + s.email + ".");
        return;
      }
      form.style.display = "none"; $("#book-confirm").classList.add("show");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- admin ---------------- */
  function initAdmin() {
    renderChrome("");
    const gate = $("#admin-gate"), app = $("#admin-app");
    const CONTENT_KEYS = ["settings", "projects", "reviews"];
    const ADMIN_KEYS = CONTENT_KEYS.concat(["enquiries", "bookings"]);
    const fallback = k => (k === "enquiries" || k === "bookings") ? [] : SEED(k);

    // re-read a key from the cloud just before changing it, so visitor submissions aren't overwritten
    const fresh = async k => (DATA[k] = await cloudGet(k, DATA[k] || fallback(k)));
    async function save(key, val) {
      try { await cloudSet(key, val); DATA[key] = val; return true; }
      catch (err) {
        alert("Save failed — your change was NOT saved.\n\n" + (err.message === "Forbidden" ? "Your login has expired. Please log out and log in again." : "Error: " + err.message + ". Check your connection and try again."));
        return false;
      }
    }

    // a protected read: 200 = correct token, 403 = wrong token
    async function verifyToken() {
      try {
        const r = await fetch("/.netlify/functions/store?key=enquiries", { headers: { "x-admin-token": sessionStorage.getItem("adminToken") || "" }, cache: "no-store" });
        return r.status;
      } catch (e) { return 0; }
    }

    async function unlock() {
      const token = sessionStorage.getItem("adminToken") || "";
      await Promise.all(ADMIN_KEYS.map(async k => {
        let res;
        try { res = await fetch("/.netlify/functions/store?key=" + k, { headers: { "x-admin-token": token }, cache: "no-store" }); } catch (e) {}
        if (!res || !res.ok) { DATA[k] = DATA[k] || fallback(k); return; }
        const v = await res.json();
        DATA[k] = v === null ? fallback(k) : v;
        // first login after going live: save the defaults to the cloud, so visitor reviews never replace them
        if (v === null && CONTENT_KEYS.includes(k)) await cloudSet(k, DATA[k]).catch(() => {});
      }));
      gate.style.display = "none"; app.style.display = "";
      if (LOCAL.get("projects") || LOCAL.get("reviews") || LOCAL.get("enquiries")) $("#import-wrap").style.display = "";
      drawProjects(); drawAdminReviews(); drawEnquiries(); fillSettings();
      $$(".admin-tab")[0].click(); drawStats();
    }

    async function login() {
      const status = await verifyToken();
      if (status === 200) { $("#gate-err").style.display = "none"; return unlock(); }
      sessionStorage.removeItem("adminToken");
      $("#gate-err").textContent = status === 403 ? "Wrong password" : "Could not reach the server. Please try again.";
      $("#gate-err").style.display = "block";
    }
    if (sessionStorage.getItem("adminToken")) login().then(() => $("#gate-err").style.display = "none");
    $("#gate-form").addEventListener("submit", e => {
      e.preventDefault();
      sessionStorage.setItem("adminToken", $("#gate-pass").value);
      $("#gate-pass").value = "";
      login();
    });
    $("#admin-logout").addEventListener("click", () => { sessionStorage.removeItem("adminToken"); location.reload(); });

    $$(".admin-tab").forEach(t => t.addEventListener("click", () => {
      $$(".admin-tab").forEach(x => x.classList.remove("active")); t.classList.add("active");
      $$(".admin-panel").forEach(p => p.classList.remove("active"));
      $("#panel-" + t.dataset.panel).classList.add("active");
      if (t.dataset.panel === "stats") drawStats();
    }));

    /* --- projects --- */
    function drawProjects() {
      $("#proj-rows").innerHTML = projects().map((p, i) =>
        "<tr><td><b>" + esc(p.title) + '</b><br><span class="muted" style="font-size:.8rem">' + esc(p.category) + " · " + esc(p.location) + '</span></td>' +
        "<td>" + (p.featured ? '<span class="badge featured">Featured</span>' : '<span class="badge read">—</span>') + "</td>" +
        '<td><div class="admin-actions">' +
          '<button class="mini-btn" data-act="feat" data-id="' + esc(p.id) + '">' + (p.featured ? "Unfeature" : "Feature") + "</button>" +
          '<button class="mini-btn" data-act="up" data-id="' + esc(p.id) + '"' + (i === 0 ? " disabled" : "") + ">↑</button>" +
          '<button class="mini-btn" data-act="down" data-id="' + esc(p.id) + '"' + (i === projects().length - 1 ? " disabled" : "") + ">↓</button>" +
          '<button class="mini-btn danger" data-act="del" data-id="' + esc(p.id) + '">Delete</button>' +
        "</div></td></tr>").join("");
    }
    $("#proj-rows").addEventListener("click", async e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.act === "del" && !confirm("Delete this project?")) return;
      const list = await fresh("projects"); const i = list.findIndex(p => p.id === b.dataset.id);
      if (i < 0) return drawProjects();
      if (b.dataset.act === "del") { list.splice(i, 1); }
      if (b.dataset.act === "feat") { list[i].featured = !list[i].featured; }
      if (b.dataset.act === "up" && i > 0) { [list[i - 1], list[i]] = [list[i], list[i - 1]]; }
      if (b.dataset.act === "down" && i < list.length - 1) { [list[i + 1], list[i]] = [list[i], list[i + 1]]; }
      await save("projects", list); drawProjects();
    });
    $("#proj-add").addEventListener("submit", async e => {
      e.preventDefault();
      const f = e.target;
      const list = await fresh("projects");
      list.unshift({
        id: uid(), title: $("#np-title").value.trim(), client: $("#np-client").value.trim(),
        location: $("#np-loc").value.trim(), date: $("#np-date").value || String(new Date().getFullYear()),
        category: $("#np-cat").value, featured: $("#np-feat").checked,
        description: $("#np-desc").value.trim(),
        cover: $("#np-cover").value.trim() || "assets/img/hero.webp",
        gallery: $("#np-gallery").value.split("\n").map(x => x.trim()).filter(Boolean),
        services: $("#np-svc").value.split(",").map(x => x.trim()).filter(Boolean),
        videoUrl: "", bts: "", clientUrl: "", testimonial: { text: "", author: "", role: "" }
      });
      if (await save("projects", list)) { f.reset(); alert("Project added."); }
      drawProjects();
    });

    /* --- reviews moderation --- */
    function drawAdminReviews() {
      const list = reviews();
      $("#rev-rows").innerHTML = list.map(r =>
        "<tr><td><b>" + esc(r.name) + '</b><br><span class="muted" style="font-size:.8rem">' + esc(r.company) + " · " + esc(r.projectType) + '</span><br><span class="stars" style="font-size:.8rem">' + stars(r.rating) + '</span></td>' +
        "<td style='max-width:340px'>" + esc(r.text) + "</td>" +
        "<td>" + (r.featured ? '<span class="badge featured">Featured</span> ' : "") +
          '<span class="badge ' + esc(r.status) + '">' + esc(r.status) + "</span></td>" +
        '<td><div class="admin-actions">' +
          (r.status === "pending" ? '<button class="mini-btn ok" data-act="approve" data-id="' + esc(r.id) + '">Approve</button><button class="mini-btn danger" data-act="reject" data-id="' + esc(r.id) + '">Reject</button>' : "") +
          '<button class="mini-btn" data-act="feature" data-id="' + esc(r.id) + '">' + (r.featured ? "Unfeature" : "Feature") + "</button>" +
          '<button class="mini-btn" data-act="edit" data-id="' + esc(r.id) + '">Edit</button>' +
          '<button class="mini-btn danger" data-act="del" data-id="' + esc(r.id) + '">Delete</button>' +
        "</div></td></tr>").join("") || '<tr><td colspan="4" class="muted">No reviews yet.</td></tr>';
    }
    $("#rev-rows").addEventListener("click", async e => {
      const b = e.target.closest("button"); if (!b) return;
      const act = b.dataset.act;
      if (act === "del" && !confirm("Delete this review?")) return;
      let nt = null;
      if (act === "edit") { const cur = reviews().find(x => x.id === b.dataset.id); nt = prompt("Edit review text:", cur ? cur.text : ""); if (nt === null) return; }
      const list = await fresh("reviews"); const r = list.find(x => x.id === b.dataset.id);
      if (!r) return drawAdminReviews();
      if (act === "approve") r.status = "approved";
      if (act === "reject") r.status = "rejected";
      if (act === "feature") r.featured = !r.featured;
      if (act === "del") list.splice(list.indexOf(r), 1);
      if (act === "edit") r.text = nt.trim() || r.text;
      await save("reviews", list); drawAdminReviews();
    });

    /* --- enquiries / bookings --- */
    function drawEnquiries() {
      const list = DATA.enquiries || [];
      $("#enq-rows").innerHTML = list.map(q =>
        "<tr><td><b>" + esc(q.name) + '</b><br><span class="muted" style="font-size:.8rem">' + esc(q.email) + " · " + esc(q.phone || "—") + '</span></td>' +
        "<td>" + esc(q.projectType || "—") + "<br><span class='muted' style='font-size:.8rem'>" + esc(q.location || "") + " · " + esc(q.budget || "") + "</span></td>" +
        "<td style='max-width:320px'>" + esc(q.description || "") + "</td>" +
        "<td>" + (q.read ? '<span class="badge read">Read</span>' : '<span class="badge pending">New</span>') + '<br><br><div class="admin-actions">' +
          '<button class="mini-btn ok" data-act="read" data-id="' + esc(q.id) + '">Mark read</button>' +
          '<a class="mini-btn" href="mailto:' + esc(q.email) + '?subject=' + encodeURIComponent("Re: Your enquiry — " + (q.projectType || "project")) + '">Reply</a>' +
          '<button class="mini-btn danger" data-act="del" data-id="' + esc(q.id) + '">Delete</button></div></td></tr>'
      ).join("") || '<tr><td colspan="4" class="muted">No enquiries yet.</td></tr>';
      $("#bk-rows").innerHTML = (DATA.bookings || []).map(bk =>
        "<tr><td><b>" + esc(bk.name) + '</b><br><span class="muted" style="font-size:.8rem">' + esc(bk.email) + " · " + esc(bk.phone || "") + "</span></td>" +
        "<td>" + esc(bk.slot || "—") + "</td><td>" + esc(bk.projectType || "") + "</td>" +
        "<td style='max-width:280px'>" + esc(bk.message || "") + "</td>" +
        '<td><button class="mini-btn danger" data-act="delbk" data-id="' + esc(bk.id) + '">Delete</button></td></tr>'
      ).join("") || '<tr><td colspan="5" class="muted">No consultation requests yet.</td></tr>';
    }
    $("#enq-rows").addEventListener("click", async e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.act === "del" && !confirm("Delete this enquiry?")) return;
      const list = await fresh("enquiries"); const q = list.find(x => x.id === b.dataset.id);
      if (!q) return drawEnquiries();
      if (b.dataset.act === "read") q.read = true;
      if (b.dataset.act === "del") list.splice(list.indexOf(q), 1);
      await save("enquiries", list); drawEnquiries();
    });
    $("#bk-rows").addEventListener("click", async e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.act !== "delbk" || !confirm("Delete this booking request?")) return;
      const list = await fresh("bookings"); const bk = list.find(x => x.id === b.dataset.id);
      if (bk) { list.splice(list.indexOf(bk), 1); await save("bookings", list); }
      drawEnquiries();
    });

    /* --- settings --- */
    function fillSettings() {
      const st = settings();
      $("#set-name").value = st.name; $("#set-email").value = st.email; $("#set-ig").value = st.instagram;
      $("#set-ga").value = st.gaId;
    }
    $("#set-form").addEventListener("submit", async e => {
      e.preventDefault();
      const cur = settings();
      delete cur.adminPassword;
      const ok = await save("settings", Object.assign({}, cur, {
        name: $("#set-name").value.trim() || cur.name,
        email: $("#set-email").value.trim() || cur.email,
        instagram: $("#set-ig").value.trim() || cur.instagram,
        gaId: $("#set-ga").value.trim()
      }));
      if (ok) alert("Settings saved.");
    });
    $("#reset-btn").addEventListener("click", async () => {
      if (!confirm("Reset all projects, reviews and settings to defaults? Enquiries and bookings are kept. This cannot be undone.")) return;
      for (const k of CONTENT_KEYS) { if (!(await save(k, SEED(k)))) return; }
      location.reload();
    });

    /* --- one-time import of data saved in this browser before the cloud switch --- */
    $("#import-btn").addEventListener("click", async () => {
      if (!confirm("Upload the projects, reviews, settings, enquiries and bookings saved in THIS browser to the live site? Cloud projects and settings will be replaced; reviews, enquiries and bookings are merged.")) return;
      for (const k of ADMIN_KEYS) {
        const local = LOCAL.get(k); if (!local) continue;
        let val = local;
        if (k === "settings") { val = Object.assign({}, local); delete val.adminPassword; }
        if (Array.isArray(local) && k !== "projects") {
          const cloud = await fresh(k);
          const ids = new Set(local.map(x => x.id));
          val = local.concat(cloud.filter(x => !ids.has(x.id)));
        }
        if (!(await save(k, val))) return;
      }
      ADMIN_KEYS.concat(["clients", "services", "seeded"]).forEach(k => localStorage.removeItem("aw_" + k));
      alert("Import complete — your local data is now live.");
      location.reload();
    });

    /* --- stats --- */
    function drawStats() {
      const a = LOCAL.get("analytics", []);
      const total = a.length;
      const byPage = {}; a.forEach(x => byPage[x.p] = (byPage[x.p] || 0) + 1);
      const byRef = {}; a.forEach(x => { const r = x.ref ? (x.ref.includes("instagram") ? "Instagram" : x.ref.includes("facebook") ? "Facebook" : x.ref.includes("google") ? "Google" : "Other site") : "Direct / typed"; byRef[r] = (byRef[r] || 0) + 1; });
      const mobile = a.filter(x => /Mobi|Android|iPhone/i.test(x.ua)).length;
      $("#stat-cards").innerHTML =
        '<div class="stat-card"><b>' + total + '</b><span>Total page views</span></div>' +
        '<div class="stat-card"><b>' + Math.round((mobile / (total || 1)) * 100) + '%</b><span>Mobile visitors</span></div>' +
        '<div class="stat-card"><b>' + (DATA.enquiries || []).length + '</b><span>Enquiries</span></div>' +
        '<div class="stat-card"><b>' + reviews().filter(r => r.status === "pending").length + '</b><span>Pending reviews</span></div>';
      const max = Math.max(1, ...Object.values(byPage));
      $("#stat-pages").innerHTML = Object.entries(byPage).sort((x, y) => y[1] - x[1]).slice(0, 8).map(([p, c]) =>
        '<div class="bar-row"><span class="bar-label" title="' + esc(p) + '">' + esc(p) + '</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.round(c / max * 100) + '%"></div></div><span style="width:36px;text-align:right;color:var(--muted)">' + c + "</span></div>").join("") || '<p class="muted">No data yet.</p>';
      const maxR = Math.max(1, ...Object.values(byRef));
      $("#stat-refs").innerHTML = Object.entries(byRef).sort((x, y) => y[1] - x[1]).map(([r, c]) =>
        '<div class="bar-row"><span class="bar-label">' + esc(r) + '</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.round(c / maxR * 100) + '%"></div></div><span style="width:36px;text-align:right;color:var(--muted)">' + c + "</span></div>").join("") || '<p class="muted">No data yet.</p>';
    }
  }

  /* ---------------- boot ---------------- */
  (async function boot() {
    await load(["settings", "projects", "reviews"]);
    const page = document.body.dataset.page;
    const init = {
      home: initHome, work: initWork, project: initProject, services: initServices,
      about: initAbout, reviews: initReviews, contact: initContact, book: initBook, admin: initAdmin
    }[page];
    if (page === "privacy" || page === "terms") renderChrome("");
    if (init) init(); else if (page !== "privacy" && page !== "terms") renderChrome("");
    initReveal();
    initCookie();
    track();
  })();
})();
