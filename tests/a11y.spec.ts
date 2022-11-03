import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage is accessible (axe-core)", async ({ page }) => {
  await page.goto("/");

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test("form success page is accessible (axe-core)", async ({ page }) => {
  await page.goto("/form/success");

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test("form failed page is accessible (axe-core)", async ({ page }) => {
  await page.goto("/form/failed");

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test("404 page is accessible (axe-core)", async ({ page }) => {
  await page.goto("/404");

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test("odinbook project page is accessible (axe-core)", async ({ page }) => {
  await page.goto("/projects/odinbook");

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
