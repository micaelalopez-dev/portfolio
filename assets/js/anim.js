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
})();
