(() => {
  const canvas = document.getElementById("networkCanvas");
  const sidebar = document.querySelector(".sidebar");
  if (!canvas || !sidebar) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationId = null;
  let nodes = [];
  let stars = [];
  let signals = [];
  let lastTime = 0;

  // Periodic "activity burst" state — the network flares to life on a cadence,
  // like a forward pass firing through a neural net.
  let elapsed = 0;
  let burstTimer = 0;
  const BURST_INTERVAL = 5200;   // ms between spontaneous bursts
  let burstEnergy = 0;           // 0..1, decays after each burst

  const mouse = {
    x: 0,
    y: 0,
    active: false
  };

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();

    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createScene();
    draw();
  }

  function createScene() {
    const nodeCount = Math.max(28, Math.floor((width * height) / 13000));
    const starCount = Math.max(80, Math.floor((width * height) / 6200));

    nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.7 + 1.3,
      // activation flashes toward 1 when a signal arrives, then decays
      act: 0,
      // last time this node fired — enforces a refractory period so cascades
      // ripple outward instead of instantly saturating
      lastFire: -1e9,
      // slow individual phase so each node "breathes" out of sync
      phase: Math.random() * Math.PI * 2
    }));

    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.36 + 0.12,
      tw: Math.random() * Math.PI * 2
    }));

    signals = [];
  }

  function setMousePosition(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();

    mouse.x = clientX - rect.left;
    mouse.y = clientY - rect.top;
    mouse.active = true;
  }

  function clearMouse() {
    mouse.active = false;
  }

  const FIRE_RADIUS = 150;      // how far a firing node reaches for neighbours
  const FIRE_COOLDOWN = 520;    // ms refractory before a node can fire again
  const RELAY_CHANCE = 0.82;    // per-neighbour chance to propagate the cascade
  const MAX_BRANCHES = 4;       // how many neighbours a node forwards to

  // Spawn a signal that travels from node a to node b (data flowing down an edge).
  function spawnSignal(a, b) {
    signals.push({ a, b, t: Math.random() * 0.1, speed: 0.011 + Math.random() * 0.014 });
  }

  // Fire a node: flash it, kick it, and shoot signals to nearby neighbours so
  // the activation branches outward — the seed of a chain reaction.
  function fireNode(node, kick) {
    if (elapsed - node.lastFire < FIRE_COOLDOWN) return;
    node.lastFire = elapsed;
    node.act = 1;

    // find nearby neighbours, nearest first
    const near = [];
    for (const b of nodes) {
      if (b === node) continue;
      const d = Math.hypot(node.x - b.x, node.y - b.y);
      if (d < FIRE_RADIUS) near.push({ b, d });
    }
    near.sort((p, q) => p.d - q.d);

    let branches = 0;
    for (const { b } of near) {
      if (branches >= MAX_BRANCHES) break;
      if (elapsed - b.lastFire < FIRE_COOLDOWN) continue; // still refractory
      if (Math.random() < RELAY_CHANCE) {
        spawnSignal(node, b);
        branches++;
      }
    }

    if (kick) {
      const ang = Math.random() * Math.PI * 2;
      node.vx += Math.cos(ang) * 0.6 * kick;
      node.vy += Math.sin(ang) * 0.6 * kick;
    }
  }

  // Kick off a cascade from one or two seed nodes; it spreads on its own.
  function triggerBurst(strength) {
    burstEnergy = Math.min(1, burstEnergy + strength);
    const seeds = Math.random() < 0.5 ? 1 : 2;
    for (let s = 0; s < seeds; s++) {
      const a = nodes[(Math.random() * nodes.length) | 0];
      a.lastFire = -1e9; // force the seed to fire
      fireNode(a, strength);
    }
  }

  function update(delta) {
    const speed = Math.min(delta / 16.67, 2);
    elapsed += delta;

    // Periodic self-driven bursts keep the field lively without the mouse.
    burstTimer += delta;
    if (burstTimer >= BURST_INTERVAL) {
      burstTimer = 0;
      triggerBurst(0.85);
    }
    burstEnergy *= Math.pow(0.9985, delta);

    const influenceRadius = 150;

    for (const node of nodes) {
      if (mouse.active) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < influenceRadius && dist > 0.001) {
          const force = (1 - dist / influenceRadius) * 0.05;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
      }

      // gentle wander so motion never fully settles
      node.phase += delta * 0.0012;
      node.vx += Math.cos(node.phase) * 0.006;
      node.vy += Math.sin(node.phase * 1.3) * 0.006;

      // lighter damping + burst-scaled boost => livelier baseline
      const damp = 0.997 - burstEnergy * 0.004;
      node.vx *= damp;
      node.vy *= damp;

      const maxVel = 0.55 + burstEnergy * 0.9;
      node.vx = Math.max(-maxVel, Math.min(maxVel, node.vx));
      node.vy = Math.max(-maxVel, Math.min(maxVel, node.vy));

      node.x += node.vx * speed;
      node.y += node.vy * speed;

      node.act *= Math.pow(0.94, speed);

      if (node.x < -18) node.x = width + 18;
      if (node.x > width + 18) node.x = -18;
      if (node.y < -18) node.y = height + 18;
      if (node.y > height + 18) node.y = -18;
    }

    // advance travelling signals; flash the destination when they arrive
    for (let i = signals.length - 1; i >= 0; i--) {
      const sig = signals[i];
      sig.t += sig.speed * speed;
      if (sig.t >= 1) {
        // arrival lights the node AND forwards the cascade to its neighbours
        fireNode(sig.b, 0.25);
        signals.splice(i, 1);
      }
    }
    if (signals.length > 240) signals.splice(0, signals.length - 240);
  }

  function drawStars() {
    for (const star of stars) {
      star.tw += 0.02;
      const a = star.a * (0.7 + 0.3 * Math.sin(star.tw));
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    const maxDist = 122;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          let alpha = (1 - dist / maxDist) * (0.16 + burstEnergy * 0.14);

          if (mouse.active) {
            const da = Math.hypot(a.x - mouse.x, a.y - mouse.y);
            const db = Math.hypot(b.x - mouse.x, b.y - mouse.y);

            if (da < 130 || db < 130) {
              alpha += 0.07;
            }
          }

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(178,196,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function drawSignals() {
    for (const sig of signals) {
      const x = sig.a.x + (sig.b.x - sig.a.x) * sig.t;
      const y = sig.a.y + (sig.b.y - sig.a.y) * sig.t;
      const fade = Math.sin(sig.t * Math.PI); // brightest mid-edge

      ctx.beginPath();
      ctx.arc(x, y, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150,180,255,${0.10 * fade})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210,225,255,${0.9 * fade})`;
      ctx.fill();
    }
  }

  function drawNodes() {
    for (const node of nodes) {
      let glowAlpha = 0.08 + node.act * 0.22;
      let fillAlpha = 0.48 + node.act * 0.5;
      let radius = node.r + node.act * 1.6;

      if (mouse.active) {
        const d = Math.hypot(node.x - mouse.x, node.y - mouse.y);
        if (d < 120) {
          glowAlpha += 0.08;
          fillAlpha = Math.min(1, fillAlpha + 0.2);
        }
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 2.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190,205,255,${glowAlpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${fillAlpha})`;
      ctx.fill();
    }
  }

  function drawMouseAura() {
    if (!mouse.active) return;

    const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 125);
    g.addColorStop(0, "rgba(160,185,255,0.07)");
    g.addColorStop(1, "rgba(160,185,255,0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 125, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    drawStars();
    drawMouseAura();
    drawConnections();
    drawSignals();
    drawNodes();
  }

  function animate(time) {
    if (!lastTime) lastTime = time;

    const delta = time - lastTime;
    lastTime = time;

    update(delta);
    draw();

    animationId = requestAnimationFrame(animate);
  }

  function restart() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    lastTime = 0;
    burstTimer = 0;
    resizeCanvas();

    if (!reduceMotion) {
      // kick things off with an immediate burst so it's alive on load
      triggerBurst(0.6);
      animationId = requestAnimationFrame(animate);
    }
  }

  let resizeTimer = null;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(restart, 120);
  });

  sidebar.addEventListener("mousemove", (e) => {
    setMousePosition(e.clientX, e.clientY);
  });

  sidebar.addEventListener("mouseleave", clearMouse);

  // clicking the sidebar fires a manual burst
  sidebar.addEventListener("click", (e) => {
    setMousePosition(e.clientX, e.clientY);
    let src = null;
    let bestD = Infinity;
    for (const n of nodes) {
      const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
      if (d < bestD) { bestD = d; src = n; }
    }
    burstEnergy = Math.min(1, burstEnergy + 0.6);
    if (src) {
      src.lastFire = -1e9;
      fireNode(src, 0.5);
    }
  });

  sidebar.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches[0]) {
      setMousePosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  sidebar.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) {
      setMousePosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  sidebar.addEventListener("touchend", clearMouse, { passive: true });

  restart();
})();
