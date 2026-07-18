const fs = require('node:fs');
const assert = require('node:assert/strict');

for (const file of ['index.html', 'styles.css', 'app.js', 'README.md', '.github/workflows/pages.yml']) {
  assert.ok(fs.existsSync(file), `${file} should exist`);
}

const html = fs.readFileSync('index.html', 'utf8');
assert.match(html, /id="start-scan"/);
assert.match(html, /id="product-form"/);
assert.match(html, /id="export-csv"/);
assert.match(html, /<script src="app\.js" defer><\/script>/);

const js = fs.readFileSync('app.js', 'utf8');
assert.match(js, /navigator\.mediaDevices\.getUserMedia/);
assert.match(js, /BarcodeDetector/);
assert.match(js, /BrowserMultiFormatReader/);
assert.match(js, /localStorage\.setItem\(STORAGE_KEY/);
assert.match(js, /new Blob\(\[csv\]/);

const readme = fs.readFileSync('README.md', 'utf8');
assert.match(readme, /https:\/\/vkchauhan2020\.github\.io\/Article-Master\//);

console.log('Static project checks passed.');
