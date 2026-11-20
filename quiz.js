/* Name the selector: frame one element of the card, the visitor picks the selector that styles it. */
(() => {
  'use strict';
  const root = document.getElementById('quiz');
  const card = document.querySelector('main.card');
  if (!root || !card) return;
  root.hidden = false;
  document.body.classList.add('has-quiz');

  const Q = [
    { el: '.highlight', ask: 'The framed line is red. Which selector makes it red?', opts: ['p', '.highlight', '.slogan', 'h1'], right: '.highlight',
      why: '<code>p</code> matches too and sets the base, but the class selector <code>.highlight</code> is more specific (0,1,0 beats 0,0,1), so its colour wins.' },
    { el: '.slogan', ask: 'The framed line is blue. Which selector makes it blue?', opts: ['.highlight', 'body', '.slogan', 'a'], right: '.slogan',
      why: 'Only the second paragraph carries <code>class="slogan"</code>. Same tag as the red line, different class, different look.' },
    { el: 'h1', ask: 'Which selector sets the size of the framed heading?', opts: ['.card-body', 'h1', '.highlight', 'p'], right: 'h1',
      why: 'An element selector: <code>h1</code> styles every h1 on the page. There is only one here, so no class is needed.' },
    { el: '.cta', ask: 'Which selector turns the framed link into a button-like pill?', opts: ['a', '.cta', '.slogan', 'body'], right: '.cta',
      why: '<code>a</code> styles every link, but the pill shape and background come from the class <code>.cta</code> (call to action), which only this link has.' },
    { el: 'img', ask: 'Which selector makes the framed picture fill the card width?', opts: ['img', '.card', '.highlight', 'h1'], right: 'img',
      why: 'The image has no class, so its rules come from the element selector <code>img</code>.' }
  ];
  let i = 0, score = 0, answered = false;
  const $ = (s) => root.querySelector(s);

  function frame(sel) {
    card.querySelectorAll('.quiz-on').forEach((e) => e.classList.remove('quiz-on'));
    const el = card.querySelector(sel);
    if (el) el.classList.add('quiz-on');
  }
  function show() {
    const q = Q[i];
    answered = false;
    frame(q.el);
    $('#quiz-progress').textContent = 'Element ' + (i + 1) + ' of ' + Q.length + ', score ' + score;
    $('#quiz-question').textContent = q.ask;
    $('#quiz-options').innerHTML = q.opts.map((o) => '<button type="button" data-opt="' + o + '"><code>' + o + '</code></button>').join('');
    $('#quiz-explain').innerHTML = '';
    $('#quiz-next').hidden = true;
  }
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-opt]');
    if (!b || answered) return;
    answered = true;
    const q = Q[i];
    const ok = b.dataset.opt === q.right;
    if (ok) score++;
    root.querySelectorAll('[data-opt]').forEach((x) => {
      x.disabled = true;
      if (x.dataset.opt === q.right) x.classList.add('is-right');
      else if (x === b) x.classList.add('is-wrong');
    });
    $('#quiz-explain').innerHTML = '<strong>' + (ok ? 'Right.' : 'Not quite: it is <code>' + q.right + '</code>.') + '</strong> ' + q.why;
    $('#quiz-progress').textContent = 'Element ' + (i + 1) + ' of ' + Q.length + ', score ' + score;
    const next = $('#quiz-next');
    next.hidden = false;
    next.textContent = i === Q.length - 1 ? 'See your score' : 'Next element';
    next.focus();
  });
  $('#quiz-next').addEventListener('click', () => {
    if (i < Q.length - 1) { i++; show(); return; }
    frame('none');
    $('#quiz-question').textContent = 'Done: ' + score + ' of ' + Q.length + '.';
    $('#quiz-options').innerHTML = '';
    $('#quiz-explain').textContent = score === Q.length ? 'Every selector named. Element selectors set the base, classes opt in.' : 'Rule of thumb: an element with a class usually gets its distinct look from that class.';
    const next = $('#quiz-next');
    next.textContent = 'Play again';
    next.onclick = () => { i = 0; score = 0; next.onclick = null; show(); };
  });
  show();
})();
