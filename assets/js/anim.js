/* ============================================
   ANIMACIONES — compartido por todo el sitio
   Reveals al scroll + nav inteligente.
   Respeta prefers-reduced-motion.
   ============================================ */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Reveals al entrar en pantalla ----------
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(el => el.classList.add("visible"));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(el => io.observe(el));
  }

  // ---------- Nav: siempre visible (fijo arriba) ----------
  // (comportamiento de auto-ocultar desactivado a pedido)

  // ---------- Menú móvil ----------
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const abierto = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------- Fondo de puntos/glows (fijo, se ve en todo el sitio al scrollear) ----------
  const canvas = document.createElement("canvas");
  canvas.id = "stars-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");

  const COLORES = ["#9166BE", "#E8639E", "#57C7B0", "#B299D3", "#F2EEF7"];
  let particulas = [];
  let ancho, alto, dpr;

  function crearParticulas() {
    particulas = Array.from({ length: 65 }, () => ({
      x: Math.random() * ancho,
      y: Math.random() * alto,
      r: Math.random() * 1.8 + 0.6,
      color: COLORES[Math.floor(Math.random() * COLORES.length)],
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.4,
      baseAlpha: Math.random() * 0.5 + 0.2,
      pulso: Math.random() * Math.PI,
    }));
  }

  function redimensionar() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth;
    alto = window.innerHeight;
    canvas.width = ancho * dpr;
    canvas.height = alto * dpr;
    canvas.style.width = ancho + "px";
    canvas.style.height = alto + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    crearParticulas();
  }

  function dibujar() {
    ctx.clearRect(0, 0, ancho, alto);
    particulas.forEach(p => {
      const alphaActual = p.baseAlpha + Math.sin(p.pulso) * 0.2;
      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(1, alphaActual));
      ctx.fillStyle = p.color;
      ctx.shadowBlur = p.r * 4;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ---------- Reacción al scroll: las partículas se aceleran al scrollear ----------
  let ultimoScrollY = window.scrollY;
  let velScroll = 0;
  window.addEventListener("scroll", () => {
    const actualY = window.scrollY;
    velScroll = Math.abs(actualY - ultimoScrollY) * 0.08;
    ultimoScrollY = actualY;
  }, { passive: true });

  function mover() {
    velScroll *= 0.94; // amortigua hasta volver al reposo
    particulas.forEach(p => {
      p.x += p.vx + (p.vx > 0 ? velScroll : -velScroll) * 0.4;
      p.y += p.vy - velScroll * 0.5;
      p.pulso += 0.025;
      if (p.x < 0) p.x = ancho; else if (p.x > ancho) p.x = 0;
      if (p.y < 0) p.y = alto; else if (p.y > alto) p.y = 0;
    });
  }

  let corriendo = false;
  function loop() {
    if (!corriendo) return;
    mover();
    dibujar();
    requestAnimationFrame(loop);
  }
  function iniciar() {
    if (corriendo) return;
    corriendo = true;
    requestAnimationFrame(loop);
  }
  function detener() {
    corriendo = false;
  }

  redimensionar();
  if (reduceMotion) {
    dibujar(); // fondo estático, sin animación
  } else {
    iniciar();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) detener(); else iniciar();
    });
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      redimensionar();
      if (reduceMotion) dibujar();
    }, 150);
  });
})();
