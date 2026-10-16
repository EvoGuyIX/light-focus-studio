const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal').forEach((node) => revealObserver.observe(node));

if (!reducedMotion) {
  const media = [...document.querySelectorAll('[data-parallax]')];
  const panels = [...document.querySelectorAll('.story-panel')];
  let scheduled = false;

  const paint = () => {
    const viewport = window.innerHeight;

    media.forEach((frame) => {
      const rect = frame.getBoundingClientRect();
      const strength = Number(frame.dataset.parallax || 0.06);
      const progress = (viewport - rect.top) / (viewport + rect.height);
      const shift = (progress - 0.5) * viewport * strength;
      frame.style.setProperty('--shift', `${shift.toFixed(1)}px`);
    });

    panels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - viewport)));
      const clip = 7 - progress * 7;
      panel.style.setProperty('--clip', `${clip.toFixed(2)}%`);
    });

    scheduled = false;
  };

  const requestPaint = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(paint);
    }
  };

  window.addEventListener('scroll', requestPaint, { passive: true });
  window.addEventListener('resize', requestPaint);
  paint();
}
