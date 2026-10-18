// The 2AM Sessions — print PDF renderer
// Usage: node render.js [input.html] [output.pdf]
// Requires: Playwright with Chromium (this repo assumes the sandbox's
// pre-installed browser at /opt/pw-browsers/chromium — swap executablePath
// for a normal Playwright install if running elsewhere).
const { chromium } = require('playwright');
const path = require('path');

const input = process.argv[2] || 'print-template.html';
const output = process.argv[3] || 'output.pdf';

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.goto('file://' + path.resolve(input), { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(
    () => window.PagedPolyfill && document.querySelector('.pagedjs_pages'),
    { timeout: 60000 }
  ).catch(e => console.log('pagedjs did not signal ready:', e.message));
  // poll until the page count stabilizes (pagedjs paginates incrementally)
  let lastCount = -1, stable = 0;
  for (let i = 0; i < 30; i++) {
    const count = await page.evaluate(() => document.querySelectorAll('.pagedjs_page').length);
    if (count === lastCount) { stable++; if (stable >= 3) break; } else { stable = 0; }
    lastCount = count;
    await page.waitForTimeout(500);
  }
  const pageCount = await page.evaluate(() => document.querySelectorAll('.pagedjs_page').length);
  console.log('Final page count:', pageCount);
  await page.pdf({ path: output, printBackground: true, preferCSSPageSize: true });
  await browser.close();
})();
