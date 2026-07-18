const STORAGE_KEY = 'article-master-records';
const SCAN_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93', 'codabar', 'itf', 'qr_code', 'data_matrix'];
const ZXING_CDN = 'https://unpkg.com/@zxing/browser@0.1.5/umd/index.min.js';

const els = {
  video: document.querySelector('#scanner-video'),
  status: document.querySelector('#scanner-status'),
  start: document.querySelector('#start-scan'),
  stop: document.querySelector('#stop-scan'),
  activeBarcode: document.querySelector('#active-barcode'),
  form: document.querySelector('#product-form'),
  save: document.querySelector('#save-product'),
  clearActive: document.querySelector('#clear-active'),
  manualForm: document.querySelector('#manual-form'),
  manualBarcode: document.querySelector('#manual-barcode'),
  body: document.querySelector('#records-body'),
  count: document.querySelector('#record-count'),
  exportCsv: document.querySelector('#export-csv'),
  clearAll: document.querySelector('#clear-all'),
  toast: document.querySelector('#toast'),
};

let stream;
let detector;
let scanTimer;
let zxingControls;
let activeBarcode = '';
let records = loadRecords();

function loadRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
  catch { return []; }
}

function persistRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  window.setTimeout(() => els.toast.classList.remove('show'), 2800);
}

function setActiveBarcode(value) {
  activeBarcode = value.trim();
  els.activeBarcode.textContent = activeBarcode || 'No barcode selected';
  [...els.form.elements].forEach((field) => {
    if (field.matches('input, button')) field.disabled = !activeBarcode;
  });
  els.clearActive.disabled = !activeBarcode;
  if (activeBarcode) showToast(`Barcode captured: ${activeBarcode}`);
}

function setScannerRunning(message) {
  els.status.textContent = message;
  els.start.disabled = true;
  els.stop.disabled = false;
}

async function loadZxing() {
  if (window.ZXingBrowser?.BrowserMultiFormatReader) return window.ZXingBrowser;

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = ZXING_CDN;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Unable to load barcode scanner fallback. Check your internet connection.'));
    document.head.append(script);
  });

  if (!window.ZXingBrowser?.BrowserMultiFormatReader) {
    throw new Error('Barcode scanner fallback did not initialize.');
  }

  return window.ZXingBrowser;
}

async function startScanner() {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera access is unavailable. Use manual entry or open the site over HTTPS.');
    }

    if (!('BarcodeDetector' in window)) {
      await startZxingScanner();
      return;
    }
async function startScanner() {
  if (!('BarcodeDetector' in window)) {
    showToast('BarcodeDetector is unavailable in this browser. Use manual entry.');
    return;
  }

  try {
    const supported = await BarcodeDetector.getSupportedFormats();
    const formats = SCAN_FORMATS.filter((format) => supported.includes(format));
    if (formats.length === 0) throw new Error('No supported barcode formats found.');
    detector = new BarcodeDetector({ formats });
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    els.video.srcObject = stream;
    await els.video.play();
    setScannerRunning('Scanning');
    els.status.textContent = 'Scanning';
    els.start.disabled = true;
    els.stop.disabled = false;
    scanTimer = window.setInterval(scanFrame, 450);
  } catch (error) {
    showToast(`Unable to start camera: ${error.message}`);
    stopScanner();
  }
}

async function startZxingScanner() {
  const zxing = await loadZxing();
  const reader = new zxing.BrowserMultiFormatReader();
  setScannerRunning('Scanning');

  zxingControls = await reader.decodeFromVideoDevice(undefined, els.video, (result) => {
    if (!result) return;
    setActiveBarcode(result.getText());
    stopScanner();
  });
}

async function scanFrame() {
  if (!detector || els.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
  try {
    const barcodes = await detector.detect(els.video);
    if (barcodes.length > 0) {
      setActiveBarcode(barcodes[0].rawValue);
      stopScanner();
    }
  } catch (error) {
    showToast(`Scan error: ${error.message}`);
  }
}

function stopScanner() {
  window.clearInterval(scanTimer);
  zxingControls?.stop();
  zxingControls = undefined;
  stream?.getTracks().forEach((track) => track.stop());
  stream = undefined;
  els.video.srcObject = null;
  els.status.textContent = 'Idle';
  els.start.disabled = false;
  els.stop.disabled = true;
}

function renderRecords() {
  els.count.textContent = records.length.toString();
  els.exportCsv.disabled = records.length === 0;
  els.clearAll.disabled = records.length === 0;

  if (records.length === 0) {
    els.body.innerHTML = '<tr><td colspan="7" class="empty-state">No scans yet.</td></tr>';
    return;
  }

  els.body.replaceChildren(...records.map((record) => {
    const row = document.createElement('tr');
    [record.barcode, record.caseLength, record.caseWidth, record.caseHeight, record.weightKg, record.eaBox, new Date(record.scannedAt).toLocaleString()]
      .forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
    return row;
  }));
}

function toCsvValue(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function exportCsv() {
  const headers = ['Barcode', 'Case Length', 'Case Width', 'Case Height', 'Weight (kg)', 'EA/Box', 'Scanned At'];
  const rows = records.map((record) => [record.barcode, record.caseLength, record.caseWidth, record.caseHeight, record.weightKg, record.eaBox, record.scannedAt]);
  const csv = [headers, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: `article-master-${new Date().toISOString().slice(0, 10)}.csv` });
  link.click();
  URL.revokeObjectURL(url);
}

els.start.addEventListener('click', startScanner);
els.stop.addEventListener('click', stopScanner);
els.clearActive.addEventListener('click', () => setActiveBarcode(''));
els.exportCsv.addEventListener('click', exportCsv);
els.clearAll.addEventListener('click', () => {
  if (!confirm('Delete all locally stored records?')) return;
  records = [];
  persistRecords();
  renderRecords();
});
els.manualForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!els.manualBarcode.value.trim()) return;
  setActiveBarcode(els.manualBarcode.value);
  els.manualBarcode.value = '';
});
els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(els.form);
  records.push({ barcode: activeBarcode, caseLength: data.get('caseLength'), caseWidth: data.get('caseWidth'), caseHeight: data.get('caseHeight'), weightKg: data.get('weightKg'), eaBox: data.get('eaBox'), scannedAt: new Date().toISOString() });
  persistRecords();
  els.form.reset();
  setActiveBarcode('');
  renderRecords();
  showToast('Record saved locally.');
});

renderRecords();
