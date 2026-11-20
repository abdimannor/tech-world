/* Course bar: challenge progress per site and the motion switch. Shared by all four lessons. */
(() => {
  'use strict';
  const KEY = 'course-done';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };
  function paint() {
    const done = store.get(KEY) === '1';
    for (const m of document.querySelectorAll('.course-bar [aria-current="page"] .course-mark')) m.hidden = !done;
  }
  window.courseDone = () => { store.set(KEY, '1'); paint(); };
  paint();

  const btn = document.querySelector('.course-motion button');
  if (!btn) return;
  const root = document.documentElement;
  function show() {
    const on = root.dataset.motion === 'on';
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = on ? 'R\u00f6relse: p\u00e5' : 'R\u00f6relse: av';
  }
  btn.addEventListener('click', () => {
    root.dataset.motion = root.dataset.motion === 'on' ? 'off' : 'on';
    store.set('motion', root.dataset.motion);
    show();
  });
  show();
})();
