// The course bar is shared by the four lessons: same markup, same course.css/course.js.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

test('the shared course bar: four numbered lessons, one current, icon controls', async ({ page }) => {
  await page.goto('./');
  const bar = page.locator('nav.course-bar');
  await expect(bar.locator('.course-name')).toHaveText('Webbkursen');
  await expect(bar.locator('ol > li')).toHaveCount(4);
  await expect(bar.locator('.course-num')).toHaveText(['1', '2', '3', '4']);
  await expect(bar.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(bar.locator('.course-controls .course-icon-btn.course-motion')).toHaveCount(1);
  await expect(bar.locator('.course-motion svg.icon-pause')).toBeVisible();
  await expect(bar.locator('.course-motion svg.icon-play')).toBeHidden();
  // The done mark is an icon with hidden text, never a visible word.
  for (const m of await bar.locator('.course-mark').all()) {
    await expect(m.locator('svg')).toHaveCount(1);
    await expect(m.locator('.course-sr')).toHaveCount(1);
  }
});

test('a stored off shows the play icon before any script runs', async ({ page }) => {
  await page.route('**/course.js', (route) => route.abort());
  await page.addInitScript(() => localStorage.setItem('motion', 'off'));
  await page.goto('./');
  await expect(page.locator('.course-motion svg.icon-play')).toBeVisible();
  await expect(page.locator('.course-motion svg.icon-pause')).toBeHidden();
});

test('course.css and course.js match the shared copy (sha256 recorded in course.sha256)', async () => {
  const root = path.join(__dirname, '..');
  const want = Object.fromEntries(fs.readFileSync(path.join(root, 'tests', 'course.sha256'), 'utf8')
    .trim().split('\n').map((l) => l.trim().split(/\s+/).reverse()));
  for (const f of ['course.css', 'course.js']) {
    const got = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex');
    expect(got, f).toBe(want[f]);
  }
});
