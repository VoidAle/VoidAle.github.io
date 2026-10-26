document.documentElement.classList.add('js');

const sections = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  sections.forEach(section => observer.observe(section));
} else {
  sections.forEach(section => section.classList.add('visible'));
}

const orbit = document.querySelector('.orbit');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('.hero').addEventListener('pointermove', event => {
  if (reduceMotion.matches || event.pointerType === 'touch') return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  orbit.style.translate = `${x * 18}px ${y * 18}px`;
});
document.querySelector('.hero').addEventListener('pointerleave', () => {
  orbit.style.translate = '0px 0px';
});

// Small spatial responses keep the interface tactile without obscuring content.
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (reduceMotion.matches || event.pointerType === 'touch') return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  });
});
const codeCard = document.querySelector('[data-tilt]');
codeCard.addEventListener('pointermove', event => {
  if (reduceMotion.matches || event.pointerType === 'touch') return;
  const rect = codeCard.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  codeCard.style.transform = `perspective(1100px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
});
codeCard.addEventListener('pointerleave', () => { codeCard.style.transform = ''; });

// Interactive lighting on each language, without simulated skill percentages.
document.querySelectorAll('#learning .language-placeholder').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (reduceMotion.matches || event.pointerType === 'touch') return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  });
});

const languageRows = document.querySelectorAll('#learning .language-placeholder');
if ('IntersectionObserver' in window) {
  const rowObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('row-visible');
        rowObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  languageRows.forEach(row => rowObserver.observe(row));
} else {
  languageRows.forEach(row => row.classList.add('row-visible'));
}
