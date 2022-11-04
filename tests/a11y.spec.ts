import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright"; // 1

test("homepage is accessible (axe-core)", async ({ page }) => {
  await page.goto("/");

  // @ts-ignore
  const accessibilityScanResults = await new AxeBuilder.default({
    page,
  }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test("form success page is accessible (axe-core)", async ({ page }) => {
  await page.goto("/form/success");

  // @ts-ignore
  const accessibilityScanResults = await new AxeBuilder.default({
    page,
  }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test("form failed page is accessible (axe-core)", async ({ page }) => {
  await page.goto("/form/failed");

  // @ts-ignore
  const accessibilityScanResults = await new AxeBuilder.default({
    page,
  }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test("404 page is accessible (axe-core)", async ({ page }) => {
  await page.goto("/404");

  // @ts-ignore
  const accessibilityScanResults = await new AxeBuilder.default({
    page,
  }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test("odinbook project page is accessible (axe-core)", async ({ page }) => {
  await page.goto("/projects/odinbook");

  // @ts-ignore
  const accessibilityScanResults = await new AxeBuilder.default({
    page,
  }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
