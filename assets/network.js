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
  let lastTime = 0;

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
    const nodeCount = Math.max(24, Math.floor((width * height) / 16000));
    const starCount = Math.max(80, Math.floor((width * height) / 6200));

    nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.7 + 1.3
    }));

    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.36 + 0.12
    }));
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

  function update(delta) {
    const speed = Math.min(delta / 16.67, 2);
    const influenceRadius = 130;

    for (const node of nodes) {
      if (mouse.active) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < influenceRadius && dist > 0.001) {
          const force = (1 - dist / influenceRadius) * 0.026;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
      }

      node.vx *= 0.994;
      node.vy *= 0.994;

      const maxVel = 0.34;
      node.vx = Math.max(-maxVel, Math.min(maxVel, node.vx));
      node.vy = Math.max(-maxVel, Math.min(maxVel, node.vy));

      node.x += node.vx * speed;
      node.y += node.vy * speed;

      if (node.x < -18) node.x = width + 18;
      if (node.x > width + 18) node.x = -18;
      if (node.y < -18) node.y = height + 18;
      if (node.y > height + 18) node.y = -18;
    }
  }

  function drawStars() {
    for (const star of stars) {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${star.a})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    const maxDist = 112;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          let alpha = (1 - dist / maxDist) * 0.17;

          if (mouse.active) {
            const da = Math.hypot(a.x - mouse.x, a.y - mouse.y);
            const db = Math.hypot(b.x - mouse.x, b.y - mouse.y);

            if (da < 120 || db < 120) {
              alpha += 0.06;
            }
          }

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function drawNodes() {
    for (const node of nodes) {
      let glowAlpha = 0.075;
      let fillAlpha = 0.46;

      if (mouse.active) {
        const d = Math.hypot(node.x - mouse.x, node.y - mouse.y);

        if (d < 110) {
          glowAlpha = 0.14;
          fillAlpha = 0.68;
        }
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r + 2.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${glowAlpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${fillAlpha})`;
      ctx.fill();
    }
  }

  function drawMouseAura() {
    if (!mouse.active) return;

    const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 115);
    g.addColorStop(0, "rgba(255,255,255,0.055)");
    g.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 115, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    drawStars();
    drawMouseAura();
    drawConnections();
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
    resizeCanvas();

    if (!reduceMotion) {
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