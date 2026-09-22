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

  const COLORES = ["#9166BE", "#E8639E", "#57C7B0", "#F2EEF7"];
  let particulas = [];
  let ancho, alto, dpr;

  function crearParticulas() {
    const area = ancho * alto;
    const cantidad = Math.min(90, Math.max(28, Math.round(area / 13000)));
    particulas = Array.from({ length: cantidad }, () => {
      const esGlow = Math.random() < 0.3;
      return {
        x: Math.random() * ancho,
        y: Math.random() * alto,
        r: esGlow ? 2 + Math.random() * 2.2 : 0.6 + Math.random() * 1.2,
        glow: esGlow,
        color: COLORES[Math.floor(Math.random() * COLORES.length)],
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        fase: Math.random() * Math.PI * 2,
        vel: 0.004 + Math.random() * 0.006,
      };
    });
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

  function dibujar(t) {
    ctx.clearRect(0, 0, ancho, alto);
    particulas.forEach(p => {
      const parpadeo = 0.45 + 0.55 * Math.sin(t * p.vel + p.fase);
      ctx.beginPath();
      ctx.globalAlpha = (p.glow ? 0.55 : 0.8) * parpadeo;
      if (p.glow) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function mover() {
    particulas.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = ancho + 10; else if (p.x > ancho + 10) p.x = -10;
      if (p.y < -10) p.y = alto + 10; else if (p.y > alto + 10) p.y = -10;
    });
  }

  let corriendo = false;
  function loop(t) {
    if (!corriendo) return;
    mover();
    dibujar(t);
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
    dibujar(0); // fondo estático, sin animación
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
      if (reduceMotion) dibujar(0);
    }, 150);
  });
})();
