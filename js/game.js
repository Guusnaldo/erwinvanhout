/* Portfolio-parkeergarage: rijd rond over twee niveaus, parkeer in een vak en bekijk een project. */
(function () {
  "use strict";

  /* ---------- wereld ---------- */
  const WORLD = { w: 1560, h: 980 };
  const WALL = 18;

  const SPOT_W = 104;
  const SPOT_H = 184;

  /* twee rijlanen (hartlijnen), met een ruim open middengebied ertussen */
  const LAAN_A = 320;
  const LAAN_B = 662;

  /* de helling naar het andere niveau, tegen de linkerwand */
  const RAMP = { x: 40, y: 375, w: 210, h: 230 };

  /* kolommen, op beide niveaus gelijk: tegen de wanden en een rij in het midden */
  const KOLOMMEN = [
    { x: 561, y: 18, w: 22, h: 24 }, { x: 769, y: 18, w: 22, h: 24 }, { x: 977, y: 18, w: 22, h: 24 },
    { x: 561, y: 938, w: 22, h: 24 }, { x: 769, y: 938, w: 22, h: 24 }, { x: 977, y: 938, w: 22, h: 24 },
    { x: 548, y: 478, w: 24, h: 24 }, { x: 788, y: 478, w: 24, h: 24 }, { x: 1028, y: 478, w: 24, h: 24 }
  ];

  const STATIC_COLORS = ["#c3c6c9", "#2e3134", "#39506b", "#44573f", "#6d6f72", "#8a4a3f"];
  const EV_COLOR = "#4e8e8a";
  let staticCount = 0;

  /* Een niveau bestaat uit vier rijen vakken:
     top (8, tegen de bovenwand), midUp en midDown (7, rug aan rug in het midden)
     en bottom (4, tegen de onderwand). Sleutels: p0 t/m p5 (projecten), over,
     contact, static (bezet), leeg (vrij vak), laad (laadpaal, vrij) en
     laadS (laadpaal met aangesloten elektrische auto). */
  function maakNiveau(spec) {
    const spots = [], statics = [], posts = [];

    function vak(x, y, opening, key) {
      const s = { x, y, w: SPOT_W, h: SPOT_H, opening, kind: key };
      const cx = x + SPOT_W / 2;
      const postY = opening === "down" ? y + 6 : y + SPOT_H - 16;

      if (key === "static" || key === "laadS") {
        const color = key === "laadS" ? EV_COLOR : STATIC_COLORS[staticCount++ % STATIC_COLORS.length];
        const auto = { x: x + 15, y: y + 17, w: SPOT_W - 30, h: SPOT_H - 34, color, ev: key === "laadS" };
        statics.push(auto);
        s.kind = key === "laadS" ? "laad" : "static";
      }
      if (key === "laad" || key === "laadS") {
        const post = { x: cx - 5, y: postY, w: 10, h: 10, cx, opening, cable: key === "laadS" };
        posts.push(post);
        s.kind = "laad";
      }
      if (key === "over" || key === "contact") s.holdT = 0;
      if (key.charAt(0) === "p" && key.length === 2) {
        s.kind = "project";
        s.project = PROJECTS[parseInt(key.slice(1), 10)];
        s.holdT = 0;
      }
      spots.push(s);
    }

    const topX = (WORLD.w - 8 * SPOT_W) / 2;
    spec.top.forEach(function (k, i) { vak(topX + i * SPOT_W, WALL + 8, "down", k); });
    spec.bottom.forEach(function (k, i) { vak(468 + i * SPOT_W, WORLD.h - WALL - SPOT_H - 8, "up", k); });

    const obstacles = statics.concat(KOLOMMEN, posts);
    return { naam: spec.naam, spots, statics, posts, obstacles };
  }

  /* het meeste zit op de begane grond: vier projecten plus Over en Contact */
  const NIVEAUS = [
    maakNiveau({
      naam: "P1",
      top: ["p0", "static", "p1", "laadS", "laad", "p2", "static", "p3"],
      bottom: ["static", "over", "contact", "static", "static", "leeg"]
    }),
    maakNiveau({
      naam: "P2",
      top: ["static", "p4", "laadS", "laad", "static", "leeg", "p5", "static"],
      bottom: ["leeg", "static", "static", "leeg", "static", "leeg"]
    })
  ];

  let level = 0;
  function cur() { return NIVEAUS[level]; }

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
  const CAR = { len: 124, wid: 56 };
  const START = { x: 1290, y: 620, heading: -Math.PI / 2 };
  const car = { x: START.x, y: START.y, heading: START.heading, v: 0, braking: false, reversing: false };

  function resetCar() {
    level = 0;
    updateLevelUI();
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
    const obstacles = cur().obstacles;
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

    car.braking = input.throttle < 0 && car.v > 1;
    car.reversing = car.v < -1;

    const eff = Math.max(-150, Math.min(150, car.v));
    const prev = { x: car.x, y: car.y, heading: car.heading };
    car.heading += input.steer * 0.0165 * eff * dt;
    car.x += Math.cos(car.heading) * car.v * dt;
    car.y += Math.sin(car.heading) * car.v * dt;

    if (collides(car.x, car.y, car.heading)) {
      car.x = prev.x; car.y = prev.y; car.heading = prev.heading;
      car.v = Math.abs(car.v) < 30 ? 0 : car.v * -0.3;
    }

    checkRamp();
    checkParking(dt);
  }

  /* ---------- helling naar het andere niveau ---------- */
  function checkRamp() {
    if (uiOpen) return;
    const inRamp = car.x > RAMP.x && car.x < RAMP.x + RAMP.w &&
                   car.y > RAMP.y && car.y < RAMP.y + RAMP.h;
    /* alleen wisselen als de auto de helling in rijdt (naar links beweegt) */
    if (inRamp && Math.cos(car.heading) * car.v < -30) {
      switchLevel(1 - level);
    }
  }

  function switchLevel(target) {
    level = target;
    exitSpot = null;
    car.x = 310;
    car.y = RAMP.y + RAMP.h / 2;
    car.heading = 0; /* de helling af, het middengebied in */
    car.v = 100;
    updateLevelUI();
    showLevelToast("Je bent nu op niveau " + cur().naam);
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
    const spots = cur().spots;
    for (let i = 0; i < spots.length; i++) {
      const s = spots[i];
      if (s.kind !== "project" && s.kind !== "over" && s.kind !== "contact") continue;
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
    const dbgZoom = window.__evhDebug && window.__evhDebug.zoom;
    if (dbgZoom) {
      scale = dbgZoom;
      tx = car.x - viewW / scale / 2;
      ty = car.y - viewH / scale / 2;
    } else if (fit >= 0.3) {
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
    buiten: "#26292c",
    beton: "#63666a",
    wand: "#43464a",
    kolom: "#a7abb0",
    kolomRand: "#7d8185",
    lijn: "rgba(240, 240, 236, 0.85)",
    lijnZwak: "rgba(240, 240, 236, 0.4)",
    blauw: "#1259a6",
    geel: "#d8ac2b",
    groen: "rgba(38, 132, 74, 0.32)",
    groenFel: "#2e9e5b"
  };

  /* vaste posities voor reparatieplakken, olievlekken, dilatatievoegen en tl-balken */
  const VLOER_PLAKKEN = [
    { x: 300, y: 700, w: 230, h: 64 }, { x: 1120, y: 250, w: 90, h: 150 }
  ];
  const OLIE_VLEKKEN = [
    [420, 300, 26, 14], [900, 720, 30, 16], [1150, 500, 22, 12], [700, 310, 24, 13]
  ];
  const VOEGEN_X = [520, 1040];
  const LICHT_X = [260, 470, 680, 890, 1100, 1310];
  const LICHT_EXTRA = [[1300, 490], [145, 250], [145, 760]];

  /* betonkorrel als herhalend patroon */
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = noiseCanvas.height = 96;
  (function () {
    const nctx = noiseCanvas.getContext("2d");
    for (let i = 0; i < 950; i++) {
      const shade = Math.random() > 0.5 ? 255 : 0;
      nctx.fillStyle = "rgba(" + shade + "," + shade + "," + shade + "," + (0.02 + Math.random() * 0.04).toFixed(3) + ")";
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
    ctx.fillStyle = KLEUR.buiten;
    ctx.fillRect(0, 0, viewW, viewH);

    ctx.scale(cam.scale, cam.scale);
    ctx.translate(-cam.ox, -cam.oy);

    /* wanden en vloer */
    ctx.fillStyle = KLEUR.wand;
    ctx.fillRect(4, 4, WORLD.w - 8, WORLD.h - 8);
    ctx.fillStyle = KLEUR.beton;
    ctx.fillRect(WALL, WALL, WORLD.w - 2 * WALL, WORLD.h - 2 * WALL);

    if (level === 0) {
      /* inrit: vloer loopt onderaan door de wand naar buiten */
      ctx.fillStyle = KLEUR.beton;
      ctx.fillRect(1240, WORLD.h - WALL, 100, WALL - 4);
    }

    /* vloertextuur, slijtage en voegen */
    if (!noisePattern) noisePattern = ctx.createPattern(noiseCanvas, "repeat");
    ctx.fillStyle = noisePattern;
    ctx.fillRect(WALL, WALL, WORLD.w - 2 * WALL, WORLD.h - 2 * WALL);

    ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
    VLOER_PLAKKEN.forEach(function (p) { ctx.fillRect(p.x, p.y, p.w, p.h); });
    ctx.fillStyle = "rgba(14, 16, 20, 0.1)";
    OLIE_VLEKKEN.forEach(function (v) {
      ctx.beginPath();
      ctx.ellipse(v[0], v[1], v[2], v[3], 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 3;
    VOEGEN_X.forEach(function (vx) {
      ctx.beginPath();
      ctx.moveTo(vx, WALL);
      ctx.lineTo(vx, WORLD.h - WALL);
      ctx.stroke();
    });

    /* niveaunaam op de vloer */
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 200px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cur().naam, 790, 494);
    ctx.restore();

    /* twee rijlanen met tegengestelde richtingen */
    drawLane(LAAN_A);
    drawLane(LAAN_B);

    drawRamp();

    if (level === 0) {
      /* startvak bij de inrit */
      ctx.save();
      ctx.strokeStyle = KLEUR.lijn;
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 12]);
      ctx.strokeRect(START.x - 70, START.y - 88, 140, 176);
      ctx.setLineDash([]);
      ctx.fillStyle = KLEUR.lijn;
      ctx.font = "700 24px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("START", START.x, START.y - 102);
      ctx.restore();
      drawSign(1478, 560);
    }

    cur().spots.forEach(drawSpot);
    KOLOMMEN.forEach(drawKolom);
    cur().posts.forEach(drawPost);
    cur().statics.forEach(drawStaticCar);
    drawHero();
    cur().spots.forEach(drawHoldRing);
    drawLichten();
  }

  function drawArrow(x, y, dir) {
    ctx.strokeStyle = KLEUR.lijnZwak;
    ctx.fillStyle = KLEUR.lijnZwak;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x - 26 * dir, y);
    ctx.lineTo(x + 14 * dir, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 30 * dir, y);
    ctx.lineTo(x + 8 * dir, y - 10);
    ctx.lineTo(x + 8 * dir, y + 10);
    ctx.closePath();
    ctx.fill();
  }

  function drawLane(y) {
    ctx.save();
    ctx.strokeStyle = KLEUR.lijnZwak;
    ctx.lineWidth = 5;
    ctx.setLineDash([30, 26]);
    ctx.beginPath();
    ctx.moveTo(120, y);
    ctx.lineTo(WORLD.w - 120, y);
    ctx.stroke();
    ctx.setLineDash([]);
    /* rechts rijden: onderste helft naar rechts, bovenste naar links */
    [420, 840, 1260].forEach(function (x) { drawArrow(x, y + 46, 1); });
    [300, 720, 1140].forEach(function (x) { drawArrow(x, y - 46, -1); });
    ctx.restore();
  }

  function drawRamp() {
    const naar = level === 0 ? "P2" : "P1";
    ctx.save();

    /* hellingvlak met dieptegradient */
    const grad = ctx.createLinearGradient(RAMP.x + RAMP.w, 0, RAMP.x, 0);
    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.4)");
    ctx.fillStyle = grad;
    ctx.fillRect(RAMP.x, RAMP.y, RAMP.w, RAMP.h);

    /* geel-zwarte randmarkering langs beide zijden */
    [RAMP.y, RAMP.y + RAMP.h - 14].forEach(function (ry) {
      ctx.fillStyle = KLEUR.geel;
      ctx.fillRect(RAMP.x, ry, RAMP.w, 14);
      ctx.save();
      ctx.beginPath();
      ctx.rect(RAMP.x, ry, RAMP.w, 14);
      ctx.clip();
      ctx.strokeStyle = "rgba(20, 20, 20, 0.8)";
      ctx.lineWidth = 7;
      for (let d = -20; d < RAMP.w; d += 22) {
        ctx.beginPath();
        ctx.moveTo(RAMP.x + d, ry + 16);
        ctx.lineTo(RAMP.x + d + 16, ry - 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    /* pijlen de helling op */
    const rcy = RAMP.y + RAMP.h / 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 8;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    [210, 160, 110].forEach(function (x) {
      ctx.beginPath();
      ctx.moveTo(x + 16, rcy - 26);
      ctx.lineTo(x - 4, rcy);
      ctx.lineTo(x + 16, rcy + 26);
      ctx.stroke();
    });

    /* bestemming boven de helling */
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "700 20px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("naar " + naar, RAMP.x + RAMP.w / 2, RAMP.y - 14);
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

    /* speciale vakken krijgen gekleurd wegdek */
    if (s.kind === "over" || s.kind === "contact") {
      ctx.fillStyle = "rgba(18, 89, 166, 0.32)";
      ctx.fillRect(s.x + 4, s.y + 4, s.w - 8, s.h - 8);
    }
    if (s.kind === "laad") {
      ctx.fillStyle = KLEUR.groen;
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

    /* bliksem op het wegdek van laadvakken */
    if (s.kind === "laad") {
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h / 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.moveTo(cx + 4, cy - 16);
      ctx.lineTo(cx - 7, cy + 3);
      ctx.lineTo(cx - 1, cy + 3);
      ctx.lineTo(cx - 4, cy + 16);
      ctx.lineTo(cx + 7, cy - 3);
      ctx.lineTo(cx + 1, cy - 3);
      ctx.closePath();
      ctx.fill();
    }

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

  function drawKolom(k) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(k.x + 4, k.y + 5, k.w, k.h);
    ctx.fillStyle = KLEUR.kolom;
    ctx.fillRect(k.x, k.y, k.w, k.h);
    ctx.strokeStyle = KLEUR.kolomRand;
    ctx.lineWidth = 2;
    ctx.strokeRect(k.x, k.y, k.w, k.h);
    ctx.restore();
  }

  function drawPost(p) {
    ctx.save();
    /* laadkabel naar de aangesloten auto */
    if (p.cable) {
      const naarY = p.opening === "down" ? p.y + 26 : p.y - 16;
      ctx.strokeStyle = "#2f3336";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(p.cx, p.y + 5);
      ctx.quadraticCurveTo(p.cx - 14, p.y + (p.opening === "down" ? 16 : -6), p.cx - 9, naarY);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    roundRect(p.cx - 8, p.y - 1, 17, 15, 3);
    ctx.fill();
    ctx.fillStyle = KLEUR.groenFel;
    roundRect(p.cx - 9, p.y - 3, 17, 15, 3);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    /* stekkersymbool */
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(p.cx - 0.5, p.y + 4.5, 3.4, 0, Math.PI * 2);
    ctx.stroke();
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

  /* de heldauto: een witte klassieke 911 van boven, met walvisstaart */
  function drawHero() {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.heading + Math.PI / 2); /* tekenen met neus omhoog */
    ctx.scale(1.35, 1.35); /* tekening staat in 92x46-maten, botsingsbox is 124x56 */

    const GLAS = "rgba(22, 30, 38, 0.88)";

    /* slagschaduw */
    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(2.5, 4, 22, 46, 0, 0, Math.PI * 2);
    ctx.fill();

    /* carrosserie: smalle neus, taille, brede achterschermen, rond kontje */
    ctx.beginPath();
    ctx.moveTo(0, -45.5);
    ctx.bezierCurveTo(9, -45.5, 15, -42.5, 16.3, -36);
    ctx.bezierCurveTo(17.4, -28, 15.8, -20, 15.8, -12);
    ctx.bezierCurveTo(15.8, -2, 19.6, 6, 20.3, 16);
    ctx.bezierCurveTo(20.9, 26, 19.8, 36, 16.2, 42);
    ctx.bezierCurveTo(13, 45.8, 6, 46, 0, 46);
    ctx.bezierCurveTo(-6, 46, -13, 45.8, -16.2, 42);
    ctx.bezierCurveTo(-19.8, 36, -20.9, 26, -20.3, 16);
    ctx.bezierCurveTo(-19.6, 6, -15.8, -2, -15.8, -12);
    ctx.bezierCurveTo(-15.8, -20, -17.4, -28, -16.3, -36);
    ctx.bezierCurveTo(-15, -42.5, -9, -45.5, 0, -45.5);
    ctx.closePath();
    ctx.fillStyle = "#eceef0";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.38)";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    /* buitenspiegels */
    ctx.fillStyle = "#eceef0";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 1.2;
    roundRect(-20.6, -20, 4.8, 6.5, 2);
    ctx.fill(); ctx.stroke();
    roundRect(15.8, -20, 4.8, 6.5, 2);
    ctx.fill(); ctx.stroke();

    /* naden van de voorklep, tussen de schermen */
    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-10.5, -18);
    ctx.bezierCurveTo(-9, -28, -7.5, -34, -5.8, -40);
    ctx.quadraticCurveTo(0, -42.5, 5.8, -40);
    ctx.bezierCurveTo(7.5, -34, 9, -28, 10.5, -18);
    ctx.stroke();

    /* ronde koplampen op de schermen, met chromen rand */
    [-11.3, 11.3].forEach(function (hx) {
      ctx.fillStyle = "#f7f4dc";
      ctx.beginPath();
      ctx.arc(hx, -37, 4.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    });
    /* knipperlichten onder de koplampen, aan de rand van de neus */
    ctx.fillStyle = "#d99a2b";
    roundRect(-9.8, -43.4, 3.4, 2.2, 1);
    ctx.fill();
    roundRect(6.4, -43.4, 3.4, 2.2, 1);
    ctx.fill();

    /* voorruit: breed bij de motorkap, smaller bij het dak */
    ctx.fillStyle = GLAS;
    ctx.beginPath();
    ctx.moveTo(-13.5, -20);
    ctx.quadraticCurveTo(0, -22.5, 13.5, -20);
    ctx.lineTo(11, -8);
    ctx.quadraticCurveTo(0, -6.5, -11, -8);
    ctx.closePath();
    ctx.fill();

    /* zijruiten: gebogen glasranden die de daklijn volgen */
    ctx.strokeStyle = "rgba(22, 30, 38, 0.6)";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-13.2, -15);
    ctx.quadraticCurveTo(-15.2, -2, -13.2, 11);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(13.2, -15);
    ctx.quadraticCurveTo(15.2, -2, 13.2, 11);
    ctx.stroke();
    ctx.lineCap = "butt";

    /* achterruit, aflopend naar het motordek */
    ctx.fillStyle = GLAS;
    ctx.beginPath();
    ctx.moveTo(-11, 6);
    ctx.quadraticCurveTo(0, 4.5, 11, 6);
    ctx.lineTo(12.2, 18.5);
    ctx.quadraticCurveTo(0, 21.5, -12.2, 18.5);
    ctx.closePath();
    ctx.fill();

    /* motordek met luchtrooster */
    roundRect(-9, 23.5, 18, 11, 3.5);
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.lineWidth = 1.5;
    [26.4, 29.2, 32].forEach(function (gy) {
      ctx.beginPath();
      ctx.moveTo(-6.8, gy);
      ctx.lineTo(6.8, gy);
      ctx.stroke();
    });

    /* walvisstaart met zwarte rubberrand */
    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    roundRect(-17.5, 34.2, 35, 3.6, 1.8);
    ctx.fill();
    roundRect(-19, 36, 38, 8.6, 3.2);
    ctx.fillStyle = "#e2e4e6";
    ctx.fill();
    ctx.strokeStyle = "rgba(20, 22, 24, 0.65)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-16, 40.4);
    ctx.lineTo(16, 40.4);
    ctx.stroke();

    /* achterlichten: fel met gloed bij remmen en achteruitrijden */
    const rem = car.braking || car.reversing;
    if (rem) {
      ctx.fillStyle = "rgba(255, 64, 44, 0.35)";
      ctx.beginPath();
      ctx.ellipse(-14.7, 44.6, 6.5, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(14.7, 44.6, 6.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = rem ? "#ff4433" : "#a8231d";
    roundRect(-17.4, 43.2, 5.4, 2.4, 1.2);
    ctx.fill();
    roundRect(12, 43.2, 5.4, 2.4, 1.2);
    ctx.fill();
    /* witte achteruitrijlichten */
    if (car.reversing) {
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillStyle = "#fdfbe8";
      roundRect(-10.8, 43.3, 3.4, 2.2, 1);
      ctx.fill(); ctx.stroke();
      roundRect(7.4, 43.3, 3.4, 2.2, 1);
      ctx.fill(); ctx.stroke();
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
    ctx.arc(cx, cy, 54, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = KLEUR.blauw;
    ctx.beginPath();
    ctx.arc(cx, cy, 54, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /* tl-balken aan het plafond, getekend over alles heen */
  function drawLichten() {
    ctx.save();
    function balk(x, y) {
      ctx.fillStyle = "rgba(255, 255, 240, 0.07)";
      ctx.beginPath();
      ctx.ellipse(x, y, 68, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 240, 0.17)";
      roundRect(x - 42, y - 4, 84, 8, 4);
      ctx.fill();
    }
    LICHT_X.forEach(function (x) { balk(x, LAAN_A); balk(x, LAAN_B); });
    LICHT_EXTRA.forEach(function (p) { balk(p[0], p[1]); });
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

  function updateLevelUI() {
    document.getElementById("level").textContent = "Niveau " + cur().naam;
  }

  let levelToastTimer = null;
  function showLevelToast(tekst) {
    const t = document.getElementById("level-toast");
    t.textContent = tekst;
    t.hidden = false;
    clearTimeout(levelToastTimer);
    levelToastTimer = setTimeout(function () { t.hidden = true; }, 2200);
  }

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
  updateLevelUI();
  resize();
  requestAnimationFrame(frame);

  /* testhaakje: alleen actief bij #debug in de URL */
  if (location.hash.indexOf("debug") !== -1) {
    window.__evhDebug = {
      car: car,
      keys: keys,
      step: function (dt) { step(dt); },
      render: function () { updateCamera(); draw(); },
      getLevel: function () { return level; },
      setLevel: function (n) { level = n; updateLevelUI(); }
    };
  }
})();
