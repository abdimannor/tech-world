// The motion switch: still by default under Reduce motion, the choice is kept.
const { test, expect } = require('@playwright/test');

test.use({ contextOptions: { reducedMotion: 'reduce' } });

for (const file of ['index.html', 'workbench.html']) {
  test(`${file}: motion off by default, switch turns it on and it persists`, async ({ page }) => {
    await page.goto(file);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-motion', 'off');
    const btn = page.locator('.course-motion button');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await btn.click();
    await expect(html).toHaveAttribute('data-motion', 'on');
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth');
    await page.reload();
    await expect(html).toHaveAttribute('data-motion', 'on');
  });
}
