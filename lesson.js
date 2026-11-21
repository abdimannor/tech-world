/* Lesson 2 front page: the rule picker and the "try it yourself" task. */
(() => {
  'use strict';
  const demo = document.getElementById('demo');
  const card = document.getElementById('demo-card');
  const out = document.getElementById('demo-out');
  const strip = document.getElementById('demo-strip');
  if (demo && card && out) {
    const NOTE = {
      p: 'En elementselektor träffar alla <code>&lt;p&gt;</code>, oavsett klass.',
      '.highlight': 'En klass träffar bara element som har <code>class="highlight"</code>.',
      '.slogan': 'Samma tagg som den röda raden, en annan klass, ett annat utseende.',
      h1: 'Det finns en enda rubrik, så elementselektorn räcker.',
    };
    let current = null;
    function run() {
      for (const el of card.children) el.classList.remove('is-hit');
      if (!current) return;
      const hits = [...card.querySelectorAll(current)];
      // Restart the hit animation on every pick.
      void card.offsetWidth;
      hits.forEach((el) => el.classList.add('is-hit'));
      const n = hits.length;
      out.innerHTML = '<strong><code>' + current + '</code> träffar ' + n + ' element.</strong> ' +
        (n === 0 ? 'Inget element har klassen längre, så regeln gör ingenting och raden faller tillbaka på <code>p</code>.' : NOTE[current]);
    }
    demo.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sel]');
      if (!b) return;
      current = b.dataset.sel;
      demo.querySelectorAll('[data-sel]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      run();
    });
    if (strip) strip.addEventListener('change', () => {
      card.querySelectorAll('p').forEach((p, i) => {
        if (strip.checked) { p.dataset.was = p.className; p.removeAttribute('class'); }
        else p.className = p.dataset.was || '';
      });
      if (current) run();
      else out.textContent = strip.checked ? 'Klasserna är borta: båda styckena ser nu likadana ut.' : 'Välj en regel.';
    });
  }

  const form = document.getElementById('task-form');
  const doc = document.getElementById('task-doc');
  const input = document.getElementById('task-input');
  const result = document.getElementById('task-result');
  if (!form || !doc) return;
  const target = doc.querySelector('.slogan');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    for (const el of doc.children) el.classList.remove('is-hit', 'is-extra');
    result.className = 'task-result';
    const sel = input.value.trim();
    if (!sel) { result.textContent = 'Skriv en selektor först.'; return; }
    let hits;
    try { hits = [...doc.querySelectorAll(':scope ' + sel)]; }
    catch (err) { result.textContent = 'Det där är ingen giltig selektor. Prova till exempel en klass med punkt framför.'; input.setAttribute('aria-invalid', 'true'); return; }
    input.removeAttribute('aria-invalid');
    hits.forEach((el) => el.classList.add(el === target ? 'is-hit' : 'is-extra'));
    if (hits.length === 1 && hits[0] === target) {
      result.textContent = 'Rätt. ' + sel + ' träffar bara den blå raden.';
      result.classList.add('ok');
      if (window.courseDone) window.courseDone();
    } else if (!hits.includes(target)) {
      result.textContent = hits.length ? 'Den träffar ' + hits.length + ' element, men inte den blå raden.' : 'Den träffar inget element här.';
    } else {
      result.textContent = 'Nästan: den träffar ' + hits.length + ' element. Gör den smalare så att bara den blå raden blir kvar.';
    }
  });
})();
