// The lesson front page: course bar, original in a frame, rule picker and the task.
const { test, expect } = require('@playwright/test');
const { axe } = require('./helpers');

test('course bar marks lesson 2 and the footer links both neighbours', async ({ page }) => {
  await page.goto('index.html');
  await expect(page.locator('.course-bar .course-name')).toHaveText('Webbkursen');
  await expect(page.locator('.course-bar [aria-current="page"]')).toContainText('Tech World');
  await expect(page.locator('.course-next a')).toHaveCount(2);
  await expect(page.locator('.course-next a').nth(0)).toHaveAttribute('href', /hello-web/);
  await expect(page.locator('.course-next a').nth(1)).toHaveAttribute('href', /link-lab/);
});

test('the original exercise is framed without course chrome or inspector', async ({ page }) => {
  await page.goto('index.html');
  const frame = page.frameLocator('.browser iframe');
  await expect(frame.locator('h1')).toHaveText('Utforska den tekniska världen');
  await expect(frame.locator('.highlight')).toHaveText('Upptäck spännande innovationer!');
  await expect(frame.locator('.course-bar')).toHaveCount(0);
  await expect(frame.locator('#inspector')).toBeHidden();
});

test('original.html keeps the exercise text verbatim with inspector and quiz', async ({ page }) => {
  await page.goto('original.html');
  await expect(page.locator('main.card h1')).toHaveText('Utforska den tekniska världen');
  await expect(page.locator('main.card .slogan')).toHaveText('Förverkliga dina teknikdrömmar!');
  await expect(page.locator('main.card .cta')).toHaveText('Läs mer om vårt teknikprogram!');
  await expect(page.locator('#inspector')).toBeVisible();
  await expect(page.locator('#quiz')).toBeVisible();
});

test('picking a rule highlights what it matches, removing classes empties it', async ({ page }) => {
  await page.goto('index.html');
  await page.getByRole('button', { name: /^p \{/ }).click();
  await expect(page.locator('#demo-card .is-hit')).toHaveCount(2);
  await expect(page.locator('#demo-out')).toContainText('träffar 2 element');
  await page.getByRole('button', { name: /^\.highlight/ }).click();
  await expect(page.locator('#demo-card .is-hit')).toHaveCount(1);
  await page.getByLabel('Ta bort klasserna ur HTML-koden').check();
  await expect(page.locator('#demo-card .is-hit')).toHaveCount(0);
  await expect(page.locator('#demo-out')).toContainText('träffar 0 element');
  await axe(page);
});

test('the task accepts only a selector that hits the blue line and marks the lesson done', async ({ page }) => {
  await page.goto('index.html');
  const input = page.locator('#task-input');
  await input.fill('p');
  await page.getByRole('button', { name: 'Kontrollera' }).click();
  await expect(page.locator('#task-result')).toContainText('träffar 2 element');
  await input.fill('p[');
  await page.getByRole('button', { name: 'Kontrollera' }).click();
  await expect(page.locator('#task-result')).toContainText('ingen giltig selektor');
  await input.fill('.slogan');
  await page.getByRole('button', { name: 'Kontrollera' }).click();
  await expect(page.locator('#task-result')).toHaveText(/^Rätt/);
  expect(await page.evaluate(() => localStorage.getItem('course-done'))).toBe('1');
  await expect(page.locator('.course-bar [aria-current="page"] .course-mark')).toBeVisible();
  await axe(page);
});
