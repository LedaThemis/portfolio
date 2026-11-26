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

test("an off-site interview page says so, and claims no video (axe-core)", async ({ page }) => {
  const res = await page.goto(
    "/press/adil-al-qaba-interview-university-of-mosul-press-programming-journey",
  );
  expect(res?.status()).toBe(200);
  // Facebook offers no cookie-free player, so this page must carry no iframe
  // at all - and therefore no VideoObject claiming a video it cannot play.
  await expect(page.locator("iframe")).toHaveCount(0);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.join("")).not.toContain("VideoObject");
  await expect(
    page.getByRole("link", { name: "Watch it on Facebook" }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("a quoted article page carries the quote, in its own script (axe-core)", async ({ page }) => {
  const res = await page.goto("/press/adil-al-qaba-quoted-by-rudaw-huawei-honouring");
  expect(res?.status()).toBe(200);
  // the quote is the page's reason to exist: Arabic, right-to-left, cited
  const quote = page.locator("blockquote[lang=ar][dir=rtl]");
  await expect(quote).toHaveCount(1);
  await expect(quote).toContainText("تكريم عالمي");
  await expect(quote).toHaveAttribute("cite", /rudawarabia\.net/);
  await expect(page.locator("cite")).toContainText("Rudaw");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

// This is here because dir was set on the blockquote alone, where a test
// checked it, and missed 39 other Arabic elements that no test touched.
for (const url of [
  "/press/adil-al-qaba-interview-al-mosuliya-tv-scientists-and-inventors",
  // a photograph whose title does not already carry the name, so the
  // Arabic "Pictured" line renders
  "/photo-archive/adil-al-qaba-in-front-of-german-government-building-informatik-festival-2025",
]) {
  test(`every Arabic element on ${url} declares its direction`, async ({ page }) => {
    const res = await page.goto(url);
    expect(res?.status()).toBe(200);
    const undeclared = await page
      .locator('[lang="ar"]:not([dir="rtl"])')
      .evaluateAll((els) => els.map((e) => e.outerHTML.slice(0, 90)));
    expect(undeclared).toEqual([]);
    await expect(page.locator('[lang="ar"]')).not.toHaveCount(0);
  });
}

test("photo detail page is accessible (axe-core)", async ({ page }) => {
  const res = await page.goto(
    "/photo-archive/adil-al-qaba-presenting-museum-project-technical-university-brandenburg",
  );
  expect(res?.status()).toBe(200);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
