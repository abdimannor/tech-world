/* Selector workbench: live matching, specificity breakdown, right-to-left
   steps and the levels. Matching is always the browser's own
   querySelectorAll on the sample document in the iframe. */
(() => {
  'use strict';
  const S = window.Specificity;
  const frame = document.getElementById('doc');
  const input = document.getElementById('sel');
  const status = document.getElementById('sel-status');
  // The visible status updates on every keystroke; screen readers get the same
  // text through a separate live region, only after typing pauses.
  const live = document.getElementById('sel-live');
  let liveTimer = 0;
  const announce = (text) => { clearTimeout(liveTimer); liveTimer = setTimeout(() => { live.textContent = text; }, 500); };
  const tree = document.getElementById('tree');
  const breakdown = document.getElementById('breakdown');
  const rtl = document.getElementById('rtl');
  const KEY = 'tech-world-levels';

  const LEVELS = [
    { title: 'Typselektor', text: 'Välj alla stycken. Precis som i övningen från 2023: en typselektor träffar varje element av den sorten.', answer: 'p', hint: 'Elementets namn räcker: p' },
    { title: 'Klasselektor', text: 'Välj bara stycket med sloganen. En klass väljer de element som har klassen, oavsett typ.', answer: '.slogan', hint: 'En punkt följd av klassnamnet.' },
    { title: 'Typ och klass tillsammans', text: 'Välj ämnena som är markerade som nya, men bara listpunkterna.', answer: 'li.new', hint: 'Skriv typen och klassen ihop utan mellanslag: en sammansatt selektor.' },
    { title: 'Förfader och ättling', text: 'Välj länkarna i menyn, inga andra länkar.', answer: 'nav a', hint: 'Ett mellanslag betyder "någonstans inuti".' },
    { title: 'Barn', text: 'Välj de element som ligger direkt i kortets textdel.', answer: '.card-body > *', hint: 'Kombinatorn > betyder "direkt barn". * väljer alla typer.' },
    { title: 'Närmaste syskon', text: 'Välj det stycke som kommer direkt efter rubriken.', answer: 'h1 + p', hint: '+ betyder "närmast efter, med samma förälder".' },
    { title: 'Alla följande syskon', text: 'Välj allt som följer efter rubriken i textdelen.', answer: 'h1 ~ *', hint: '~ betyder "något senare syskon".' },
    { title: 'Attribut', text: 'Välj länkarna som pekar ut från sidan, till en adress som börjar med https.', answer: 'a[href^="https"]', hint: '[href^="..."] betyder att attributet börjar med texten.' },
    { title: 'Attribut, del två', text: 'Välj länkarna som pekar till ett ankare på samma sida.', answer: 'a[href^="#"]', hint: 'Ankare börjar med #. Glöm inte citattecknen.' },
    { title: 'Negation', text: 'Välj listpunkterna som inte är nya.', answer: 'li:not(.new)', hint: ':not() tar bort det som matchar argumentet.' },
    { title: 'Position', text: 'Välj varannan listpunkt: den första, tredje och femte.', answer: 'li:nth-child(odd)', hint: ':nth-child(odd) eller :nth-child(2n+1).' },
    { title: 'Föräldern via :has()', text: 'Välj elementet som innehåller rubriken direkt, utan att använda dess klass. :has() matchar ett element utifrån vad som finns i det; det stöds i Chrome 105, Safari 15.4 och Firefox 121 och senare (caniuse).', answer: ':has(> h1)', hint: 'div:has(> h1) betyder "en div som har en h1 som barn".', link: 'https://caniuse.com/css-has' },
  ];

  let doc = null;
  let elements = [];
  let rows = [];
  let current = 0;
  let solved = new Set();

  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };

  function query(sel) {
    if (!sel.trim()) return { ok: false, empty: true, set: new Set() };
    try {
      return { ok: true, set: new Set(doc.body.parentNode.querySelectorAll(sel)) };
    } catch (e) {
      return { ok: false, set: new Set(), error: e };
    }
  }

  function label(el) {
    let s = el.localName;
    if (el.id) s += '#' + el.id;
    for (const c of el.classList) if (!c.startsWith('wb-')) s += '.' + c;
    for (const a of ['href', 'target']) if (el.hasAttribute(a)) s += `[${a}="${el.getAttribute(a).length > 24 ? el.getAttribute(a).slice(0, 22) + '…' : el.getAttribute(a)}"]`;
    return s;
  }

  function buildTree() {
    elements = [doc.body, ...doc.body.querySelectorAll('*')];
    tree.textContent = '';
    rows = elements.map((el) => {
      const li = document.createElement('li');
      let depth = 0;
      for (let p = el; p !== doc.body; p = p.parentElement) depth++;
      li.style.setProperty('--depth', depth);
      const code = document.createElement('code');
      code.textContent = label(el);
      li.append(code);
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
      if (own) { const t = document.createElement('span'); t.className = 'txt'; t.textContent = own.length > 28 ? own.slice(0, 26) + '…' : own; li.append(' ', t); }
      const mark = document.createElement('span');
      mark.className = 'mark';
      li.append(mark);
      tree.append(li);
      return li;
    });
  }

  function paint(matches, targets) {
    elements.forEach((el, i) => {
      const m = matches.has(el);
      const t = targets.has(el);
      el.classList.toggle('wb-match', m);
      el.classList.toggle('wb-target', t);
      rows[i].classList.toggle('is-match', m);
      rows[i].classList.toggle('is-target', t);
      rows[i].querySelector('.mark').textContent = m && t ? ' träff, mål' : m ? ' träff' : t ? ' mål' : '';
    });
    // html and head never show up in the tree; say so if they match.
  }

  const fmt = (s) => `(${s.join(', ')})`;
  const COMB = {
    ' ': 'mellanslag: någon förfader längre upp',
    '>': '>: föräldern',
    '+': '+: syskonet närmast före',
    '~': '~: något syskon före',
  };

  function explain(sel, result) {
    breakdown.textContent = '';
    rtl.textContent = '';
    if (!result.ok) return;
    const parts = S.analyse(sel);
    for (const cx of parts) {
      const row = document.createElement('div');
      row.className = 'chain';
      cx.parts.forEach((p, i) => {
        if (i) { const c = document.createElement('span'); c.className = 'comb'; c.textContent = cx.combinators[i - 1] === ' ' ? '␣' : cx.combinators[i - 1]; c.title = COMB[cx.combinators[i - 1]]; row.append(c); }
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.innerHTML = '<code></code><small></small>';
        chip.querySelector('code').textContent = p.text;
        chip.querySelector('small').textContent = fmt(p.specificity);
        row.append(chip);
      });
      const total = document.createElement('p');
      total.className = 'total';
      total.innerHTML = 'Specificitet <strong></strong>';
      total.querySelector('strong').textContent = fmt(cx.specificity);
      breakdown.append(row, total);
    }
    if (parts.length > 1) {
      const note = document.createElement('p');
      note.className = 'note';
      note.textContent = 'En lista med kommatecken: varje selektor räknas för sig, och för ett element gäller den mest specifika som matchar.';
      breakdown.append(note);
    }
    // Right-to-left steps for the first complex selector.
    const cx = parts[0];
    const n = cx.parts.length;
    for (let k = n - 1; k >= 0; k--) {
      let suffix = cx.parts[k].text;
      for (let j = k + 1; j < n; j++) suffix += (cx.combinators[j - 1] === ' ' ? ' ' : ` ${cx.combinators[j - 1]} `) + cx.parts[j].text;
      let count = '?';
      try { count = doc.querySelectorAll(suffix).length; } catch (e) { /* keep ? */ }
      const li = document.createElement('li');
      const step = k === n - 1
        ? 'Börja med varje element och pröva den högra delen '
        : `Gå via ${COMB[cx.combinators[k]]} och kräv `;
      li.append(step);
      const code = document.createElement('code');
      code.textContent = cx.parts[k].text;
      li.append(code, document.createElement('br'));
      const c = document.createElement('span');
      c.className = 'count';
      c.textContent = `${count} element kvar`;
      li.append(c);
      rtl.append(li);
    }
    if (parts.length > 1) {
      const li = document.createElement('li');
      li.textContent = `Stegen gäller den första selektorn i listan (${parts[0].text}).`;
      li.className = 'note';
      rtl.append(li);
    }
  }

  function message(result, matches) {
    if (result.empty) return 'Skriv en selektor.';
    if (!result.ok) return `Ogiltig selektor: webbläsaren kastade ${result.error.name}. Kolla parenteser, hakparenteser, citattecken och kombinatorer.`;
    const inTree = elements.filter((el) => matches.has(el)).length;
    const outside = matches.size - inTree;
    let m = `${matches.size} ${matches.size === 1 ? 'träff' : 'träffar'}.`;
    if (outside) m += ` ${outside} av dem (html eller head) syns inte i trädet.`;
    return m;
  }

  function update() {
    const sel = input.value;
    const result = query(sel);
    input.setAttribute('aria-invalid', String(!result.ok && !result.empty));
    status.textContent = message(result, result.set);
    announce(status.textContent);
    status.classList.toggle('is-error', !result.ok && !result.empty);
    paint(result.set, new Set());
    explain(sel, result);
  }

  /* ---- Levels ---- */
  const list = document.getElementById('level-list');
  const lvCount = document.getElementById('level-count');
  const lvTitle = document.getElementById('level-title');
  const lvText = document.getElementById('level-text');
  const lvForm = document.getElementById('level-form');
  const lvInput = document.getElementById('level-input');
  const lvResult = document.getElementById('level-result');
  const lvHint = document.getElementById('level-hint');
  const lvNext = document.getElementById('level-next');

  function drawList() {
    list.textContent = '';
    LEVELS.forEach((lv, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = String(i + 1);
      b.setAttribute('aria-label', `Nivå ${i + 1}: ${lv.title}${solved.has(i) ? ', klar' : ''}`);
      if (i === current) b.setAttribute('aria-current', 'step');
      if (solved.has(i)) b.classList.add('is-solved');
      b.addEventListener('click', () => show(i, true));
      li.append(b);
      list.append(li);
    });
  }

  function targetsOf(i) { return query(LEVELS[i].answer).set; }

  function show(i, focus) {
    current = i;
    const lv = LEVELS[i];
    lvCount.textContent = `Nivå ${i + 1} av ${LEVELS.length}${solved.has(i) ? ' · klar' : ''}`;
    lvTitle.textContent = lv.title;
    lvText.textContent = lv.text + ' ';
    if (lv.link) { const a = document.createElement('a'); a.href = lv.link; a.textContent = 'Stöd enligt caniuse'; lvText.append(a); }
    lvInput.value = '';
    lvResult.textContent = '';
    lvResult.className = 'level-result';
    lvHint.dataset.hint = lv.hint;
    lvNext.hidden = !solved.has(i) || i === LEVELS.length - 1;
    paint(new Set(), targetsOf(i));
    drawList();
    if (focus) lvTitle.focus();
  }

  lvForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const sel = lvInput.value;
    const result = query(sel);
    const targets = targetsOf(current);
    if (!result.ok) {
      lvResult.textContent = result.empty ? 'Skriv en selektor först.' : `Ogiltig selektor (${result.error.name}).`;
      lvResult.className = 'level-result is-error';
      paint(new Set(), targets);
      return;
    }
    paint(result.set, targets);
    const extra = [...result.set].filter((el) => !targets.has(el)).length;
    const missing = [...targets].filter((el) => !result.set.has(el)).length;
    // Also show the matching in the workbench above.
    input.value = sel;
    status.textContent = message(result, result.set);
    announce(status.textContent);
    status.classList.remove('is-error');
    explain(sel, result);
    if (!extra && !missing) {
      solved.add(current);
      store.set([...solved].sort((a, b) => a - b));
      const sp = fmt(S.specificity(sel));
      lvResult.textContent = `Rätt! Exakt ${targets.size} ${targets.size === 1 ? 'element' : 'element'}. Din selektor har specificiteten ${sp}.` + (solved.size === LEVELS.length ? ' Alla nivåer klara.' : '');
      lvResult.className = 'level-result is-right';
      lvNext.hidden = current === LEVELS.length - 1;
      lvCount.textContent = `Nivå ${current + 1} av ${LEVELS.length} · klar`;
      drawList();
    } else {
      const bits = [];
      if (extra) bits.push(`${extra} för mycket`);
      if (missing) bits.push(`${missing} saknas`);
      lvResult.textContent = `Inte än: ${bits.join(', ')}. Gul ram = träff som inte är mål, streckad = mål som saknas.`;
      lvResult.className = 'level-result is-wrong';
    }
  });
  lvHint.addEventListener('click', () => { lvResult.textContent = lvHint.dataset.hint; lvResult.className = 'level-result'; });
  lvNext.addEventListener('click', () => show(Math.min(current + 1, LEVELS.length - 1), true));

  function start() {
    doc = frame.contentDocument;
    if (!doc || !doc.body || !doc.querySelector('.card')) return;
    buildTree();
    solved = new Set(store.get().filter((n) => Number.isInteger(n) && n >= 0 && n < LEVELS.length));
    current = Math.min(solved.size ? Math.max(...solved) + 1 : 0, LEVELS.length - 1);
    for (let i = 0; i < LEVELS.length; i++) if (!solved.has(i)) { current = i; break; }
    drawList();
    update();
    input.addEventListener('input', update);
    input.addEventListener('focus', update);
    lvInput.addEventListener('focus', () => { if (!lvInput.value) paint(new Set(), targetsOf(current)); });
    show(current, false);
    update();
    document.documentElement.dataset.workbench = 'ready';
  }

  window.techWorldLevels = LEVELS.map((l) => l.answer);
  if (frame.contentDocument && frame.contentDocument.readyState === 'complete' && frame.contentDocument.querySelector('.card')) start();
  else frame.addEventListener('load', start, { once: true });
})();
