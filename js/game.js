/* Portfolio-parkeerplaats: rijd rond, parkeer in een vak en bekijk een project. */
(function () {
  "use strict";

  /* ---------- wereld ---------- */
  const WORLD = { w: 1560, h: 980 };
  const WALL = 18;

  const SPOT_W = 104;
  const SPOT_H = 184;

  /* Bovenste rij: 8 vakken, 6 projecten en 2 bezette plekken. */
  const topRowX = (WORLD.w - 8 * SPOT_W) / 2;
  const TOP_ORDER = ["p0", "p1", "static", "p2", "p3", "static", "p4", "p5"];

  /* Onderste rij: bezet, Over, Contact, bezet. */
  const BOT_ORDER = ["static", "over", "contact", "static"];
  const botRowX = topRowX + 2 * SPOT_W;
  const botRowY = WORLD.h - WALL - SPOT_H;

  const spots = [];
  const staticCars = [];
  const STATIC_COLORS = ["#c3c6c9", "#2e3134", "#39506b", "#e8e9eb"];
  let staticCount = 0;

  function addSpot(x, y, opening, key) {
    if (key === "static") {
      const color = STATIC_COLORS[staticCount++ % STATIC_COLORS.length];
      staticCars.push({ x: x + 15, y: y + 17, w: SPOT_W - 30, h: SPOT_H - 34, color });
      spots.push({ x, y, w: SPOT_W, h: SPOT_H, opening, kind: "static" });
      return;
    }
    if (key === "over" || key === "contact") {
      spots.push({ x, y, w: SPOT_W, h: SPOT_H, opening, kind: key, holdT: 0 });
      return;
    }
    const project = PROJECTS[parseInt(key.slice(1), 10)];
    spots.push({ x, y, w: SPOT_W, h: SPOT_H, opening, kind: "project", project, holdT: 0 });
  }

  TOP_ORDER.forEach(function (key, i) {
    addSpot(topRowX + i * SPOT_W, WALL + 8, "down", key);
  });
  BOT_ORDER.forEach(function (key, i) {
    addSpot(botRowX + i * SPOT_W, botRowY - 8, "up", key);
  });

  /* groenvakken met bomen, midden op het terrein */
  const planters = [
    { x: 545, y: 430, w: 190, h: 122 },
    { x: 925, y: 430, w: 190, h: 122 }
  ];

  const obstacles = staticCars.concat(planters);

  /* ---------- voortgang ---------- */
  const STORE_KEY = "evh_visited_v1";
  let visited = new Set();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) visited = new Set(JSON.parse(raw));
  } catch (e) { /* privemodus of geblokkeerde opslag, geen probleem */ }

  function saveVisited() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(visited))); } catch (e) { /* ok */ }
  }

  /* ---------- auto ---------- */
  const CAR = { len: 92, wid: 46 };
  const START = { x: 1290, y: 620, heading: -Math.PI / 2 };
  const car = { x: START.x, y: START.y, heading: START.heading, v: 0 };

  function resetCar() {
    car.x = START.x; car.y = START.y; car.heading = START.heading; car.v = 0;
  }

  function carCorners(x, y, heading) {
    const c = Math.cos(heading), s = Math.sin(heading);
    const hl = CAR.len / 2, hw = CAR.wid / 2;
    return [
      { x: x + c * hl - s * hw, y: y + s * hl + c * hw },
      { x: x + c * hl + s * hw, y: y + s * hl - c * hw },
      { x: x - c * hl - s * hw, y: y - s * hl + c * hw },
      { x: x - c * hl + s * hw, y: y - s * hl - c * hw }
    ];
  }

  function pointInRect(p, r) {
    return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  }

  function collides(x, y, heading) {
    const corners = carCorners(x, y, heading);
    for (let i = 0; i < corners.length; i++) {
      const p = corners[i];
      if (p.x < WALL || p.x > WORLD.w - WALL || p.y < WALL || p.y > WORLD.h - WALL) return true;
      for (let j = 0; j < obstacles.length; j++) {
        if (pointInRect(p, obstacles[j])) return true;
      }
    }
    /* ook: hoekpunten van obstakels binnen de auto */
    const c = Math.cos(-heading), s = Math.sin(-heading);
    const hl = CAR.len / 2, hw = CAR.wid / 2;
    for (let j = 0; j < obstacles.length; j++) {
      const r = obstacles[j];
      const pts = [
        { x: r.x, y: r.y }, { x: r.x + r.w, y: r.y },
        { x: r.x, y: r.y + r.h }, { x: r.x + r.w, y: r.y + r.h }
      ];
      for (let k = 0; k < pts.length; k++) {
        const dx = pts[k].x - x, dy = pts[k].y - y;
        const lx = dx * c - dy * s, ly = dx * s + dy * c;
        if (Math.abs(lx) <= hl && Math.abs(ly) <= hw) return true;
      }
    }
    return false;
  }

  /* ---------- invoer ---------- */
  const keys = {};
  const touch = { throttle: 0, steer: 0 };
  let uiOpen = false;

  window.addEventListener("keydown", function (e) {
    if (uiOpen) return;
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].indexOf(k) !== -1) e.preventDefault();
    keys[k] = true;
    if (k === "r") resetCar();
  });
  window.addEventListener("keyup", function (e) { keys[e.key.toLowerCase()] = false; });

  function readInput() {
    if (uiOpen) return { throttle: 0, steer: 0 };
    let throttle = 0, steer = 0;
    if (keys["arrowup"] || keys["w"]) throttle += 1;
    if (keys["arrowdown"] || keys["s"]) throttle -= 1;
    if (keys["arrowleft"] || keys["a"]) steer -= 1;
    if (keys["arrowright"] || keys["d"]) steer += 1;
    throttle += touch.throttle;
    steer += touch.steer;
    return {
      throttle: Math.max(-1, Math.min(1, throttle)),
      steer: Math.max(-1, Math.min(1, steer))
    };
  }

  /* ---------- fysica ---------- */
  function step(dt) {
    const input = readInput();

    if (input.throttle > 0) car.v += 300 * input.throttle * dt;
    else if (input.throttle < 0) car.v += 220 * input.throttle * dt;
    else car.v -= car.v * 3.4 * dt;
    car.v -= car.v * 0.5 * dt;
    car.v = Math.max(-130, Math.min(255, car.v));
    if (Math.abs(car.v) < 2 && input.throttle === 0) car.v = 0;

    const eff = Math.max(-150, Math.min(150, car.v));
    const prev = { x: car.x, y: car.y, heading: car.heading };
    car.heading += input.steer * 0.0165 * eff * dt;
    car.x += Math.cos(car.heading) * car.v * dt;
    car.y += Math.sin(car.heading) * car.v * dt;

    if (collides(car.x, car.y, car.heading)) {
      car.x = prev.x; car.y = prev.y; car.heading = prev.heading;
      car.v = Math.abs(car.v) < 30 ? 0 : car.v * -0.3;
    }

    checkParking(dt);
  }

  /* ---------- parkeerdetectie ---------- */
  let exitSpot = null; /* vak dat eerst verlaten moet worden voor hertrigger */

  function angleAligned() {
    /* vakken staan verticaal: koers moet (mod pi) dicht bij pi/2 liggen */
    let a = car.heading % Math.PI;
    if (a < 0) a += Math.PI;
    return Math.abs(a - Math.PI / 2) < 0.4;
  }

  function checkParking(dt) {
    for (let i = 0; i < spots.length; i++) {
      const s = spots[i];
      if (s.kind === "static") continue;
      const inside = car.x > s.x + 8 && car.x < s.x + s.w - 8 &&
                     car.y > s.y + 10 && car.y < s.y + s.h - 10;
      if (exitSpot === s) {
        if (!inside) exitSpot = null;
        s.holdT = 0;
        continue;
      }
      if (!uiOpen && inside && Math.abs(car.v) < 10 && angleAligned()) {
        s.holdT += dt;
        if (s.holdT > 0.55) {
          s.holdT = 0;
          exitSpot = s;
          car.v = 0;
          triggerSpot(s);
        }
      } else {
        s.holdT = Math.max(0, s.holdT - dt * 2);
      }
    }
  }

  function triggerSpot(s) {
    if (s.kind === "project") {
      visited.add(s.project.id);
      saveVisited();
      updateProgress();
      openProject(s.project);
      if (PROJECTS.every(function (p) { return visited.has(p.id); })) {
        setTimeout(showAllDoneToast, 400);
      }
    } else if (s.kind === "over") {
      visited.add("_over"); saveVisited();
      openModal("modal-over");
    } else if (s.kind === "contact") {
      visited.add("_contact"); saveVisited();
      openModal("modal-contact");
    }
  }

  /* ---------- canvas en camera ---------- */
  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");
  let dpr = 1, viewW = 0, viewH = 0;
  const cam = { scale: 1, ox: 0, oy: 0, ready: false };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewW = canvas.clientWidth;
    viewH = canvas.clientHeight;
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    cam.ready = false;
  }
  window.addEventListener("resize", resize);

  function updateCamera() {
    /* houd ruimte vrij voor de bovenbalk en de hintbalk */
    const TOP_BAND = 58, BOT_BAND = 56;
    const availH = Math.max(200, viewH - TOP_BAND - BOT_BAND);
    const fit = Math.min(viewW / WORLD.w, availH / WORLD.h);
    let scale, tx, ty;
    if (fit >= 0.3) {
      scale = fit;
      tx = -((viewW - WORLD.w * scale) / 2) / scale;
      ty = -(TOP_BAND + (availH - WORLD.h * scale) / 2) / scale;
    } else {
      scale = 0.5;
      tx = car.x - viewW / scale / 2;
      ty = car.y - viewH / scale / 2;
      const maxX = WORLD.w - viewW / scale;
      const maxY = WORLD.h - viewH / scale;
      tx = maxX < 0 ? maxX / 2 : Math.max(0, Math.min(maxX, tx));
      ty = maxY < 0 ? maxY / 2 : Math.max(0, Math.min(maxY, ty));
    }
    if (!cam.ready) {
      cam.scale = scale; cam.ox = tx; cam.oy = ty; cam.ready = true;
    } else {
      cam.scale += (scale - cam.scale) * 0.15;
      cam.ox += (tx - cam.ox) * 0.15;
      cam.oy += (ty - cam.oy) * 0.15;
    }
  }

  /* ---------- tekenen ---------- */
  const KLEUR = {
    gras: "#79945c",
    grasDonker: "rgba(58, 82, 40, 0.16)",
    stoep: "#b5b8ba",
    stoepRand: "#9a9da0",
    asfalt: "#54575b",
    lijn: "rgba(238, 238, 234, 0.85)",
    lijnZwak: "rgba(238, 238, 234, 0.4)",
    blauw: "#1259a6",
    geel: "#e8b62a"
  };

  /* vaste posities voor grasvlekken, asfaltreparaties en olievlekken */
  const GRAS_VLEKKEN = [
    [90, 120, 60], [1470, 200, 50], [60, 700, 45], [1500, 820, 55],
    [700, 30, 40], [300, 950, 50], [1200, 960, 40]
  ];
  const ASFALT_PLAKKEN = [
    { x: 260, y: 500, w: 230, h: 74 }, { x: 1180, y: 250, w: 90, h: 190 },
    { x: 700, y: 640, w: 170, h: 60 }
  ];
  const OLIE_VLEKKEN = [
    [455, 150, 26, 14], [820, 700, 30, 16], [1050, 330, 22, 12], [620, 880, 26, 13]
  ];

  /* asfaltkorrel als herhalend patroon */
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = noiseCanvas.height = 96;
  (function () {
    const nctx = noiseCanvas.getContext("2d");
    for (let i = 0; i < 950; i++) {
      const shade = Math.random() > 0.5 ? 255 : 0;
      nctx.fillStyle = "rgba(" + shade + "," + shade + "," + shade + "," + (0.02 + Math.random() * 0.045).toFixed(3) + ")";
      nctx.fillRect(Math.floor(Math.random() * 96), Math.floor(Math.random() * 96), 1.6, 1.6);
    }
  })();
  let noisePattern = null;

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* gras als omgeving van het terrein */
    ctx.fillStyle = KLEUR.gras;
    ctx.fillRect(0, 0, viewW, viewH);

    ctx.scale(cam.scale, cam.scale);
    ctx.translate(-cam.ox, -cam.oy);

    ctx.fillStyle = KLEUR.grasDonker;
    GRAS_VLEKKEN.forEach(function (v) {
      ctx.beginPath();
      ctx.ellipse(v[0], v[1], v[2], v[2] * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    /* stoeprand en asfalt */
    ctx.fillStyle = KLEUR.stoep;
    roundRect(8, 8, WORLD.w - 16, WORLD.h - 16, 10);
    ctx.fill();
    ctx.strokeStyle = KLEUR.stoepRand;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = KLEUR.asfalt;
    ctx.fillRect(WALL, WALL, WORLD.w - 2 * WALL, WORLD.h - 2 * WALL);

    /* inrit: asfalt loopt onderaan door de stoeprand naar buiten */
    ctx.fillStyle = KLEUR.asfalt;
    ctx.fillRect(1240, WORLD.h - WALL, 100, WALL - 4);

    /* wegdektextuur en slijtage */
    if (!noisePattern) noisePattern = ctx.createPattern(noiseCanvas, "repeat");
    ctx.fillStyle = noisePattern;
    ctx.fillRect(WALL, WALL, WORLD.w - 2 * WALL, WORLD.h - 2 * WALL);

    ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
    ASFALT_PLAKKEN.forEach(function (p) { ctx.fillRect(p.x, p.y, p.w, p.h); });
    ctx.fillStyle = "rgba(18, 20, 24, 0.1)";
    OLIE_VLEKKEN.forEach(function (v) {
      ctx.beginPath();
      ctx.ellipse(v[0], v[1], v[2], v[3], 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    /* rijstroken met pijlen */
    drawLane(320, 1);
    drawLane(662, -1);

    /* kruisarcering naast de inrit */
    drawHatch(1380, 250, 140, 170);

    /* startvak */
    ctx.save();
    ctx.strokeStyle = KLEUR.lijn;
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 12]);
    ctx.strokeRect(START.x - 62, START.y - 78, 124, 156);
    ctx.setLineDash([]);
    ctx.fillStyle = KLEUR.lijn;
    ctx.font = "700 24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("START", START.x, START.y + 112);
    ctx.restore();

    drawSign(1478, 560);

    spots.forEach(drawSpot);
    planters.forEach(drawPlanter);
    staticCars.forEach(drawStaticCar);
    drawHero();
    spots.forEach(drawHoldRing);
  }

  function drawLane(y, dir) {
    ctx.save();
    ctx.strokeStyle = KLEUR.lijnZwak;
    ctx.lineWidth = 5;
    ctx.setLineDash([30, 26]);
    ctx.beginPath();
    ctx.moveTo(120, y);
    ctx.lineTo(WORLD.w - 120, y);
    ctx.stroke();
    ctx.setLineDash([]);

    /* geschilderde rijrichtingpijlen */
    [380, 780, 1180].forEach(function (x) {
      const y2 = y + (y < WORLD.h / 2 ? 62 : -62);
      ctx.strokeStyle = KLEUR.lijnZwak;
      ctx.fillStyle = KLEUR.lijnZwak;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x - 26 * dir, y2);
      ctx.lineTo(x + 14 * dir, y2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 30 * dir, y2);
      ctx.lineTo(x + 8 * dir, y2 - 10);
      ctx.lineTo(x + 8 * dir, y2 + 10);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  function drawHatch(x, y, w, h) {
    ctx.save();
    ctx.strokeStyle = "rgba(238, 238, 234, 0.45)";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.lineWidth = 4;
    for (let d = -h; d < w; d += 34) {
      ctx.beginPath();
      ctx.moveTo(x + d, y + h);
      ctx.lineTo(x + d + h, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* blauw P-bord bij de inrit */
  function drawSign(x, y) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    ctx.beginPath();
    ctx.ellipse(x + 5, y + 32, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7f8285";
    ctx.fillRect(x - 3, y + 8, 6, 24);
    ctx.fillStyle = KLEUR.blauw;
    roundRect(x - 24, y - 34, 48, 48, 8);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 32px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("P", x, y - 8);
    ctx.restore();
  }

  function drawSpot(s) {
    ctx.save();

    /* de vakken Over en Contact krijgen blauw wegdek, zoals een speciaal vak */
    if (s.kind === "over" || s.kind === "contact") {
      ctx.fillStyle = "rgba(18, 89, 166, 0.32)";
      ctx.fillRect(s.x + 4, s.y + 4, s.w - 8, s.h - 8);
    }

    ctx.strokeStyle = s.kind === "static" ? KLEUR.lijnZwak : KLEUR.lijn;
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (s.opening === "down") {
      ctx.moveTo(s.x, s.y + s.h); ctx.lineTo(s.x, s.y); ctx.lineTo(s.x + s.w, s.y); ctx.lineTo(s.x + s.w, s.y + s.h);
    } else {
      ctx.moveTo(s.x, s.y); ctx.lineTo(s.x, s.y + s.h); ctx.lineTo(s.x + s.w, s.y + s.h); ctx.lineTo(s.x + s.w, s.y);
    }
    ctx.stroke();

    if (s.kind === "project" || s.kind === "over" || s.kind === "contact") {
      const label = s.kind === "project" ? s.project.kort : (s.kind === "over" ? "Over Erwin" : "Contact");
      const isDone = s.kind === "project" ? visited.has(s.project.id) : visited.has("_" + s.kind);
      const cx = s.x + s.w / 2;
      const nearClosed = s.opening === "down" ? s.y + 46 : s.y + s.h - 74;

      ctx.fillStyle = KLEUR.lijn;
      ctx.font = "600 15px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const parts = label.split(/[\s-]+/);
      let lines;
      if (parts.length <= 1) lines = [label];
      else if (parts.length === 2) lines = parts;
      else lines = [parts.slice(0, Math.ceil(parts.length / 2)).join(" "), parts.slice(Math.ceil(parts.length / 2)).join(" ")];
      lines.forEach(function (ln, i) { ctx.fillText(ln, cx, nearClosed + i * 20); });

      if (isDone) {
        const cy = s.opening === "down" ? s.y + s.h - 42 : s.y + 42;
        ctx.fillStyle = KLEUR.blauw;
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy);
        ctx.lineTo(cx - 1.5, cy + 5);
        ctx.lineTo(cx + 6.5, cy - 5);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawHoldRing(s) {
    if (!s.holdT || s.holdT < 0.06) return;
    const frac = Math.min(1, s.holdT / 0.55);
    const cx = s.x + s.w / 2;
    const cy = s.y + s.h / 2;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = KLEUR.blauw;
    ctx.beginPath();
    ctx.arc(cx, cy, 44, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlanter(p) {
    ctx.save();
    /* stoepband rond het groenvak */
    ctx.fillStyle = KLEUR.stoep;
    roundRect(p.x - 6, p.y - 6, p.w + 12, p.h + 12, 12);
    ctx.fill();
    ctx.strokeStyle = KLEUR.stoepRand;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = KLEUR.gras;
    roundRect(p.x, p.y, p.w, p.h, 8);
    ctx.fill();

    const cy = p.y + p.h / 2;
    [0.22, 0.5, 0.78].forEach(function (f, i) {
      const tx = p.x + p.w * f;
      /* schaduw van de boomkruin op het gras en het asfalt */
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.beginPath();
      ctx.ellipse(tx + 9, cy + 11, 32, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = i === 1 ? "#4d7538" : "#456b32";
      ctx.beginPath();
      ctx.arc(tx, cy, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5d8a44";
      ctx.beginPath();
      ctx.arc(tx - 9, cy - 8, 15, 0, Math.PI * 2);
      ctx.arc(tx + 7, cy + 6, 11, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawStaticCar(sc) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    roundRect(sc.x + 4, sc.y + 6, sc.w, sc.h, 16);
    ctx.fill();
    ctx.fillStyle = sc.color;
    roundRect(sc.x, sc.y, sc.w, sc.h, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();
    /* spiegels */
    ctx.fillStyle = sc.color;
    ctx.fillRect(sc.x - 5, sc.y + 34, 6, 10);
    ctx.fillRect(sc.x + sc.w - 1, sc.y + 34, 6, 10);
    /* ruiten en dak */
    ctx.fillStyle = "rgba(28, 37, 46, 0.8)";
    roundRect(sc.x + 9, sc.y + 28, sc.w - 18, 22, 7);
    ctx.fill();
    roundRect(sc.x + 10, sc.y + sc.h - 40, sc.w - 20, 16, 6);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
    roundRect(sc.x + 9, sc.y + 54, sc.w - 18, sc.h - 96, 6);
    ctx.fill();
    ctx.restore();
  }

  function drawHero() {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.heading + Math.PI / 2); /* tekenen met neus omhoog */
    const w = CAR.wid, l = CAR.len;

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    roundRect(-w / 2 + 3, -l / 2 + 5, w, l, 14);
    ctx.fill();

    ctx.fillStyle = "#c63a2f";
    roundRect(-w / 2, -l / 2, w, l, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    /* spiegels */
    ctx.fillStyle = "#c63a2f";
    ctx.fillRect(-w / 2 - 5, -l / 2 + 30, 6, 9);
    ctx.fillRect(w / 2 - 1, -l / 2 + 30, 6, 9);

    /* voorruit, dak en achterruit */
    ctx.fillStyle = "rgba(24, 33, 42, 0.85)";
    roundRect(-w / 2 + 6, -l / 2 + 24, w - 12, 15, 5);
    ctx.fill();
    roundRect(-w / 2 + 7, l / 2 - 32, w - 14, 12, 5);
    ctx.fill();
    ctx.fillStyle = "#a92e24";
    roundRect(-w / 2 + 7, -l / 2 + 41, w - 14, l - 76, 6);
    ctx.fill();

    /* koplampen en achterlichten */
    ctx.fillStyle = "#f2eecb";
    ctx.fillRect(-w / 2 + 4, -l / 2 + 2, 10, 4);
    ctx.fillRect(w / 2 - 14, -l / 2 + 2, 10, 4);
    ctx.fillStyle = "#801d14";
    ctx.fillRect(-w / 2 + 4, l / 2 - 6, 10, 4);
    ctx.fillRect(w / 2 - 14, l / 2 - 6, 10, 4);
    ctx.restore();
  }

  /* ---------- hoofdlus ---------- */
  let lastT = 0;
  let lastRaf = 0;

  function tick(now) {
    const dt = Math.min(0.055, (now - lastT) / 1000 || 0.016);
    lastT = now;
    step(dt);
    updateCamera();
    draw();
  }

  function frame(t) {
    lastRaf = performance.now();
    tick(t);
    requestAnimationFrame(frame);
  }

  /* vangnet voor omgevingen waar requestAnimationFrame stilstaat (webviews) */
  setInterval(function () {
    if (performance.now() - lastRaf > 250) tick(performance.now());
  }, 50);

  /* ---------- interface ---------- */
  const backdrop = document.getElementById("backdrop");

  function openModal(id) {
    uiOpen = true;
    backdrop.hidden = false;
    document.querySelectorAll(".modal").forEach(function (m) { m.hidden = true; });
    const modal = document.getElementById(id);
    modal.hidden = false;
    modal.scrollTop = 0;
  }

  function closeModals() {
    uiOpen = false;
    backdrop.hidden = true;
    document.querySelectorAll(".modal").forEach(function (m) { m.hidden = true; });
  }

  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop) closeModals();
  });
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && uiOpen) closeModals();
  });
  document.querySelectorAll("[data-close]").forEach(function (b) {
    b.addEventListener("click", closeModals);
  });

  /* pictogrammen voor de projectpagina, per projecttype */
  const ICONS = {
    garage: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 40V16L24 7l18 9v24"/><path d="M13 40V24h22v16"/><path d="M13 31h22"/></svg>',
    ondergronds: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 14h38"/><path d="M24 20v16"/><path d="M17 30l7 7 7-7"/><path d="M11 14v6M37 14v6"/></svg>',
    terrein: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="10" width="36" height="28" rx="3"/><path d="M18 10v28M30 10v28M6 24h36"/></svg>',
    pr: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="9" width="20" height="22" rx="4"/><path d="M11 36v4M21 36v4M6 24h20M10 31h.01M22 31h.01"/><path d="M32 15h6a5 5 0 0 1 0 10h-6v14M32 15v10"/></svg>',
    fiets: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="32" r="8"/><circle cx="36" cy="32" r="8"/><path d="M12 32l8-14h11M24 32l-4-14M31 18l5 14M18 18h9"/></svg>',
    route: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 42V16a8 8 0 0 1 16 0v16a8 8 0 0 0 16 0V12"/><path d="M36 18l6-6 6 6"/></svg>'
  };

  let currentProject = 0;

  function openProject(p) {
    currentProject = PROJECTS.indexOf(p);
    document.getElementById("proj-icon").innerHTML = ICONS[p.type] || ICONS.garage;
    document.getElementById("proj-rol").textContent = p.rol;
    document.getElementById("proj-titel").textContent = p.titel;
    document.getElementById("proj-meta").textContent = p.plaats + " · " + p.periode;
    document.getElementById("proj-intro").textContent = p.intro;

    const facts = document.getElementById("proj-facts");
    facts.innerHTML = "";
    [
      ["Locatie", p.plaats],
      ["Periode", p.periode],
      ["Rol", p.rol],
      ["Omvang", p.capaciteit],
      ["Opdrachtgever", p.opdrachtgever],
      ["Status", p.status]
    ].forEach(function (f) {
      if (!f[1]) return;
      const wrap = document.createElement("div");
      const dt = document.createElement("dt");
      dt.textContent = f[0];
      const dd = document.createElement("dd");
      dd.textContent = f[1];
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      facts.appendChild(wrap);
    });

    document.getElementById("proj-opgave").textContent = p.opgave;
    document.getElementById("proj-aanpak").textContent = p.aanpak;
    document.getElementById("proj-resultaat").textContent = p.resultaat;

    const ken = document.getElementById("proj-kenmerken");
    ken.innerHTML = "";
    (p.kenmerken || []).forEach(function (k) {
      const li = document.createElement("li");
      li.textContent = k;
      ken.appendChild(li);
    });

    const tagBox = document.getElementById("proj-tags");
    tagBox.innerHTML = "";
    p.tags.forEach(function (t) {
      const el = document.createElement("span");
      el.className = "chip";
      el.textContent = t;
      tagBox.appendChild(el);
    });
    if (p.placeholder) {
      const el = document.createElement("span");
      el.className = "chip chip-warn";
      el.textContent = "voorbeeldproject";
      tagBox.appendChild(el);
    }
    openModal("modal-project");
  }

  document.getElementById("proj-prev").addEventListener("click", function () {
    openProject(PROJECTS[(currentProject - 1 + PROJECTS.length) % PROJECTS.length]);
  });
  document.getElementById("proj-next").addEventListener("click", function () {
    openProject(PROJECTS[(currentProject + 1) % PROJECTS.length]);
  });

  function updateProgress() {
    const done = PROJECTS.filter(function (p) { return visited.has(p.id); }).length;
    document.getElementById("progress").textContent = done + " / " + PROJECTS.length + " projecten";
  }

  function showAllDoneToast() {
    const t = document.getElementById("toast");
    t.hidden = false;
    setTimeout(function () { t.hidden = true; }, 6000);
  }

  /* projectenlijst */
  function buildList() {
    const ul = document.getElementById("project-list");
    ul.innerHTML = "";
    PROJECTS.forEach(function (p) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "list-item";
      const name = document.createElement("span");
      name.textContent = p.titel;
      const meta = document.createElement("span");
      meta.className = "list-meta";
      meta.textContent = visited.has(p.id) ? "bekeken" : p.periode;
      if (visited.has(p.id)) meta.classList.add("list-done");
      btn.appendChild(name);
      btn.appendChild(meta);
      btn.addEventListener("click", function () { openProject(p); });
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  document.getElementById("btn-list").addEventListener("click", function () {
    buildList();
    openModal("modal-list");
  });
  document.getElementById("btn-over").addEventListener("click", function () {
    openModal("modal-over");
  });
  document.getElementById("btn-reset").addEventListener("click", function () {
    resetCar();
  });
  document.getElementById("intro-list").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("intro").hidden = true;
    buildList();
    openModal("modal-list");
  });

  document.getElementById("over-tekst").textContent = OVER_TEKST;
  document.getElementById("contact-tekst").textContent = CONTACT_TEKST;

  /* intro */
  document.getElementById("btn-start").addEventListener("click", function () {
    document.getElementById("intro").hidden = true;
    canvas.focus();
  });

  /* ---------- aanraakbediening ---------- */
  function bindHold(id, onDown, onUp) {
    const el = document.getElementById(id);
    el.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      onDown();
    });
    ["pointerup", "pointercancel"].forEach(function (ev) {
      el.addEventListener(ev, function () { onUp(); });
    });
  }
  bindHold("tc-up", function () { touch.throttle = 1; }, function () { touch.throttle = 0; });
  bindHold("tc-down", function () { touch.throttle = -1; }, function () { touch.throttle = 0; });
  bindHold("tc-left", function () { touch.steer = -1; }, function () { touch.steer = 0; });
  bindHold("tc-right", function () { touch.steer = 1; }, function () { touch.steer = 0; });

  /* ---------- start ---------- */
  updateProgress();
  resize();
  requestAnimationFrame(frame);

  /* testhaakje: alleen actief bij #debug in de URL */
  if (location.hash.indexOf("debug") !== -1) {
    window.__evhDebug = {
      car: car,
      keys: keys,
      spots: spots,
      step: function (dt) { step(dt); },
      render: function () { updateCamera(); draw(); }
    };
  }
})();
