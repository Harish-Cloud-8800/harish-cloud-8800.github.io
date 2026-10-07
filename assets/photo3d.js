// Photo3D: turns a cut-out photo plus a depth map into a lit 3D surface that turns its head and body.
// Needs THREE (r160). window.Photo3D.mount(el, { tex, depth, geo, manual, dt })
(function () {
  "use strict";
  var T = window.THREE;
  if (!T) return;

  var VS = [
    "uniform sampler2D depthMap; uniform float D, headYaw, headPitch, headTilt, neckY, headCx, headCy, breathe, chestTop, hipY, aspect, mouth, mouthY, mouthX, mouthW;",
    "varying float vOpen;",
    "varying vec2 vUv; varying float vShade;",
    "vec3 rotY(vec3 p, float a){ float c=cos(a), s=sin(a); return vec3(c*p.x+s*p.z, p.y, -s*p.x+c*p.z); }",
    "vec3 rotX(vec3 p, float a){ float c=cos(a), s=sin(a); return vec3(p.x, c*p.y-s*p.z, s*p.y+c*p.z); }",
    "vec3 rotZ(vec3 p, float a){ float c=cos(a), s=sin(a); return vec3(c*p.x-s*p.y, s*p.x+c*p.y, p.z); }",
    "void main(){",
    "  vUv = uv; float d = texture2D(depthMap, uv).r; float fromTop = 1.0 - uv.y;",
    "  vec3 p = position + vec3(0.0, 0.0, d * D);",
    "  float chest = smoothstep(hipY, chestTop, fromTop) * (1.0 - smoothstep(neckY + 0.02, neckY, fromTop)) * step(fromTop, hipY);",
    "  chest = smoothstep(hipY, chestTop, fromTop) * smoothstep(neckY - 0.01, neckY + 0.06, fromTop);",
    "  p.x += (p.x - (headCx - 0.5) * aspect * 2.0) * breathe * 0.012 * chest; p.z += breathe * 0.02 * chest * D;",
    "  float mx = 1.0 - smoothstep(mouthW * 0.2, mouthW * 0.95, abs(uv.x - mouthX));",
    "  float jaw = smoothstep(mouthY - 0.002, mouthY + 0.004, fromTop) * (1.0 - smoothstep(mouthY + 0.03, mouthY + 0.06, fromTop)) * mx;",
    "  float jx = 1.0 - smoothstep(mouthW * 0.6, mouthW * 2.2, abs(uv.x - mouthX));",
    "  float jw = smoothstep(mouthY - 0.002, mouthY + 0.004, fromTop) * (1.0 - smoothstep(mouthY + 0.03, mouthY + 0.07, fromTop)) * jx;",
    "  p.y -= mouth * 0.0085 * jw; p.z += mouth * 0.005 * jw;",
    "  vOpen = mouth * mx * mx * (1.0 - smoothstep(0.0, 0.0035 * (0.4 + mx * 0.6), abs(fromTop - (mouthY + 0.0012))));",
    "  float h = 1.0 - smoothstep(neckY - 0.012, neckY + 0.03, fromTop);",
    "  vec3 c = vec3((headCx - 0.5) * aspect * 2.0, (1.0 - neckY) * 2.0 - 1.0, D * 0.55);",
    "  vec3 q = p - c; q = rotZ(q, headTilt * h); q = rotX(q, headPitch * h); q = rotY(q, headYaw * h); p = c + q;",
    "  float dx = texture2D(depthMap, uv + vec2(0.004, 0.0)).r - texture2D(depthMap, uv - vec2(0.004, 0.0)).r;",
    "  vShade = dx;",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);",
    "}"
  ].join("\n");
  var FS = [
    "uniform sampler2D map; uniform float light; varying vec2 vUv; varying float vShade; varying float vOpen;",
    "void main(){ vec4 c = texture2D(map, vUv); if (c.a < 0.03) discard;",
    "  float s = 1.0 + vShade * light * 6.0; vec3 col = c.rgb * s; col = mix(col, vec3(0.24, 0.1, 0.08), clamp(vOpen * 1.1, 0.0, 0.6)); gl_FragColor = vec4(col, c.a); }"
  ].join("\n");

  var REST = { yaw: 0, pitch: 0, roll: 0, hYaw: 0, hPitch: 0, hTilt: 0, lean: 0, light: 0, scale: 1 };
  var POSES = {
    rest: {},
    left: { yaw: -.085, hYaw: -.17, hTilt: .03, light: -.5, roll: .005 },
    right: { yaw: .085, hYaw: .17, hTilt: -.03, light: .5, roll: -.005 },
    notice: { hPitch: -.05, lean: .04, scale: 1.022 },
    nod: { hPitch: .09, lean: .03, scale: 1.02 },
    point: { yaw: .06, hYaw: .12, hTilt: -.02, light: .35, scale: 1.015 }
  };
  function pose(n) { var p = {}, k; for (k in REST) p[k] = REST[k]; var o = POSES[n] || {}; for (k in o) p[k] = o[k]; return p; }

  function mount(el, opts) {
    opts = opts || {};
    var W = el.clientWidth || 420, H = el.clientHeight || 900;
    var renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!opts.manual }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.manual ? 1.5 : 2));
    renderer.setSize(W, H);
    renderer.outputColorSpace = T.LinearSRGBColorSpace;
    el.appendChild(renderer.domElement);

    var g = opts.geo, aspect = g.W / g.H, scene = new T.Scene();
    var cam = new T.PerspectiveCamera(16, W / H, .1, 50);
    var fitH = 2.12, dist = (fitH / 2) / Math.tan(T.MathUtils.degToRad(8));
    cam.position.set(0, 0, dist); cam.lookAt(0, 0, 0);

    var loader = new T.TextureLoader();
    var tex = loader.load(opts.tex, function () { if (manual) frame(0); }), dep = loader.load(opts.depth);
    tex.colorSpace = T.NoColorSpace; tex.anisotropy = 4;
    var U = {
      map: { value: tex }, depthMap: { value: dep }, D: { value: .22 }, headYaw: { value: 0 }, headPitch: { value: 0 }, headTilt: { value: 0 },
      neckY: { value: g.neck }, headCx: { value: g.headCx }, headCy: { value: g.headCy }, breathe: { value: 0 },
      chestTop: { value: g.neck + .05 }, hipY: { value: g.hips }, aspect: { value: aspect }, light: { value: 0 },
      mouth: { value: 0 }, mouthY: { value: g.mouthY || .1277 }, mouthX: { value: g.mouthX || .57 }, mouthW: { value: g.mouthW || .065 }
    };
    var geom = new T.PlaneGeometry(2 * aspect, 2, 160, 680);
    var body = new T.Mesh(geom, new T.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS, transparent: true, side: T.DoubleSide }));
    var pivot = new T.Group(); pivot.position.y = -1; body.position.y = 1; pivot.add(body); scene.add(pivot);

    var cur = pose("rest"), tgt = pose("rest"), timers = [], t0 = performance.now(), last = t0, manual = !!opts.manual, clock = 0;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function to(n) { tgt = pose(n); }
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function react(zone) {
      clear();
      if (zone === "left" || zone === "right") { to(zone); at(2600, function () { to("rest"); }); return; }
      to("notice"); at(900, function () { to("nod"); }); at(1500, function () { to("notice"); });
      at(3200, function () { to("point"); }); at(5600, function () { to("rest"); });
    }

    function frame(now) {
      var dt = manual ? (opts.dt || 1 / 30) : Math.min(250, now - last) / 1000; last = now;
      if (manual) clock += dt;
      var t = manual ? clock : (now - t0) / 1000, k = reduce ? 1 : 1 - Math.exp(-dt * 5.2);
      for (var key in tgt) cur[key] += (tgt[key] - cur[key]) * k;
      var br = reduce ? 0 : Math.sin(t * 1.5);
      U.breathe.value = br;
      U.headYaw.value = cur.hYaw + (reduce ? 0 : Math.sin(t * .7) * .015);
      U.headPitch.value = cur.hPitch + (reduce ? 0 : Math.sin(t * .9 + 1) * .01);
      U.headTilt.value = cur.hTilt;
      U.light.value = cur.light;
      pivot.rotation.set(-cur.lean * .4, cur.yaw + (reduce ? 0 : Math.sin(t * .45) * .02), cur.roll + (reduce ? 0 : Math.sin(t * .6) * .004));
      pivot.scale.setScalar(cur.scale);
      renderer.render(scene, cam);
      if (!manual) requestAnimationFrame(frame);
    }
    if (!manual) requestAnimationFrame(frame);

    function resize() { var w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(el);

    return { react: react, pose: to, step: function () { frame(0); }, canvas: renderer.domElement,
      mouth: function (v) { U.mouth.value = v; }, nod: function (pitch, yaw) { tgt.hPitch = pitch; if (yaw != null) tgt.hYaw = yaw; } };
  }
  window.Photo3D = { mount: mount };
})();
