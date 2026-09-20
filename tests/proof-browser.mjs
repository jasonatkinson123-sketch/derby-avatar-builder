import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.PROOF_URL || 'http://127.0.0.1:8000/';
const outputDir = process.env.PROOF_OUTPUT || 'browser-proof';
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1366, height: 768 },
  acceptDownloads: true,
  deviceScaleFactor: 1
});
const page = await context.newPage();
const browserErrors = [];
page.on('console', message => {
  if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`);
});
page.on('pageerror', error => browserErrors.push(`page: ${error.message}`));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const tab = label => page.getByRole('tab', { name: label, exact: true });
const option = label => page.getByRole('button', { name: label, exact: true });

async function select(tabName, label) {
  await tab(tabName).click();
  await option(label).click();
}

async function selected(tabName) {
  await tab(tabName).click();
  return page.locator('#choices button[aria-pressed="true"]').first().getAttribute('aria-label');
}

await page.goto(baseURL, { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.querySelector('#status')?.textContent !== 'Loading artwork…');
assert(await page.title() === 'Derby Band Avatar Builder', 'unexpected document title');
assert(await page.locator('#avatarCanvas').getAttribute('width') === '128', 'main canvas is not 128px');
assert(await page.locator('#miniCanvas').getAttribute('width') === '128', 'card canvas is not 128px');
assert(
  await page.locator('.submission-note').textContent() ===
    'Download your avatar, then attach the PNG to your Google Classroom assignment.',
  'submission instructions changed'
);

const combos = [
  ['Deep','Textured curls','Black','Coral Hoodie','Flute','Turquoise'],
  ['Light','Hijab','Navy','Navy Sweatshirt','Alto saxophone','Coral'],
  ['Warm brown','High ponytail','Auburn','Mustard T-shirt','Electric bass','Deep blue'],
  ['Medium','Shoulder-length locs','Dark brown','Teal Hoodie','Mallets / bells','Mint'],
  ['Light','Textured curls','Dark brown','Coral Sweatshirt','Mallets / bells','Deep blue'],
  ['Deep','Shoulder-length locs','Black','Teal T-shirt','Alto saxophone','Mint'],
  ['Medium','High ponytail','Auburn','Navy Hoodie','Flute','Coral'],
  ['Warm brown','Hijab','Purple','Teal Sweatshirt','Electric bass','Turquoise'],
  ['Warm brown','Textured curls','Black','Mustard T-shirt','Alto saxophone','Deep blue'],
  ['Deep','Hijab','Teal','Coral Hoodie','Flute','Mint'],
  ['Light','High ponytail','Dark brown','Mustard Sweatshirt','Mallets / bells','Turquoise'],
  ['Medium','Shoulder-length locs','Auburn','Navy T-shirt','Electric bass','Coral']
];

const hashes = new Set();
for (const [skin, hair, hairColor, shirt, instrument, background] of combos) {
  await select('Skin', skin);
  await select('Hair', hair);
  await option(hairColor).click();
  await select('Shirt', shirt);
  await select('Instrument', instrument);
  await select('Background', background);
  const png = await page.locator('#avatarCanvas').evaluate(canvas => canvas.toDataURL('image/png'));
  assert(png.startsWith('data:image/png;base64,'), `render failed for ${skin}/${hair}/${instrument}`);
  hashes.add(png);
}
assert(hashes.size === combos.length, 'the twelve proof combinations were not visually unique');

// Skin and shirt recoloring must reach pose-specific hands and sleeves.
await select('Skin', 'Deep');
await select('Shirt', 'Coral Hoodie');
await select('Instrument', 'Flute');
const colors = await page.locator('#avatarCanvas').evaluate(canvas => {
  const data = canvas.getContext('2d').getImageData(0, 0, 128, 128).data;
  const found = new Set();
  for (let i = 0; i < data.length; i += 4) found.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
  return [...found];
});
assert(colors.includes('99,56,32'), 'deep-skin base color did not reach the composed avatar');
assert(colors.includes('223,98,91'), 'coral shirt color did not reach pose-specific sleeves');

// Changing instruments must preserve appearance.
await select('Hair', 'Textured curls');
await option('Black').click();
await select('Instrument', 'Mallets / bells');
assert(await selected('Skin') === 'Deep', 'instrument switch changed skin');
assert(await selected('Hair') === 'Textured curls', 'instrument switch changed hair');
assert(await selected('Shirt') === 'Coral Hoodie', 'instrument switch changed clothing');

// Randomize must preserve the instrument.
await select('Instrument', 'Electric bass');
await page.getByRole('button', { name: /Randomize look/i }).click();
assert(await selected('Instrument') === 'Electric bass', 'randomize changed the selected instrument');

// Undo must restore the preceding instrument.
await select('Instrument', 'Flute');
await page.getByRole('button', { name: /Undo/i }).click();
assert(await selected('Instrument') === 'Electric bass', 'undo did not restore the preceding instrument');

// Start Over must open a dialog and restore defaults only after confirmation.
await page.getByRole('button', { name: 'Start over', exact: true }).click();
assert(await page.locator('#resetDialog').evaluate(dialog => dialog.open), 'Start Over did not request confirmation');
await page.locator('#confirmResetBtn').click();
assert(await selected('Skin') === 'Warm brown', 'reset did not restore default skin');
assert(await selected('Instrument') === 'Alto saxophone', 'reset did not restore default instrument');

// Keyboard tab navigation and accessible selected state.
await tab('Skin').focus();
await tab('Skin').press('ArrowRight');
assert(await tab('Hair').getAttribute('aria-selected') === 'true', 'ArrowRight did not select the Hair tab');
assert(await tab('Hair').evaluate(element => document.activeElement === element), 'keyboard focus did not follow the tab');

// Chromebook layout keeps preview and controls side-by-side.
const layout = await page.evaluate(() => {
  const preview = document.querySelector('.preview-panel').getBoundingClientRect();
  const controls = document.querySelector('.controls-panel').getBoundingClientRect();
  return {
    sideBySide: preview.right <= controls.left,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  };
});
assert(layout.sideBySide, 'Chromebook layout did not keep preview beside controls');
assert(!layout.horizontalOverflow, 'Chromebook layout has horizontal overflow');
await page.screenshot({ path: path.join(outputDir, 'chromebook-1366x768.png'), fullPage: true });

// Download and compare the exported PNG to the current live preview.
const sourcePixels = await page.locator('#avatarCanvas').evaluate(canvas =>
  Array.from(canvas.getContext('2d').getImageData(0, 0, 128, 128).data)
);
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: /Download avatar/i }).click();
const download = await downloadPromise;
assert(download.suggestedFilename() === 'band-avatar.png', 'download filename is incorrect');
const downloadPath = path.join(outputDir, 'band-avatar.png');
await download.saveAs(downloadPath);
const exported = await fs.readFile(downloadPath);
assert(exported.readUInt32BE(16) === 512 && exported.readUInt32BE(20) === 512, 'export is not 512 × 512');
const exportedBase64 = exported.toString('base64');
const exportMatches = await page.evaluate(async ({ base64, source }) => {
  const image = new Image();
  image.src = `data:image/png;base64,${base64}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  const output = context.getImageData(0, 0, 512, 512).data;
  for (let y = 0; y < 128; y += 1) {
    for (let x = 0; x < 128; x += 1) {
      const sourceIndex = (y * 128 + x) * 4;
      for (const [ox, oy] of [[0,0],[3,0],[0,3],[3,3]]) {
        const outputIndex = (((y * 4) + oy) * 512 + (x * 4) + ox) * 4;
        for (let channel = 0; channel < 4; channel += 1) {
          if (source[sourceIndex + channel] !== output[outputIndex + channel]) return false;
        }
      }
    }
  }
  return true;
}, { base64: exportedBase64, source: sourcePixels });
assert(exportMatches, 'exported PNG does not match the live preview with nearest-neighbor scaling');

// Narrow-screen layout must stack without horizontal overflow.
const mobile = await context.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto(baseURL, { waitUntil: 'networkidle' });
await mobile.waitForFunction(() => document.querySelector('#status')?.textContent !== 'Loading artwork…');
const mobileLayout = await mobile.evaluate(() => {
  const preview = document.querySelector('.preview-panel').getBoundingClientRect();
  const controls = document.querySelector('.controls-panel').getBoundingClientRect();
  return {
    stacked: controls.top >= preview.bottom,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  };
});
assert(mobileLayout.stacked, 'narrow layout did not stack preview over controls');
assert(!mobileLayout.horizontalOverflow, 'narrow layout has horizontal overflow');
await mobile.screenshot({ path: path.join(outputDir, 'mobile-390x844.png'), fullPage: true });

assert(browserErrors.length === 0, browserErrors.join('\n'));
console.log(JSON.stringify({
  representativeCombinations: combos.length,
  uniqueRenders: hashes.size,
  download: 'band-avatar.png (512 × 512)',
  previewExportMatch: true,
  consoleErrors: browserErrors.length,
  responsiveLayouts: ['1366 × 768', '390 × 844']
}, null, 2));
await browser.close();
