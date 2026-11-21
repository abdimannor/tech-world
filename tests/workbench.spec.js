// Selector workbench: live matching, invalid selectors, specificity, levels.
const { test, expect } = require('@playwright/test');
const { axe } = require('./helpers');

async function open(page) {
  await page.goto('workbench.html');
  await expect(page.locator('html')).toHaveAttribute('data-workbench', 'ready');
  return page.frameLocator('#doc');
}

test('typing a selector highlights the browser\'s own matches', async ({ page }) => {
  const doc = await open(page);
  await page.fill('#sel', 'p');
  await expect(page.locator('#sel-status')).toHaveText(/^2 träffar/);
  await expect(doc.locator('.wb-match')).toHaveCount(2);
  await expect(page.locator('#tree li.is-match')).toHaveCount(2);
  await page.fill('#sel', '.slogan');
  await expect(doc.locator('p.slogan.wb-match')).toHaveCount(1);
  await expect(doc.locator('.wb-match')).toHaveCount(1);
});

test('an invalid selector gets a clear message, not an error', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const doc = await open(page);
  await page.fill('#sel', 'p:nth-child(');
  await page.fill('#sel', 'a[href');
  await page.fill('#sel', 'p >> a');
  await expect(page.locator('#sel-status')).toHaveText(/Ogiltig selektor/);
  await expect(page.locator('#sel')).toHaveAttribute('aria-invalid', 'true');
  await expect(doc.locator('.wb-match')).toHaveCount(0);
  expect(errors).toEqual([]);
});

const cases = [
  ['p', '(0, 0, 1)'],
  ['.card-body > p.slogan', '(0, 2, 1)'],
  ['#kort a', '(1, 0, 1)'],
  [':is(p, #kort)', '(1, 0, 0)'],
  ['.cta:where(a, #kort)', '(0, 1, 0)'],
  ['li:not(.new)', '(0, 1, 1)'],
  [':nth-child(odd of li, .new)', '(0, 2, 0)'],
  ['div:has(> h1)', '(0, 0, 2)'],
  ['a[href^="#"]::before', '(0, 1, 2)'],
];
for (const [sel, spec] of cases) {
  test(`specificity of ${sel} is ${spec}`, async ({ page }) => {
    await open(page);
    await page.fill('#sel', sel);
    await expect(page.locator('#breakdown .total strong').first()).toHaveText(spec);
  });
}

test('right-to-left steps narrow the candidates', async ({ page }) => {
  await open(page);
  await page.fill('#sel', '.card-body > p');
  const steps = page.locator('#rtl li');
  await expect(steps).toHaveCount(2);
  await expect(steps.nth(0)).toContainText('2 element kvar');
  await expect(steps.nth(0).locator('code')).toHaveText('p');
  await expect(steps.nth(1).locator('code')).toHaveText('.card-body');
});

test('every level is solvable by its answer and checked by match sets', async ({ page }) => {
  const doc = await open(page);
  const answers = await page.evaluate(() => window.techWorldLevels);
  expect(answers.length).toBeGreaterThanOrEqual(8);
  expect(answers.length).toBeLessThanOrEqual(12);
  // A wrong answer reports what is extra or missing.
  await page.locator('#level-list button').nth(0).click();
  await page.fill('#level-input', '.slogan');
  await page.click('#level-form button[type=submit]');
  await expect(page.locator('#level-result')).toHaveText(/saknas/);
  for (let i = 0; i < answers.length; i++) {
    await page.locator('#level-list button').nth(i).click();
    await expect(doc.locator('.wb-target').first()).toBeAttached();
    await page.fill('#level-input', answers[i]);
    await page.click('#level-form button[type=submit]');
    await expect(page.locator('#level-result')).toHaveText(/^Rätt!/);
  }
  await expect(page.locator('#level-list button.is-solved')).toHaveCount(answers.length);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-workbench', 'ready');
  await expect(page.locator('#level-list button.is-solved')).toHaveCount(answers.length);
  const saved = await page.evaluate(() => localStorage.getItem('tech-world-levels'));
  expect(JSON.parse(saved)).toHaveLength(answers.length);
});

test('a different but equivalent selector also solves a level', async ({ page }) => {
  await open(page);
  await page.locator('#level-list button').nth(0).click();
  await page.fill('#level-input', '.card-body p');
  await page.click('#level-form button[type=submit]');
  await expect(page.locator('#level-result')).toHaveText(/^Rätt!/);
});

test('level state passes axe', async ({ page }) => {
  await open(page);
  await page.locator('#level-list button').nth(2).click();
  await page.fill('#level-input', 'li');
  await page.click('#level-form button[type=submit]');
  await axe(page);
});
