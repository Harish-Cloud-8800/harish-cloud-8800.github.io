// Voice tour: one narration track drives everything. Each frame reads the audio clock and
// applies the scroll, pointer, highlights and lip-sync for that moment, so the page can never drift from the voice.
(function () {
  "use strict";
  var D = window.TOUR;
  if (!D) return;
  var $ = function (id) { return document.getElementById(id); };
  var manual = !!window.P3_MANUAL;
  var hero = window.__hero || {}, site = window.__site || {}, p3 = hero.p3;
  var root = document.documentElement;
  var HERO_END = D.secs[0][0];
  var FINE = function () { return manual || window.matchMedia("(hover: hover) and (pointer: fine)").matches; };
  var NARROW = function () { return window.innerWidth <= 820; };

  /* ---------- UI: caption bar + pointer ---------- */
  var bar = document.createElement("div");
  bar.className = "capbar"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Voice tour");
  bar.innerHTML = '<span class="who"><span class="eq" aria-hidden="true"><b></b><b></b><b></b><b></b></span><span>Harish</span></span>' +
    '<p class="txt" aria-live="polite"></p>' +
    '<span class="ctl"><button type="button" class="pp" aria-label="Pause"></button><button type="button" class="x" aria-label="Stop the tour">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></span>' +
    '<span class="prog" aria-hidden="true"><i></i></span>';
  document.body.appendChild(bar);
  var txt = bar.querySelector(".txt"), pp = bar.querySelector(".pp"), prog = bar.querySelector(".prog i"), eqs = [].slice.call(bar.querySelectorAll(".eq b"));
  var ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>';
  var cur = document.createElement("div");
  cur.id = "tcur"; cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 2l15 8-6.5 1.8L10 19z" fill="#3A3FB0" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  document.body.appendChild(cur);

  /* ---------- motion primitives (all driven by tour time t) ---------- */
  var mouse = [window.innerWidth * .6, window.innerHeight * .62], glide = null, move = null, scrollY = 0;
  function ease(u) { return u * u * (3 - 2 * u); }
  function cosE(u) { return .5 - .5 * Math.cos(Math.PI * u); }
  function maxY() { return Math.max(0, root.scrollHeight - window.innerHeight); }
  function docTop(el) { return el.getBoundingClientRect().top + window.scrollY; }
  function scrollTo(t, y, dur) { move = { t0: t, d: dur, y0: window.scrollY, y1: Math.max(0, Math.min(maxY(), y)) }; }
  function q(sel) { return document.querySelector(sel); }
  function glideTo(t, target, dur) { glide = { t0: t, d: dur || .3, from: mouse.slice(), to: target }; }
  function elPoint(el, dx, dy) { return function () { var r = el.getBoundingClientRect(); return [r.left + r.width * (dx == null ? .5 : dx), r.top + r.height * (dy == null ? .5 : dy)]; }; }
  function ensure(t, el) {
    // judge visibility where the page will be once any scroll in progress lands
    var r = el.getBoundingClientRect(), H = window.innerHeight, shift = move ? move.y1 - window.scrollY : 0;
    var top = r.top - shift, bottom = r.bottom - shift;
    if (top < 80 || bottom > H - 110) scrollTo(t, window.scrollY + r.top - Math.max(90, (H - r.height) * .4), move ? Math.max(.5, move.t0 + move.d - t) : .5);
  }
  function point(t, el, dx, dy) { if (!el) return; ensure(t, el); glideTo(t, elPoint(el, dx, dy), .3); }
  var marked = [];
  function mark(els, cls) { els.forEach(function (e) { if (e) { e.classList.add(cls); marked.push([e, cls]); } }); }
  function unmark() { marked.forEach(function (m) { m[0].classList.remove(m[1]); }); marked = []; }

  /* ---------- build the event list from the narration timeline ---------- */
  var EV = [];
  function at(t, f) { EV.push({ t: t, f: f }); }
  at(0, function (t) { scrollTo(t, 0, .3); if (p3) p3.pose("notice"); if (hero.clear) hero.clear(); if (hero.setClass) hero.setClass(""); glideTo(t, [window.innerWidth * .58, window.innerHeight * .6], .3); });
  D.secs.forEach(function (s) {
    at(s[0], function (t) {
      unmark();
      if (s[1] === "about") { if (hero.say) hero.say(""); if (hero.lit) hero.lit(false); if (p3) { p3.pose("rest"); p3.mouth(0); } }
      var el = $(s[1]); if (!el) return;
      scrollTo(t, docTop(el) - 64, .9);
      glideTo(t, [window.innerWidth * .94, window.innerHeight * (s[1] === "work" ? .965 : .55)], .3);
    });
  });
  D.ph.forEach(function (p) {
    var t0 = p[0];
    (p[4] || "").split("|").forEach(function (a) {
      if (!a) return;
      var k = a.indexOf(":"), kind = k < 0 ? a : a.slice(0, k), arg = k < 0 ? "" : a.slice(k + 1);
      if (kind === "say") at(t0, function () { if (hero.say) hero.say(arg); });
      else if (kind === "pose") at(t0, function () { if (p3) p3.pose(arg); });
      else if (kind === "lit") at(t0, function () { if (hero.lit) hero.lit(true); });
      else if (kind === "point") at(t0 - .35, function (t) {
        var el = q(arg); point(t, el);
        if (el && el.tagName === "DT") mark([el, el.nextElementSibling], "hl-row");
        else if (el && el.tagName === "LI") mark([el], "hl-row");
      });
      else if (kind === "fam") {
        at(t0 - .35, function (t) { var b = [].filter.call(document.querySelectorAll("#fams button"), function (x) { return x.textContent === arg; })[0]; point(t, b); });
        at(t0 - .03, function () { if (site.setFam) site.setFam(arg); });
      }
      else if (kind === "panel") {
        var i = +arg;
        at(t0 - .35, function (t) {
          var el = document.querySelectorAll("#fold .panel")[i]; if (!el) return;
          if (NARROW()) { scrollTo(t, docTop(el) - 80, .45); glideTo(t, elPoint(el, .2, .3), .3); }
          else glideTo(t, elPoint(el, el.classList.contains("open") ? .1 : .5, .5), .3);
        });
        at(t0 - .05, function () { var el = document.querySelectorAll("#fold .panel")[i]; if (el && el._open) el._open(); });
      }
      else if (kind === "goto") at(t0 - .45, function (t) {
        var el = q(arg); if (!el) return;
        scrollTo(t, docTop(el) - 90, .6); glideTo(t, elPoint(el.querySelector("h3") || el, .3, .5), .5);
      });
      else if (kind === "cert") {
        at(t0 - .35, function (t) { point(t, document.querySelectorAll(".certs li")[+arg], .4); });
        at(t0 - .05, function () { if (site.cert) site.cert(+arg); });
      }
      else if (kind === "stat") {
        at(t0 - .35, function (t) { point(t, document.querySelectorAll(".stat")[+arg], .5, .45); });
        at(t0 - .05, function () { unmark(); mark([document.querySelectorAll(".stat")[+arg]], "hl"); });
      }
      else if (kind === "ask") {
        var inp = function () { return $("askInput"); };
        at(t0 - 1.0, function (t) { point(t, inp(), .3); });
        for (var c = 1; c <= arg.length; c++) (function (c) { at(t0 - .7 + .6 * c / arg.length, function () { inp().value = arg.slice(0, c); }); })(c);
        at(t0 - .05, function (t) { glideTo(t, elPoint($("askBtn")), .2); });
        at(t0 + .2, function () { if (window.__ask) window.__ask.run(arg); });
      }
    });
  });
  EV.sort(function (a, b) { return a.t - b.t; });

  /* ---------- per-frame state ---------- */
  var k = 0, lastCap = -1;
  function heroFace(t) {
    if (!p3) return;
    if (t > HERO_END + .2) return;
    var m = D.mouth[Math.floor(t * 30)] || 0;
    p3.mouth(m * .9);
    var nod = 0, yaw = 0, speaking = false;
    D.ph.forEach(function (p, n) {
      if (p[2] !== "hero") return;
      var dt = t - p[0];
      if (dt >= -.05 && dt <= p[1] + .05) speaking = true;
      if (dt >= 0 && dt < .9) { nod += .075 * Math.sin(Math.PI * dt / .9); yaw += (n % 2 ? .05 : -.04) * Math.sin(Math.PI * Math.min(1, dt / .9)); }
    });
    if (speaking) p3.nod(-.03 + nod, yaw);
  }
  function step(t) {
    while (k < EV.length && EV[k].t <= t) { EV[k].f(t); k++; }
    if (move) {
      var u = Math.min(1, (t - move.t0) / move.d), y = move.y0 + (move.y1 - move.y0) * cosE(Math.max(0, u));
      window.scrollTo({ top: y, left: 0, behavior: "instant" });
      if (u >= 1) move = null;
    }
    if (glide) {
      var g = Math.min(1, (t - glide.t0) / glide.d), e = ease(Math.max(0, g)), to = typeof glide.to === "function" ? glide.to() : glide.to;
      mouse = [glide.from[0] + (to[0] - glide.from[0]) * e, glide.from[1] + (to[1] - glide.from[1]) * e];
      if (g >= 1) glide = { t0: -1, d: 1, from: to, to: glide.to };
    }
    cur.style.transform = "translate(" + mouse[0].toFixed(1) + "px," + mouse[1].toFixed(1) + "px)";
    heroFace(t);
    var ci = -1;
    for (var i = 0; i < D.ph.length; i++) if (t >= D.ph[i][0] - .05 && t <= D.ph[i][0] + D.ph[i][1] + .6) ci = i;
    if (ci !== lastCap && ci >= 0) { lastCap = ci; txt.textContent = D.ph[ci][3]; }
    var lv = D.mouth[Math.floor(t * 30)] || 0;
    eqs.forEach(function (b, j) { b.style.height = Math.round(20 + 80 * Math.min(1, lv * (0.6 + .25 * ((j * 7 + Math.floor(t * 12)) % 3)))) + "%"; });
    prog.style.width = Math.min(100, t / D.end * 100).toFixed(2) + "%";
  }

  /* ---------- playback ---------- */
  var audio = null, state = "idle", raf = 0, clock0 = 0, clockT = 0, useClock = false;
  function now() {
    if (useClock) return clockT + (performance.now() - clock0) / 1000;
    return audio ? audio.currentTime : 0;
  }
  function loop() {
    if (state !== "playing") return;
    var t = now();
    step(t);
    if (t >= D.end || (audio && audio.ended && !useClock)) { finish(); return; }
    raf = requestAnimationFrame(loop);
  }
  function setBtns(playing) {
    pp.innerHTML = playing ? ICON_PAUSE : ICON_PLAY; pp.setAttribute("aria-label", playing ? "Pause" : "Resume");
    document.querySelectorAll("[data-tour]").forEach(function (b) {
      var s = b.querySelector("span");
      if (!b._label) b._label = s ? s.textContent : b.lastChild.textContent;
      var label = state === "idle" ? b._label : playing ? "Pause tour" : "Resume tour";
      if (s) s.textContent = label; else b.lastChild.textContent = label;
    });
  }
  function begin() {
    k = 0; lastCap = -1; move = null; glide = null; unmark();
    root.style.scrollBehavior = "auto";
    document.body.classList.add("touring");
    bar.classList.add("show"); if (FINE()) cur.classList.add("show");
    txt.textContent = "";
  }
  function start() {
    begin(); state = "playing"; setBtns(true);
    if (!audio) { audio = new Audio(D.src); audio.preload = "auto"; }
    useClock = false;
    try { audio.currentTime = 0; } catch (e) {}
    var pr = audio.play();
    if (pr && pr.catch) pr.catch(function () { useClock = true; clockT = 0; clock0 = performance.now(); });
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }
  function pause() {
    if (state !== "playing") return;
    state = "paused"; cancelAnimationFrame(raf);
    clockT = now(); if (audio) audio.pause();
    move = null; setBtns(false);
  }
  function resume() {
    if (state !== "paused") return;
    // pick up from the start of the section in view, so the page and the voice line up again
    var t = clockT, s0 = 0;
    for (var i = 0; i < D.secs.length; i++) if (D.secs[i][0] <= t) s0 = D.secs[i][0];
    k = 0; while (k < EV.length && EV[k].t < s0) k++;
    unmark(); state = "playing"; setBtns(true);
    if (useClock) { clockT = s0; clock0 = performance.now(); }
    else { try { audio.currentTime = s0; } catch (e) {} audio.play(); }
    raf = requestAnimationFrame(loop);
  }
  function finish() {
    state = "idle"; cancelAnimationFrame(raf); if (audio) audio.pause();
    unmark(); if (hero.lit) hero.lit(false); if (p3) { p3.mouth(0); p3.pose("rest"); }
    document.body.classList.remove("touring"); root.style.scrollBehavior = "";
    cur.classList.remove("show"); setTimeout(function () { if (state === "idle") bar.classList.remove("show"); }, 1200);
    setBtns(false);
  }
  document.querySelectorAll("[data-tour]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      if (state === "playing") pause(); else if (state === "paused") resume(); else start();
    });
  });
  pp.addEventListener("click", function () { if (state === "playing") pause(); else resume(); });
  bar.querySelector(".x").addEventListener("click", finish);
  // the visitor takes over: scrolling or clicking pauses the tour
  function interrupt(e) {
    if (state !== "playing" || manual) return;
    if (e.target && e.target.closest && (e.target.closest(".capbar") || e.target.closest("[data-tour]"))) return;
    pause();
  }
  window.addEventListener("wheel", interrupt, { passive: true });
  window.addEventListener("touchmove", interrupt, { passive: true });
  window.addEventListener("pointerdown", interrupt);
  window.addEventListener("keydown", function (e) { if (/^(Arrow|Page|Home|End| )/.test(e.key)) interrupt(e); if (e.key === "Escape" && state !== "idle") finish(); });

  // deterministic hooks for recording the video
  window.__tour = { begin: begin, step: step, end: D.end, secs: D.secs, ph: D.ph };
})();
