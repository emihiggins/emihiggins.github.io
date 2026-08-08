// Small, dependency-free progressive enhancement.
// The site works fully without JS — this just adds a few niceties.

// 1) Current year in the footer.
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// 2) Count-up animation for stat numbers when they scroll into view.
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const stats = document.querySelectorAll('.stat-num[data-count]');

if (!prefersReduced && 'IntersectionObserver' in window && stats.length) {
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.textContent.replace(/[0-9]/g, '') || '';
    const duration = 900;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  stats.forEach((el) => io.observe(el));
}

// 3) Scroll-spy: highlight the side-nav link for the section in view.
const navLinks = Array.from(document.querySelectorAll('.side-nav a'));
if ('IntersectionObserver' in window && navLinks.length) {
  const byId = new Map();
  const targets = [];
  navLinks.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) { byId.set(id, link); targets.push(el); }
  });

  const visible = new Set();
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target.id);
      else visible.delete(entry.target.id);
    });
    // Activate the first (topmost) currently-visible section.
    const activeId = targets.map((t) => t.id).find((id) => visible.has(id));
    navLinks.forEach((l) => l.classList.remove('is-active'));
    if (activeId && byId.get(activeId)) byId.get(activeId).classList.add('is-active');
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  targets.forEach((t) => spy.observe(t));
}

// 4) Deep-dives dropdown: click/keyboard toggle (hover is handled in CSS).
document.querySelectorAll('.has-sub').forEach((group) => {
  const trigger = group.querySelector('.sub-trigger');
  if (!trigger) return;
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = group.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(open));
  });
  group.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') { group.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); trigger.blur(); }
  });
});
document.addEventListener('click', (e) => {
  document.querySelectorAll('.has-sub.open').forEach((group) => {
    if (!group.contains(e.target)) {
      group.classList.remove('open');
      const t = group.querySelector('.sub-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    }
  });
});
