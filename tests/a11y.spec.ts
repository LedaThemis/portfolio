import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright"; // 1

const pages = [
  { url: "/", name: "homepage" },
  { url: "/projects", name: "projects page" },
  { url: "/writing", name: "writing page" },
  { url: "/events", name: "events page" },
  { url: "/contact", name: "contact page" },
  { url: "/privacy", name: "privacy page" },
  { url: "/press", name: "press page" },
  { url: "/photo-archive", name: "photo archive page" },
  { url: "/form/success", name: "form success page" },
  { url: "/form/failed", name: "form failed page" },
  { url: "/404", name: "404 page" },
  { url: "/projects/odinbook", name: "odinbook project page" },
  { url: "/projects/portfolio", name: "portfolio project page" },
];

for (const { url, name } of pages) {
  test(`${name} is accessible (axe-core)`, async ({ page }) => {
    await page.goto(url);

    const accessibilityScanResults = await new AxeBuilder({
      page,
    }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
}

test("video page is accessible, and carries its video (axe-core)", async ({ page }) => {
  const res = await page.goto(
    "/press/adil-al-qaba-interview-al-mosuliya-tv-scientists-and-inventors",
  );
  expect(res?.status()).toBe(200);
  // the embed is the point of the page; a passing a11y scan on a page with no
  // player would be a false pass
  const player = page.locator(
    'iframe[src*="youtube-nocookie.com/embed/dNlUKr9dlHg"]',
  );
  await expect(player).toHaveCount(1);
  // axe descends into the player and reports YouTube's own aria-allowed-attr
  // and aria-prohibited-attr failures on #movie_player, which we cannot fix.
  // Excluding the frame drops axe's own frame-title check with it, so assert
  // the accessible name here instead.
  await expect(player).toHaveAttribute("title", /\S/);
  const results = await new AxeBuilder({ page }).exclude("iframe").analyze();
  expect(results.violations).toEqual([]);
});

test("photo detail page is accessible (axe-core)", async ({ page }) => {
  const res = await page.goto(
    "/photo-archive/adil-al-qaba-presenting-museum-project-technical-university-brandenburg",
  );
  expect(res?.status()).toBe(200);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
