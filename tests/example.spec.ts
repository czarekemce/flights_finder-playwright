import { test, expect, BrowserContext, Page } from '@playwright/test';
import { BasePage } from '../pageObjects/basePage';


test.describe('Tenerife flights', () => {
  let basePage: BasePage;
  let context: BrowserContext;
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    basePage = new BasePage(page, context);
  });

  test.afterEach(async () => {
    await basePage.context.clearCookies();
  });

  test('7 days', async ({ page }) => {
    test.setTimeout(5000000);
    await basePage.wholeProcess(7)
  });

  test('8 days', async ({page}) => {
    test.setTimeout(5000000)
    await basePage.wholeProcess(8)
  });

  test('9 days', async ({page}) => {
    test.setTimeout(5000000)
    await basePage.wholeProcess(9)
  });

  test('10 days', async ({page}) => {
    test.setTimeout(5000000)
    await basePage.wholeProcess(10)
  });

  test('11 days', async ({page}) => {
    test.setTimeout(5000000)
    await basePage.wholeProcess(11)
  });

  test('12 days', async ({page}) => {
    test.setTimeout(5000000)
    await basePage.wholeProcess(12)
  });

  test('13 days', async ({page}) => {
    test.setTimeout(5000000)
    await basePage.wholeProcess(13)
  });

  test('14 days', async ({page}) => {
    test.setTimeout(5000000)
    await basePage.wholeProcess(14)
  });

  test('15 days', async ({page}) => {
    test.setTimeout(5000000)
    await basePage.wholeProcess(15)
  });

});
