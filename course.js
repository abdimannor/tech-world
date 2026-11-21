/* Course bar: challenge progress per site and the motion switch. Shared by all four lessons. */
(() => {
  'use strict';
  /* Framed copies of the page (previews) carry no course chrome. */
  if (window.self !== window.top) {
    for (const el of document.querySelectorAll('.course-bar, .course-next')) el.remove();
    return;
  }
  const KEY = 'course-done';
  const SEEN = 'course-progress';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };

  /* Each site only knows its own flag (localStorage is per origin). Progress on the
     other lessons is self-reported: the course links carry it as #done=1,2,3, and
     each site keeps what it has been told in SEEN, merged with its own flag. */
  const items = [...document.querySelectorAll('.course-bar ol > li')];
  const here = items.findIndex((li) => li.querySelector('[aria-current="page"]')) + 1;
  const parse = (s) => String(s || '').split(',').map(Number).filter((n) => n >= 1 && n <= items.length);
  const told = /^#done=([\d,]*)$/.exec(location.hash);
  const done = new Set([...parse(store.get(SEEN)), ...(told ? parse(told[1]) : [])]);
  if (told) history.replaceState(null, '', location.pathname + location.search);

  function list() {
    const all = new Set(done);
    if (here && store.get(KEY) === '1') all.add(here);
    return [...all].sort((a, b) => a - b);
  }

  function paint() {
    const now = list();
    store.set(SEEN, now.filter((n) => n !== here).join(','));
    items.forEach((li, i) => {
      const m = li.querySelector('.course-mark');
      if (m) m.hidden = !now.includes(i + 1);
    });
    /* Pass the progress along on every course link (other sites only). */
    for (const a of document.querySelectorAll('.course-bar a, .course-next a')) {
      const url = a.href.split('#')[0];
      if (url === location.href.split('#')[0]) continue;
      a.href = now.length ? url + '#done=' + now.join(',') : url;
    }
    complete(now);
  }

  /* The last lesson shows a completion card once all lessons are marked done. */
  const SUMMARY = [
    'Rubriker, stycken, f\u00e4rg, en bild och en l\u00e4nk.',
    'En extern stilmall och klassv\u00e4ljare.',
    'L\u00e4nkarnas tillst\u00e5nd: :link, :visited, :hover och :active.',
    'Samma inneh\u00e5ll med extern, intern och inline-CSS.',
  ];
  let card = null;
  function complete(now) {
    if (here !== items.length || now.length < items.length || card) return;
    const next = document.querySelector('.course-next');
    if (!next) return;
    card = document.createElement('section');
    card.className = 'course-complete';
    card.lang = 'sv';
    card.setAttribute('aria-labelledby', 'course-complete-title');
    const h = document.createElement('h2');
    h.id = 'course-complete-title';
    h.textContent = 'Kursen klar';
    const p = document.createElement('p');
    p.textContent = 'Alla fyra lektioner \u00e4r markerade som klara.';
    const ol = document.createElement('ol');
    items.forEach((li, i) => {
      const item = document.createElement('li');
      const name = document.createElement('strong');
      const link = li.querySelector('a');
      name.textContent = link ? link.firstChild.nextSibling.textContent.trim() : '';
      const num = document.createElement('span');
      num.className = 'course-num';
      num.textContent = 'Lektion ' + (i + 1);
      item.append(num, name, document.createTextNode(SUMMARY[i] || ''));
      ol.append(item);
    });
    card.append(h, p, ol);
    next.before(card);
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
