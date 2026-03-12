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
