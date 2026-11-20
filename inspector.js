/* Selector inspector: point at any element of the card to see which element
   and class selectors from style.css match it, and what colour results.
   The rename switch swaps class names so the class rules stop matching. */
(() => {
  'use strict';
  const panel = document.getElementById('inspector');
  const card = document.querySelector('main.card');
  if (!panel || !card) return;
  panel.hidden = false;
  document.body.classList.add('has-inspector');

  const out = panel.querySelector('.ins-out');
  const title = panel.querySelector('.ins-target');
  const sw = panel.querySelector('.ins-swatch');
  const rename = panel.querySelector('#ins-rename');
  const targets = [...card.querySelectorAll('img, h1, p, a, .card-body')].concat(card);

  function cssRules() {
    const list = [];
    for (const sheet of document.styleSheets) {
      if (!sheet.href || !/style\.css$/.test(sheet.href)) continue;
      for (const r of sheet.cssRules) if (r.selectorText) list.push(r);
    }
    return list;
  }
  const kind = (sel) => sel.trim().startsWith('.') ? 'class' : /^[a-z]+$/i.test(sel.trim()) || sel.trim() === 'body' ? 'element' : 'other';

  function describe(el) {
    const tag = el.tagName.toLowerCase();
    const cls = [...el.classList].filter((c) => c !== 'ins-on');
    title.innerHTML = '<code>&lt;' + tag + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '&gt;</code>';
    const rows = [];
    cssRules().forEach((r) => {
      r.selectorText.split(',').forEach((sel) => {
        sel = sel.trim();
        if (/[*:\[]|ins-|inspector/.test(sel)) return;
        let hit = false;
        try { hit = el.matches(sel); } catch (e) { return; }
        const k = kind(sel);
        const color = r.style.getPropertyValue('color');
        const bg = r.style.getPropertyValue('background') || r.style.getPropertyValue('background-color');
        if (hit) rows.push({ sel, k, color, bg, decl: r.style.length });
        else if (k === 'class' && el.dataset.was && sel === '.' + el.dataset.was) rows.push({ sel, k, broken: true });
      });
    });
    const computed = getComputedStyle(el).color;
    sw.style.background = computed;
    sw.setAttribute('aria-label', 'Computed colour ' + computed);
    out.innerHTML = rows.length ? rows.map((r) => r.broken
      ? '<li class="is-broken"><span class="ins-kind">class</span><code>' + r.sel + '</code><span>no longer matches: the HTML now says <code>class="' + el.className.replace(' ins-on', '') + '"</code></span></li>'
      : '<li class="k-' + r.k + '"><span class="ins-kind">' + r.k + '</span><code>' + r.sel + '</code><span>' + r.decl + ' declaration' + (r.decl === 1 ? '' : 's') +
        (r.color ? ', sets <code>color: ' + r.color + '</code>' : '') + '</span></li>').join('')
      : '<li class="is-empty">No element or class rule targets it directly: it inherits from its parent.</li>';
    panel.querySelector('.ins-computed').textContent = computed;
    const inh = rows.some((r) => !r.broken && r.color) ? 'set by the last matching rule above' : 'inherited from ' + (el.parentElement ? el.parentElement.tagName.toLowerCase() : 'nothing');
    panel.querySelector('.ins-why').textContent = inh;
  }

  let pinned = null;
  function focusOn(el) {
    targets.forEach((t) => t.classList.remove('ins-on'));
    el.classList.add('ins-on');
    describe(el);
  }
  targets.forEach((el) => {
    if (!el.hasAttribute('tabindex') && el.tagName !== 'A') el.tabIndex = 0;
    el.addEventListener('mouseenter', (e) => { if (!pinned) { e.stopPropagation(); focusOn(el); } });
    el.addEventListener('focus', () => { pinned = el; focusOn(el); });
    el.addEventListener('click', (e) => {
      e.stopPropagation(); pinned = pinned === el ? null : el; focusOn(el);
    });
  });
  card.addEventListener('mouseover', (e) => {
    if (pinned) return;
    const el = e.target.closest('img, h1, p, a, .card-body, main.card');
    if (el) focusOn(el);
  });

  const RENAMES = { highlight: 'hilite', slogan: 'tagline', cta: 'button', 'card-body': 'cardbody', card: 'kort' };
  rename.addEventListener('change', () => {
    const on = rename.checked;
    Object.entries(RENAMES).forEach(([from, to]) => {
      document.querySelectorAll(on ? '.' + from : '[data-was="' + from + '"]').forEach((el) => {
        if (on) { el.classList.replace(from, to); el.dataset.was = from; }
        else { el.classList.replace(to, from); delete el.dataset.was; }
      });
    });
    panel.querySelector('.ins-state').textContent = on
      ? 'Classes renamed in the HTML only. style.css still says .highlight, .slogan, .cta: those rules now match nothing, so the elements fall back to their element rules.'
      : 'Names match again: the class rules apply and the styles recover.';
    describe(pinned || card.querySelector('.ins-on') || card.querySelector('h1'));
  });

  focusOn(card.querySelector('.highlight'));
})();
