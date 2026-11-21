/* Selector parsing and specificity per Selectors Level 4, section 15
   (https://www.w3.org/TR/selectors-4/#specificity-rules).
   Validity is decided by the browser (querySelectorAll); this file only
   splits an already valid selector into parts and counts (a, b, c). */
(function (root) {
  'use strict';

  const LEGACY_PSEUDO_ELEMENTS = ['before', 'after', 'first-line', 'first-letter'];
  const LIST_PSEUDOS = ['is', 'matches', '-webkit-any', 'not', 'has'];
  const NTH_OF = ['nth-child', 'nth-last-child'];

  /* Index of the bracket that closes the one at s[i]. */
  function closing(s, i) {
    const open = s[i];
    const close = open === '(' ? ')' : ']';
    let depth = 0;
    for (let j = i; j < s.length; j++) {
      const c = s[j];
      if (c === '\\') { j++; continue; }
      if (c === '"' || c === "'") { j = s.indexOf(c, j + 1); if (j < 0) return s.length - 1; continue; }
      if (c === open || (open === '(' && c === '[') || (open === '[' && c === '(')) depth++;
      else if (c === close || (open === '(' && c === ']') || (open === '[' && c === ')')) { depth--; if (depth === 0) return j; }
    }
    return s.length - 1;
  }

  /* Split on a character at nesting depth 0. */
  function splitTop(s, sep) {
    const out = [];
    let start = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '\\') { i++; continue; }
      if (c === '"' || c === "'") { const j = s.indexOf(c, i + 1); i = j < 0 ? s.length : j; continue; }
      if (c === '(' || c === '[') { i = closing(s, i); continue; }
      if (c === sep) { out.push(s.slice(start, i)); start = i + 1; }
    }
    out.push(s.slice(start));
    return out.map((x) => x.trim()).filter(Boolean);
  }

  /* A complex selector: compound selectors joined by combinators. */
  function parseComplex(src) {
    const s = src.trim();
    const compounds = [];
    const combinators = [];
    let lead = null;
    let cur = '';
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '\\') { cur += s.slice(i, i + 2); i += 2; continue; }
      if (c === '"' || c === "'") { let j = s.indexOf(c, i + 1); if (j < 0) j = s.length - 1; cur += s.slice(i, j + 1); i = j + 1; continue; }
      if (c === '(' || c === '[') { const j = closing(s, i); cur += s.slice(i, j + 1); i = j + 1; continue; }
      if (/[\s>+~]/.test(c)) {
        let j = i;
        let comb = ' ';
        while (j < s.length && /[\s>+~]/.test(s[j])) { if (!/\s/.test(s[j])) comb = s[j]; j++; }
        if (cur.trim()) { compounds.push(cur.trim()); cur = ''; combinators.push(comb); }
        else if (!compounds.length) lead = comb;
        i = j;
        continue;
      }
      cur += c;
      i++;
    }
    if (cur.trim()) compounds.push(cur.trim());
    return { compounds, combinators, lead };
  }

  const add = (x, y) => [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
  const compare = (x, y) => (x[0] - y[0]) || (x[1] - y[1]) || (x[2] - y[2]);
  const maxOf = (list) => list.reduce((m, s) => (compare(s, m) > 0 ? s : m), [0, 0, 0]);

  function readIdent(s, i) {
    let j = i;
    while (j < s.length) {
      if (s[j] === '\\') { j += 2; continue; }
      if (/[-\w\u00a0-\uffff]/.test(s[j])) { j++; continue; }
      break;
    }
    return j;
  }

  function listSpecificity(text) {
    return maxOf(splitTop(text, ',').map(complexSpecificity));
  }

  function compoundSpecificity(s) {
    let spec = [0, 0, 0];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '*' || c === '|') { i++; continue; }
      if (c === '#') { spec = add(spec, [1, 0, 0]); i = readIdent(s, i + 1); continue; }
      if (c === '.') { spec = add(spec, [0, 1, 0]); i = readIdent(s, i + 1); continue; }
      if (c === '[') { spec = add(spec, [0, 1, 0]); i = closing(s, i) + 1; continue; }
      if (c === ':') {
        const element = s[i + 1] === ':';
        const start = i + (element ? 2 : 1);
        const end = readIdent(s, start);
        const name = s.slice(start, end).toLowerCase();
        let arg = null;
        i = end;
        if (s[i] === '(') { const j = closing(s, i); arg = s.slice(i + 1, j); i = j + 1; }
        if (element || LEGACY_PSEUDO_ELEMENTS.includes(name)) spec = add(spec, [0, 0, 1]);
        else if (LIST_PSEUDOS.includes(name) && arg !== null) spec = add(spec, listSpecificity(arg));
        else if (name === 'where') { /* always zero */ }
        else if (NTH_OF.includes(name) && arg !== null) {
          const of = /\sof\s/i.exec(arg);
          spec = add(spec, [0, 1, 0]);
          if (of) spec = add(spec, listSpecificity(arg.slice(of.index + of[0].length)));
        } else spec = add(spec, [0, 1, 0]);
        continue;
      }
      if (/[-\w\u00a0-\uffff\\]/.test(c)) { spec = add(spec, [0, 0, 1]); i = readIdent(s, i); continue; }
      i++;
    }
    return spec;
  }

  function complexSpecificity(text) {
    return parseComplex(text).compounds.map(compoundSpecificity).reduce(add, [0, 0, 0]);
  }

  /* Full breakdown of a selector list. */
  function analyse(selector) {
    return splitTop(selector, ',').map((text) => {
      const p = parseComplex(text);
      const parts = p.compounds.map((t) => ({ text: t, specificity: compoundSpecificity(t) }));
      return {
        text,
        parts,
        combinators: p.combinators,
        specificity: parts.reduce((s, x) => add(s, x.specificity), [0, 0, 0]),
      };
    });
  }

  const api = { analyse, specificity: (s) => maxOf(splitTop(s, ',').map(complexSpecificity)), compare, splitTop, parseComplex };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Specificity = api;
})(typeof window !== 'undefined' ? window : globalThis);
