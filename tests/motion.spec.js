// Motion is on by default, even under Reduce motion; the button turns it off and the choice is kept.
const { test, expect } = require('@playwright/test');

test.use({ contextOptions: { reducedMotion: 'reduce' } });

for (const file of ['index.html', 'original.html', 'workbench.html']) {
  test(`${file}: motion on by default, the button turns it off and it persists`, async ({ page }) => {
    await page.goto(file);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-motion', 'on');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth');
    const btn = page.locator('.course-motion');
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    await expect(btn).toHaveAccessibleName('Pausa rörelse');
    await expect(btn).toHaveText('');
    await btn.click();
    await expect(html).toHaveAttribute('data-motion', 'off');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await expect(btn).toHaveAccessibleName('Starta rörelse');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
    await page.reload();
    await expect(html).toHaveAttribute('data-motion', 'off');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
  });
}

test('the front page entrance animates by default under Reduce motion', async ({ page }) => {
  await page.goto('index.html');
  const names = await page.evaluate(() => document.getAnimations().map((a) => a.animationName));
  expect(names).toContain('rise');
});
