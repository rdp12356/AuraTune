import { test, expect } from "@playwright/test";

test("onboarding CTA redirects to auth", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  await page.goto("/");
  await expect(page.getByText("What's your daily screen time?")).toBeVisible();

  await page.getByRole("button", { name: "2 hours" }).click();
  await page.getByRole("button", { name: /See your results/i }).click();

  await page.getByRole("button", { name: /^Continue$/i }).click();
  await page.getByRole("button", { name: /But what if/i }).click();
  await page.getByRole("button", { name: /Show me how/i }).click();
  await page.getByRole("button", { name: /I'm ready/i }).click();
  await page.getByRole("button", { name: /Start your first session/i }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /AuraTune/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Sign In/i })).toBeVisible();

  const onboardingComplete = await page.evaluate(() =>
    window.localStorage.getItem("onboarding_complete")
  );
  expect(onboardingComplete).toBe("true");
});
