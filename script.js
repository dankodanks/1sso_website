(() => {
  document.documentElement.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* =========================================================
     Toast + copy buttons
     ========================================================= */
  const toastEl = $("#toast");
  let toastTimer = null;
  function toast(msg, ms = 2000) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), ms);
  }

  $$(".copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        toast("copied ✔");
      } catch {
        toast("press Ctrl+C to copy");
      }
      const old = btn.textContent;
      btn.textContent = "copied";
      btn.classList.add("is-done");
      setTimeout(() => { btn.textContent = old; btn.classList.remove("is-done"); }, 1400);
    });
  });

  /* =========================================================
     Mobile nav
     ========================================================= */
  const toggle = $(".nav__toggle");
  const links = $("#nav-links");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* =========================================================
     Hero: messy .env -> one line
     ========================================================= */
  const messy = [
    ["OPENAI_API_KEY", "sk-proj-x9Fq2LmT0aVbN7"],
    ["SUPABASE_URL", "https://xkqzpd.supabase.co"],
    ["SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5"],
    ["SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiJ9.x7"],
    ["DATABASE_URL", "postgres://u:p4ss@db.xk:5432"],
    ["GOOGLE_CLIENT_ID", "8841-q0z7.apps.googleuser"],
    ["GOOGLE_CLIENT_SECRET", "GOCSPX-a8Zk_1rQ0mW"],
    ["GOOGLE_MAPS_KEY", "AIzaSyB-9fT2kQ_vL0xR"],
    ["YOUTUBE_API_KEY", "AIzaSyD3m-Wq81hXz0c"],
    ["SPOTIFY_CLIENT_ID", "c4f19a02b7e84d5e9a"],
    ["SPOTIFY_CLIENT_SECRET", "7be0d1f66a3c4b28"],
    ["SPOTIFY_REDIRECT_URI", "http://localhost:3000/cb"],
    ["NEXTAUTH_SECRET", "kP3v9QzX1mL0aT7r"],
    ["NEXTAUTH_URL", "http://localhost:3000"],
    ["JWT_SECRET", "9d2f7a1c0b8e4635f1a7"],
    ["GA_MEASUREMENT_ID", "G-4XK29QZP7M"],
    ["GOOGLE_PLAY_SA_JSON", "{\"type\":\"service_account\"…"],
    ["F1_API_KEY", "f1_7cQw2Zp9XaL0"],
    ["S3_BUCKET", "my-app-uploads-prod"],
    ["S3_ACCESS_KEY", "AKIAIOSFODNN7EXAMPLE"],
    ["S3_SECRET_KEY", "wJalrXUtnFEMI/K7MDENG"],
    ["RESEND_API_KEY", "re_8Hk2Pq_nV0xZ"],
    ["SENTRY_DSN", "https://a1b2c3@o123.ingest"],
    ["STRIPE_SECRET_KEY", "sk_test_51Nq0vX2eZv"],
    ["WEBHOOK_SECRET", "whsec_2fK8pLm0Qa9"]
  ];

  const messyEl = $("#messy");
  messyEl.innerHTML = messy
    .map(([k, v], i) => `<span class="ln" style="--i:${i}"><span class="k">${k}</span>=<span class="v">${v}</span></span>`)
    .join("");

  const cmp = $("#envcmp");
  const OLD_MS = 1800;   // how long the messy "old way" is shown
  const NEW_MS = 4200;   // how long the 1SSO "new way" is shown
  let loopTimer = null;
  let inView = false;
  let hovering = false;

  // old way -> (wait) -> 1SSO way -> (wait) -> old way -> ...
  function loopStep(merged) {
    clearTimeout(loopTimer);
    cmp.classList.toggle("is-merged", merged);
    if (reduceMotion) { cmp.classList.add("is-merged"); return; }
    loopTimer = setTimeout(() => {
      // pause while the user is hovering or the block is off-screen
      if (hovering || !inView) { loopStep(merged); return; }
      loopStep(!merged);
    }, merged ? NEW_MS : OLD_MS);
  }

  if ("IntersectionObserver" in window) {
    let started = false;
    new IntersectionObserver((entries) => {
      inView = entries.some((e) => e.isIntersecting);
      if (inView && !started) { started = true; loopStep(false); }
    }, { threshold: 0.35 }).observe(cmp);
  } else {
    cmp.classList.add("is-merged");
  }
  cmp.addEventListener("mouseenter", () => { hovering = true; });
  cmp.addEventListener("mouseleave", () => { hovering = false; });
  $("#replay").addEventListener("click", () => loopStep(false));

  /* =========================================================
     API directory (search + category + toggles)
     ========================================================= */
  const apis = [
    { n: "Google Maps",     d: "Maps, places, geocoding", cat: "google", c: "#34a853", g: "📍" },
    { n: "Google Login",    d: "Sign-in, if you enable it", cat: "google", c: "#4285f4", g: "G" },
    { n: "YouTube",         d: "Videos, channels, search", cat: "google", c: "#ff0033", g: "▶" },
    { n: "Google Analytics",d: "Your key, in the dashboard", cat: "google", c: "#f9ab00", g: "📈" },
    { n: "Google Play",     d: "Apps, reviews, stats", cat: "google", c: "#01875f", g: "▷" },
    { n: "Spotify",         d: "Tracks, playlists, artists", cat: "media", c: "#1db954", g: "♫" },
    { n: "TMDB",            d: "Movies & TV metadata", cat: "media", c: "#01b4e4", g: "🎬" },
    { n: "Giphy",           d: "GIFs & stickers", cat: "media", c: "#9b5de5", g: "✺" },
    { n: "Unsplash",        d: "Photography", cat: "media", c: "#2b2b2b", g: "📷" },
    { n: "Formula 1",       d: "Races, drivers, lap data", cat: "data", c: "#e10600", g: "🏁" },
    { n: "OpenWeather",     d: "Forecasts & climate", cat: "data", c: "#eb6e4b", g: "☀" },
    { n: "NASA",            d: "APOD, Mars rovers, NEOs", cat: "data", c: "#0b3d91", g: "🚀" },
    { n: "CoinGecko",       d: "Crypto prices & markets", cat: "data", c: "#6bbf4e", g: "₿" },
    { n: "PokéAPI",         d: "Pokémon data", cat: "data", c: "#ee4035", g: "◓" },
    { n: "OpenAI",          d: "Your key, in the dashboard", cat: "ai", c: "#10a37f", g: "✦" },
    { n: "Supabase",        d: "Your project, in the dashboard", cat: "ai", c: "#3ecf8e", g: "⚡" },
    { n: "GitHub",          d: "Repos, issues, users", cat: "ai", c: "#30363d", g: "⌥" },
    { n: "Resend",          d: "Your key, in the dashboard", cat: "ai", c: "#111111", g: "✉" }
  ];

  const grid = $("#api-grid");
  const search = $("#api-search");
  const chipsWrap = $("#api-chips");
  const empty = $("#api-empty");
  const status = $("#api-status");
  const on = new Set();
  let cat = "all";

  function renderApis() {
    const q = search.value.trim().toLowerCase();
    const list = apis.filter((a) =>
      (cat === "all" || a.cat === cat) &&
      (!q || (a.n + " " + a.d + " " + a.cat).toLowerCase().includes(q))
    );
    grid.innerHTML = list.map((a) => `
      <li>
        <button type="button" class="api${on.has(a.n) ? " is-on" : ""}" data-n="${a.n}" aria-pressed="${on.has(a.n)}">
          <span class="api__logo" style="--c:${a.c}" aria-hidden="true">${a.g}</span>
          <span class="api__txt"><b>${a.n}</b><small>${a.d}</small></span>
          <span class="api__sw" aria-hidden="true"></span>
        </button>
      </li>`).join("");
    empty.hidden = list.length > 0;
  }

  function renderStatus() {
    status.innerHTML = `<b>${on.size}</b> marked in this preview · <span class="ok">.env stays 1 line</span>`;
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".api[data-n]");
    if (!btn) return;
    const n = btn.dataset.n;
    on.has(n) ? on.delete(n) : on.add(n);
    btn.classList.toggle("is-on", on.has(n));
    btn.setAttribute("aria-pressed", String(on.has(n)));
    renderStatus();
  });
  search.addEventListener("input", renderApis);
  chipsWrap.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    cat = chip.dataset.cat;
    $$(".chip", chipsWrap).forEach((c) => c.classList.toggle("is-active", c === chip));
    renderApis();
  });
  renderApis();
  renderStatus();

  /* =========================================================
     Plain-English backend configurator (preview mockup)
     ========================================================= */
  const usecases = {
    login: {
      title: "User accounts", pill: "your key", inc: true,
      items: ["Providers you enable for the project", "App calls 1SSO with the project key", "Configured in the dashboard, not auto-provisioned"]
    },
    data: {
      title: "Database for user data", pill: "coming soon",
      items: ["Planned: tables for profiles and user data", "Not created in the first release", "No managed database yet"]
    },
    images: {
      title: "Image uploads", pill: "coming soon",
      items: ["Planned: file storage for uploads", "Not created in the first release", "No buckets yet"]
    },
    live: {
      title: "Live updates", pill: "coming soon",
      items: ["Planned: realtime updates", "Not created in the first release", "Not part of the launch"]
    },
    auto: {
      title: "Automations", pill: "coming soon",
      items: ["Planned: jobs and webhooks", "Not created in the first release", "Not part of the launch"]
    }
  };

  const keywords = {
    login:  /log ?in|sign ?(in|up)|account|auth|password|user/i,
    data:   /save|store|data|profile|database|settings|record|list|post/i,
    images: /photo|image|picture|avatar|upload|file|pic/i,
    live:   /chat|live|real-?time|multiplayer|notif|feed|collab/i,
    auto:   /email|schedule|cron|webhook|remind|automat|every (day|night|week|hour)/i
  };

  const describe = $("#describe");
  const ucWrap = $("#usecases");
  const plan = $("#plan");
  const planNote = $("#plan-note");
  const provisionBtn = $("#provision");
  const picked = new Set();
  let provisioning = false;

  function renderPlan() {
    const keys = Object.keys(usecases).filter((k) => picked.has(k));
    $$(".usecase", ucWrap).forEach((b) => b.classList.toggle("is-on", picked.has(b.dataset.uc)));

    if (!keys.length) {
      plan.innerHTML = `<p class="plan__empty">Nothing yet. Describe a use-case or tick a box to see what the key covers and what is still coming.</p>`;
      planNote.textContent = "";
      return;
    }
    plan.innerHTML = keys.map((k) => {
      const u = usecases[k];
      return `<div class="plan__item" data-k="${k}">
        <header>${u.title}<span class="pill${u.inc ? " pill--inc" : ""}">${u.pill}</span></header>
        <ul>${u.items.map((i) => `<li>${i}</li>`).join("")}</ul>
      </div>`;
    }).join("");
    const needsLater = keys.some((k) => !usecases[k].inc);
    planNote.textContent = needsLater
      ? "Database, storage, and jobs are coming soon — this preview provisions nothing"
      : "Auth uses the project key. You still configure providers in the dashboard.";
  }

  describe.addEventListener("input", () => {
    const text = describe.value;
    picked.clear();
    Object.keys(keywords).forEach((k) => { if (keywords[k].test(text)) picked.add(k); });
    renderPlan();
  });

  ucWrap.addEventListener("click", (e) => {
    const b = e.target.closest(".usecase");
    if (!b) return;
    const k = b.dataset.uc;
    picked.has(k) ? picked.delete(k) : picked.add(k);
    renderPlan();
  });

  provisionBtn.addEventListener("click", () => {
    const items = $$(".plan__item", plan);
    if (!items.length) { toast("tick a use-case first"); return; }
    if (provisioning) return;
    provisioning = true;
    items.forEach((el) => el.classList.remove("is-done", "is-busy"));
    const step = reduceMotion ? 0 : 650;
    items.forEach((el, i) => {
      setTimeout(() => el.classList.add("is-busy"), i * step);
      setTimeout(() => {
        el.classList.remove("is-busy");
        el.classList.add("is-done");
        if (i === items.length - 1) {
          provisioning = false;
          toast("roadmap preview only — nothing was provisioned");
        }
      }, i * step + (reduceMotion ? 0 : 550));
    });
  });

  // seed with the example prompt
  describe.dispatchEvent(new Event("input"));

  /* =========================================================
     Room scene: particles, sound, easter eggs
     ========================================================= */
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const scene = $("#scene");

  // spawn an emoji inside the scene at (x%, y%)
  function fx(char, x, y, opts = {}) {
    if (reduceMotion) return;
    const el = document.createElement("span");
    el.className = "fx";
    el.textContent = char;
    el.style.left = x + "%";
    el.style.top = y + "%";
    el.style.setProperty("--dx", (opts.dx ?? rand(-30, 30)) + "px");
    el.style.setProperty("--dy", (opts.dy ?? rand(70, 120)) + "px");
    el.style.setProperty("--rot", rand(-25, 25) + "deg");
    el.style.setProperty("--dur", (opts.dur ?? rand(1.3, 2)) + "s");
    scene.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }

  function burst(chars, x, y, n = 8) {
    for (let i = 0; i < n; i++) {
      fx(pick(chars), x + rand(-4, 4), y + rand(-3, 3), { dx: rand(-70, 70), dy: rand(40, 130) });
    }
  }

  // full-viewport rain (konami, secret file)
  function rain(chars, n = 40) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        const el = document.createElement("span");
        el.className = "fx fx--fixed";
        el.textContent = pick(chars);
        el.style.left = rand(2, 98) + "vw";
        el.style.top = "-5vh";
        el.style.setProperty("--dx", rand(-40, 40) + "px");
        el.style.setProperty("--dy", -(window.innerHeight * 1.15) + "px");
        el.style.setProperty("--dur", rand(2, 3.4) + "s");
        document.body.appendChild(el);
        el.addEventListener("animationend", () => el.remove());
      }, i * 55);
    }
  }

  // synthesised sound (no assets). Starts only after a click.
  let ac = null;
  function audio() {
    if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ac = new AC(); }
    if (ac && ac.state === "suspended") ac.resume();
    return ac;
  }

  function meow(pitch = 1) {
    const a = audio(); if (!a) return;
    const t = a.currentTime;
    const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(420 * pitch, t);
    o.frequency.exponentialRampToValueAtTime(880 * pitch, t + 0.14);
    o.frequency.exponentialRampToValueAtTime(520 * pitch, t + 0.55);
    f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 1.4;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(f).connect(g).connect(a.destination);
    o.start(t); o.stop(t + 0.65);
  }

  function blip(freq = 660, dur = 0.12, type = "square", vol = 0.06) {
    const a = audio(); if (!a) return;
    const t = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur);
  }

  function arpeggio(notes, step = 0.07) {
    notes.forEach((n, i) => setTimeout(() => blip(n, 0.14, "triangle", 0.08), i * step * 1000));
  }

  /* ---- lofi loop (logo easter egg) ---- */
  const chords = [
    [130.81, 329.63, 392.0, 493.88, 587.33], // Cmaj9
    [110.0, 329.63, 392.0, 493.88, 523.25],  // Am9
    [146.83, 349.23, 440.0, 523.25, 659.25], // Dm9
    [98.0, 349.23, 493.88, 659.25]           // G13
  ];
  const lofi = { on: false, master: null, id: null, next: 0, step: 0, noise: null };

  function noiseBuffer(a) {
    const buf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function scheduleLofi() {
    const a = ac; if (!a || !lofi.on) return;
    const beat = 60 / 72;
    while (lofi.next < a.currentTime + 0.6) {
      const t = lofi.next, s = lofi.step % 16;
      if (s === 0) {
        const chord = chords[Math.floor(lofi.step / 16) % chords.length];
        chord.forEach((fr, i) => {
          const o = a.createOscillator(), g = a.createGain(), lp = a.createBiquadFilter();
          o.type = i === 0 ? "sine" : "triangle";
          o.frequency.value = fr * (1 + rand(-0.002, 0.002));
          lp.type = "lowpass"; lp.frequency.value = 1100;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(i === 0 ? 0.11 : 0.04, t + 0.08);
          g.gain.exponentialRampToValueAtTime(0.0001, t + beat * 4);
          o.connect(lp).connect(g).connect(lofi.master);
          o.start(t); o.stop(t + beat * 4 + 0.05);
        });
      }
      if (s === 0 || s === 8) {
        const o = a.createOscillator(), g = a.createGain();
        o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
        g.gain.setValueAtTime(0.28, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.connect(g).connect(lofi.master); o.start(t); o.stop(t + 0.22);
      }
      if (s === 4 || s === 12 || s % 4 === 2) {
        const n = a.createBufferSource(), g = a.createGain(), hp = a.createBiquadFilter();
        const snare = s === 4 || s === 12;
        n.buffer = lofi.noise;
        hp.type = "highpass"; hp.frequency.value = snare ? 1800 : 6500;
        g.gain.setValueAtTime(snare ? 0.12 : 0.04, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (snare ? 0.14 : 0.04));
        n.connect(hp).connect(g).connect(lofi.master); n.start(t); n.stop(t + 0.2);
      }
      lofi.next += beat / 4;
      lofi.step++;
    }
  }

  const brandIcon = $(".brand__icon");
  function toggleLofi() {
    const a = audio(); if (!a) { toast("your browser can't play audio :("); return; }
    if (!lofi.on) {
      lofi.master = a.createGain();
      lofi.master.gain.setValueAtTime(0.0001, a.currentTime);
      lofi.master.gain.exponentialRampToValueAtTime(0.5, a.currentTime + 1.2);
      lofi.master.connect(a.destination);
      lofi.noise = noiseBuffer(a);
      lofi.on = true; lofi.next = a.currentTime + 0.1; lofi.step = 0;
      lofi.id = setInterval(scheduleLofi, 150);
      scheduleLofi();
      toast("♪ lofi radio on — click the logo again to stop", 2800);
      brandIcon.classList.add("is-playing");
    } else {
      lofi.on = false; clearInterval(lofi.id);
      const m = lofi.master;
      m.gain.cancelScheduledValues(a.currentTime);
      m.gain.setValueAtTime(m.gain.value || 0.3, a.currentTime);
      m.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.6);
      setTimeout(() => m.disconnect(), 800);
      toast("♪ lofi radio off");
      brandIcon.classList.remove("is-playing");
    }
  }
  brandIcon.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); toggleLofi(); });

  /* ---- hotspots ---- */
  const spots = {
    bedcat:   { x: 75.5, y: 41 },
    floorcat: { x: 7,    y: 84 },
    lamp:     { x: 10,   y: 45 },
    mug:      { x: 29,   y: 58 },
    monitor:  { x: 34,   y: 40 },
    window:   { x: 87,   y: 14 },
    folder:   { x: 21,   y: 65 }
  };
  const state = { pets: 0, sips: 0, wishes: 0, floorPokes: 0, folderOpens: 0 };

  const loops = {};
  function stopLoop(name) { clearInterval(loops[name]); loops[name] = null; }
  function startLoop(name, fn, every) { stopLoop(name); fn(); loops[name] = setInterval(fn, every); }

  const hover = {
    bedcat: {
      enter() { startLoop("bedcat", () => fx(pick(["♥", "💗", "♥"]), spots.bedcat.x + rand(-4, 4), spots.bedcat.y), 420); },
      leave() { stopLoop("bedcat"); }
    },
    floorcat: {
      enter() {
        let i = 0;
        startLoop("floorcat", () => fx(["z", "Z", "💤"][i++ % 3], spots.floorcat.x + rand(0, 6), spots.floorcat.y - 2, { dy: 80 }), 520);
      },
      leave() { stopLoop("floorcat"); }
    },
    window: {
      enter() {
        if (reduceMotion) return;
        const s = document.createElement("i");
        s.className = "shoot";
        s.style.left = rand(76, 88) + "%";
        s.style.top = rand(4, 12) + "%";
        scene.appendChild(s);
        s.addEventListener("animationend", () => s.remove());
      },
      leave() {}
    }
  };

  const click = {
    bedcat() {
      state.pets++;
      meow(rand(0.9, 1.15));
      burst(["♥", "💖", "🐾"], spots.bedcat.x, spots.bedcat.y, 7);
      if (state.pets === 1) toast("purrrr… she likes you");
      else if (state.pets === 7) { toast("🐾 the cat council approves of you"); scene.classList.add("wiggle"); setTimeout(() => scene.classList.remove("wiggle"), 600); }
      else if (state.pets === 15) toast("ok that's enough pets. (it is not.)");
      else if (state.pets % 10 === 0) toast(`${state.pets} pets delivered`);
    },
    floorcat() {
      state.floorPokes++;
      meow(rand(0.6, 0.75));
      burst(["💢", "😾", "z"], spots.floorcat.x + 3, spots.floorcat.y, 5);
      toast(state.floorPokes === 1 ? "shhh… she's dreaming of keyboards" : pick(["…5 more minutes", "mrrp. do not disturb.", "she rolled over. no sprint today."]));
    },
    lamp() {
      const off = scene.classList.toggle("lights-off");
      blip(off ? 320 : 520, 0.08, "square", 0.05);
      toast(off ? "lights off — just you and the screens" : "lights on — cozy mode restored");
      if (off) burst(["✦"], 55, 38, 3);
    },
    mug() {
      state.sips++;
      blip(240, 0.18, "sine", 0.1);
      burst(["☕", "⚡"], spots.mug.x, spots.mug.y - 2, 4);
      if (state.sips === 3) toast("caffeine level: 3. the code is writing itself");
      else if (state.sips === 7) { toast("caffeine level: ∞ — you can see sounds now"); rain(["☕", "⚡", "✨"], 24); }
      else toast(`☕ sip #${state.sips}`);
    },
    monitor() {
      arpeggio([523, 659, 784, 1047]);
      burst(["✔", "✨", "{ }"], spots.monitor.x, spots.monitor.y, 5);
      toast("1SSO_API_KEY found ✔ auth and approved connectors use this key", 3200);
    },
    window() {
      state.wishes++;
      arpeggio([880, 1175, 1568], 0.09);
      burst(["⭐", "✦", "✨", "🌠"], spots.window.x, spots.window.y + 4, 9);
      toast(state.wishes === 1 ? "wish made ✦ (it'll ship by friday)" : pick(["another wish? greedy. i like it.", "wish #" + state.wishes + " — the stars are on it", "shipping your wish in 3s…"]));
    },
    folder() {
      state.folderOpens++;
      arpeggio([392, 523, 659, 784, 1047, 1319], 0.06);
      rain(["🔑", "🐱", "☕", "👾", "✨", "🎧", "💾"], 38);
      toast(state.folderOpens === 1 ? "🔓 the sticky note says: .env = 1 line. that's it." : "still one line. (that's the whole point.)", 3200);
    }
  };

  $$(".spot").forEach((btn) => {
    const name = btn.dataset.egg;
    if (hover[name]) {
      btn.addEventListener("mouseenter", hover[name].enter);
      btn.addEventListener("mouseleave", hover[name].leave);
      btn.addEventListener("focus", hover[name].enter);
      btn.addEventListener("blur", hover[name].leave);
    }
    btn.addEventListener("click", () => click[name] && click[name]());
  });

  /* ---- Konami code -> vibe mode ---- */
  const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kpos = 0;
  window.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kpos = key === konami[kpos] ? kpos + 1 : (key === konami[0] ? 1 : 0);
    if (kpos === konami.length) {
      kpos = 0;
      const vibe = document.body.classList.toggle("vibe-mode");
      arpeggio([523, 659, 784, 1047, 1319, 1568]);
      rain(["🎧", "🐱", "👾", "✨", "☕", "🌈"], 50);
      toast(vibe ? "↑↑↓↓←→←→BA — VIBE MODE ACTIVATED" : "vibe mode off. back to normal. boring.", 3200);
    }
  });

  console.log("%c 1SSO ", "background:#ff9a47;color:#14142a;font-weight:700;padding:4px 8px;border-radius:4px", "\nOne key. One line in your .env. Go build.\nhey, a fellow tinkerer 👋 try the konami code. pet the cats. click the logo.");
})();
