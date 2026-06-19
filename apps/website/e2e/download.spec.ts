import { expect, test } from '@playwright/test';

// Regression test for the "Download whole book" + per-chapter download flow.
//
// Previous bug: BookDetail.tsx tried to fetch chapter PDFs from ncert.nic.in
// via the browser fetch() API, then merge them with pdf-lib. ncert.nic.in
// does not send CORS headers, so every fetch was blocked, errors were
// silently swallowed by the merge loop, and the user got either an empty
// PDF or a stuck spinner.
//
// Current behaviour: both buttons are plain <a href download target="_blank">
// elements pointing at NCERT URLs. The browser handles the download itself
// (no CORS issue). This test asserts the DOM contract.
//
// We rely on the seed book "hemh1" (Class XII Mathematics Part I) being
// present in apps/website/public/data/metadata/books.json. Pick a different
// stable bookCode here if the seed data ever changes.
const SEED_BOOK_CODE = 'hemh1';

test.describe('Book download flow', () => {
  test('full-book button is an anchor with the NCERT merged-PDF URL', async ({
    page,
  }) => {
    await page.goto(`/book/${SEED_BOOK_CODE}`);

    const button = page.getByTestId('download-full-book');
    await expect(button).toBeVisible();

    // Must be an actual anchor — clicking a button with a JS handler is what
    // the bug used to do, and that handler did the broken pdf-lib merge.
    const tag = await button.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe('a');

    const href = await button.getAttribute('href');
    expect(href).toBeTruthy();
    // href should resolve to either NCERT's merged PDF, or whatever
    // downloadUrl the metadata supplies. In both cases it must be a PDF URL.
    expect(href).toMatch(/\.pdf($|\?)/i);
    expect(href).toContain('ncert.nic.in');

    // download attribute makes the browser save instead of navigate.
    const download = await button.getAttribute('download');
    expect(download).toBeTruthy();
    expect(download).toMatch(/\.pdf$/i);

    // target=_blank + rel=noopener — defensive, prevents the NCERT page from
    // hijacking window.opener if the PDF response is HTML instead of a PDF.
    expect(await button.getAttribute('target')).toBe('_blank');
    expect((await button.getAttribute('rel')) ?? '').toContain('noopener');
  });

  test('per-chapter download is an anchor pointing at the chapter PDF', async ({
    page,
  }) => {
    await page.goto(`/book/${SEED_BOOK_CODE}`);

    const chapterButton = page.getByTestId('download-chapter-1');
    await expect(chapterButton).toBeVisible();

    const tag = await chapterButton.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe('a');

    const href = await chapterButton.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toMatch(/\.pdf($|\?)/i);
    expect(href).toContain('ncert.nic.in');

    // The download filename should encode the chapter number.
    const download = await chapterButton.getAttribute('download');
    expect(download).toBeTruthy();
    expect(download).toMatch(/-01-/);
    expect(download).toMatch(/\.pdf$/i);
  });

  test('clicking the full-book button does not produce a console error', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`/book/${SEED_BOOK_CODE}`);
    const button = page.getByTestId('download-full-book');
    await expect(button).toBeVisible();

    // We don't actually want the browser to start downloading the real
    // 5MB PDF in CI. Hijack the click so we observe it without navigating.
    await button.evaluate((el) => {
      el.addEventListener('click', (ev) => ev.preventDefault(), { once: true });
    });
    await button.click();

    // Old bug spammed "Failed to load chapter N: TypeError: Failed to fetch"
    // and "Merge error" into the console. None of that should happen now.
    const merge = errors.find((e) =>
      /merge|pdf-lib|Failed to (load chapter|fetch)/i.test(e),
    );
    expect(
      merge,
      `expected no merge/fetch errors, got:\n${errors.join('\n')}`,
    ).toBeUndefined();
  });
});
