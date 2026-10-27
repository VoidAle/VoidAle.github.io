/* Content stays visible unless an animation has initialized successfully. */
(function () {
  'use strict';
  var root = document.documentElement;
  var button = document.querySelector('[data-motion-toggle]');
  var query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var choice = null, reduced = false, pending = [], observer = null, frame = null, revealStarted = false;
  var raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function (fn) { return window.setTimeout(fn, 16); };
  try { var saved = window.localStorage.getItem('voidale-motion'); if (saved === 'full' || saved === 'reduced') choice = saved; } catch (error) {}

  function show(el) {
    el.classList.remove('reveal-pending');
    el.classList.add('revealed');
    if (observer) observer.unobserve(el);
  }
  function showAll() { pending.forEach(show); pending = []; }
  function resetPointers() {
    var orbit = document.querySelector('.orbit');
    if (orbit) { orbit.style.setProperty('--orbit-x', '0px'); orbit.style.setProperty('--orbit-y', '0px'); }
    var editor = document.querySelector('[data-tilt]');
    if (editor) editor.style.transform = '';
  }
  function applyMotion() {
    reduced = choice ? choice === 'reduced' : !!(query && query.matches);
    root.setAttribute('data-motion', reduced ? 'reduced' : 'full');
    if (button) {
      button.hidden = false;
      button.textContent = reduced ? 'Animazioni: ridotte' : 'Animazioni: attive';
      button.setAttribute('aria-pressed', String(!reduced));
      button.setAttribute('aria-label', reduced ? 'Attiva le animazioni' : 'Riduci le animazioni');
    }
    if (reduced) { showAll(); resetPointers(); }
    else startReveal();
  }
  applyMotion();
  if (button) button.addEventListener('click', function () {
    choice = reduced ? 'full' : 'reduced';
    try { window.localStorage.setItem('voidale-motion', choice); } catch (error) {}
    applyMotion();
  });
  if (query) {
    if (typeof query.addEventListener === 'function') query.addEventListener('change', applyMotion);
    else if (typeof query.addListener === 'function') query.addListener(applyMotion);
  }

  // Scroll/resize also rescue entries if the observer is delayed or unavailable.
  function scanVisible() {
    frame = null;
    var height = window.innerHeight || root.clientHeight || 800;
    pending = pending.filter(function (el) {
      if (reduced || el.getBoundingClientRect().top < height - 16) { show(el); return false; }
      return true;
    });
  }
  function queueScan() { if (frame === null) frame = raf(scanVisible); }
  function startReveal() {
    if (revealStarted || reduced) return;
    revealStarted = true;
    try {
      var targets = document.querySelectorAll('.section.reveal:not(#learning), #learning .section-label, #learning .learning-heading, #learning .language-placeholder');
      if (typeof window.IntersectionObserver === 'function') {
        try {
          observer = new window.IntersectionObserver(function (entries) {
            entries.forEach(function (entry) { if (entry.isIntersecting || entry.intersectionRatio > 0) show(entry.target); });
            pending = pending.filter(function (el) { return el.classList.contains('reveal-pending'); });
          }, { threshold: 0, rootMargin: '0px 0px -16px 0px' });
        } catch (error) { observer = null; }
      }
      Array.prototype.forEach.call(targets, function (el, index) {
        el.style.setProperty('--reveal-delay', el.classList.contains('language-placeholder') ? (index % 3) * 75 + 'ms' : '0ms');
        pending.push(el);
        el.classList.add('reveal-pending');
        if (observer) {
          try { observer.observe(el); } catch (error) { observer.disconnect(); observer = null; }
        }
      });
      window.addEventListener('scroll', queueScan, { passive: true });
      window.addEventListener('resize', queueScan, { passive: true });
      window.addEventListener('pageshow', queueScan);
      raf(function () { queueScan(); });
      window.setTimeout(scanVisible, 1200);
    } catch (error) { showAll(); if (observer) observer.disconnect(); }
  }

  function onPointer(el, move, leave) {
    if (!el) return;
    var pointer = 'PointerEvent' in window;
    el.addEventListener(pointer ? 'pointermove' : 'mousemove', function (event) {
      if (reduced || event.pointerType === 'touch') return;
      if (typeof window.matchMedia === 'function' && window.matchMedia('(hover: none)').matches) return;
      move(event);
    });
    if (leave) el.addEventListener(pointer ? 'pointerleave' : 'mouseleave', leave);
  }
  var hero = document.querySelector('.hero'), orbit = document.querySelector('.orbit');
  onPointer(hero, function (event) {
    if (!orbit) return;
    var r = hero.getBoundingClientRect();
    orbit.style.setProperty('--orbit-x', ((event.clientX-r.left) / Math.max(r.width,1) - .5)*18 + 'px');
    orbit.style.setProperty('--orbit-y', ((event.clientY-r.top) / Math.max(r.height,1) - .5)*18 + 'px');
  }, resetPointers);
  Array.prototype.forEach.call(document.querySelectorAll('.service-card, #learning .language-placeholder'), function (card) {
    onPointer(card, function (event) {
      var r=card.getBoundingClientRect();
      card.style.setProperty('--mx', event.clientX-r.left+'px');
      card.style.setProperty('--my', event.clientY-r.top+'px');
    });
  });
  var editor=document.querySelector('[data-tilt]');
  onPointer(editor, function (event) {
    var r=editor.getBoundingClientRect();
    var x=(event.clientX-r.left)/Math.max(r.width,1)-.5;
    var y=(event.clientY-r.top)/Math.max(r.height,1)-.5;
    editor.style.transform='perspective(1100px) rotateY('+x*8+'deg) rotateX('+-y*8+'deg)';
  }, function () { editor.style.transform=''; });
})();

